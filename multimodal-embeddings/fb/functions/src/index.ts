import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getEmbeddings } from './../../../src/lib/embedder';
import { getImageLabel } from './gemini';
import * as logger from 'firebase-functions/logger';
import * as path from 'path';
import * as sharp from 'sharp';

// For storage access
initializeApp();
const fs = getFirestore(''); // your firestore database
const bucketName = ''; // your bucket name
const bucketWithPrefix = `gs://${bucketName}`;

const mmEmbedBasePath = 'mmembed'; // path we look at for files to be added
const mmEmbedWLabelBasePath = 'mmembed-labeled';

export const onFileUploaded = onObjectFinalized(
	{ cpu: 2, memory: '2GiB', bucket: bucketName },
	async (event) => {
		const fileBucket = event.data.bucket; // Storage bucket containing the file.
		const filePath = event.data.name; // File path in the bucket.
		const contentType = event.data.contentType || ''; // File content type.

		logger.info('bucketPrefix!', bucketWithPrefix);
		logger.info('File uploaded!', filePath, contentType);

		// Exit if this is triggered on a file that is not an image.
		if (!contentType.startsWith('image/')) {
			return logger.warn('This is not an image.');
		}
		// Exit if the image is already a thumbnail.
		const fileName = path.basename(filePath);
		if (fileName.startsWith('thumb_')) {
			return logger.warn('Already a Thumbnail.');
		}

		// Make sure we only act on mmembed uploads
		const dirs = path.dirname(filePath).split('/');
		if (dirs.length && !dirs[0].startsWith(mmEmbedBasePath)) {
			return logger.warn('Not a mmembed-* upload.');
		}

		// Create thumbnail -> maybe label -> embed -> store
		// Error out if any of these steps fail
		try {
			const { imageBuffer, thumbFilePath } = await createThumbnail(
				fileBucket,
				filePath,
				contentType
			);
			console.log('thumbpath:', thumbFilePath);

			let embedResult;
			let suffix = '';
			let label = '';
			if (dirs[0] == mmEmbedWLabelBasePath) {
				// -labeled folder upload, so get gemini to label the image!
				console.log(`content: ${contentType} typeof ${typeof contentType}`);
				label = await getImageLabel(imageBuffer, contentType);
				embedResult = await getEmbeddings({ text: label, imageBytes: imageBuffer });
				suffix = '-labeled';
			} else {
				// only an image
				embedResult = await getEmbeddings({ imageBytes: imageBuffer });
			}
			console.log('EmbededImage result', embedResult);

			const storeResult = await storeEmbeddings(
				filePath,
				thumbFilePath,
				embedResult.imageEmbeddings,
				dirs[1] + suffix, // dir name and whether or not its labeled, used as collection
				label
			);
			console.log('Creation success!', storeResult.id);
		} catch (err) {
			console.error('Failed to store embeddings for image.', err);
			return;
		}
	}
);

const storeEmbeddings = async (
	filePath: string,
	thumbPath: string,
	embeddings: number[],
	collectionName: string,
	label: string = ''
) => {
	const coll = fs.collection(collectionName);
	const data = {
		filePath,
		thumbPath,
		embeddings: FieldValue.vector(embeddings)
	};
	if (label) {
		data['label'] = label;
	}
	return await coll.add(data);
};

const createThumbnail = async (fileBucket: string, filePath: string, contentType: string) => {
	const fileName = path.basename(filePath);

	// Download file into memory from bucket.
	const bucket = getStorage().bucket(fileBucket);
	const downloadResponse = await bucket.file(filePath).download();
	const imageBuffer = downloadResponse[0];

	const thumbnailBuffer = await sharp(imageBuffer)
		.resize({
			height: 200,
			fit: 'contain',
			withoutEnlargement: true
		})
		.toBuffer();

	// Prefix 'thumb_' to file name.
	const thumbFileName = `thumb_${fileName}`;
	const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);

	// Upload the thumbnail.
	const metadata = { contentType };
	await bucket.file(thumbFilePath).save(thumbnailBuffer, {
		metadata
	});
	logger.log(`Thumbnail uploaded! ${thumbFilePath}}`);
	return { imageBuffer, thumbFilePath };
};
