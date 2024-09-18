import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(''); // key from your console or .env file
const model = genAI.getGenerativeModel({
	model: 'gemini-1.5-pro-latest'
});

function getImagePart(buffer, mimeType) {
	return {
		inlineData: {
			data: Buffer.from(buffer).toString('base64'),
			mimeType
		}
	};
}

export const getImageLabel = async (imageBuffer: Buffer, mimeType: string) => {
	console.log('getImageLabel', mimeType);
	const imagePart = getImagePart(imageBuffer, mimeType);
	const prompt =
		'Generate a concise description for this image, to be used in the generation of vector embeddings.';
	try {
		const content = await model.generateContent([imagePart, prompt]);
		const text = content.response.text();
		console.log('Generated Label:', text);
		return text;
	} catch (err) {
		console.error(err);
		throw err;
	}
};
