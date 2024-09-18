/**
 * Yes, there is another firebase.ts in $lib/ but this one has to use
 * special `@google-cloud/firestore` package instead, which contains
 * the necessary VectorQuery findNearest() method and a simple listCollections() method
 */
import { Firestore, FieldValue } from '@google-cloud/firestore';
import type { VectorQuery, VectorQuerySnapshot } from '@google-cloud/firestore';
import { FIRESTORE_DB_ID } from './consts';

const db = new Firestore({ databaseId: FIRESTORE_DB_ID });

export const listCollections = async () => {
	try {
		const collections = await db.listCollections();
		return collections.map((collection) => {
			return { id: collection.id, path: collection.path };
		});
	} catch (error) {
		console.error(error);
		return { error };
	}
};

export const vectorSearch = async (collection: string, imageEmbedding: number[]) => {
	const coll = db.collection(collection);
	const vectorQuery: VectorQuery = await coll.findNearest(
		'embeddings',
		FieldValue.vector(imageEmbedding),
		{
			limit: 30,
			distanceMeasure: 'EUCLIDEAN' // other options COSINE and DOT_PRODUCT
		}
	);
	const snapshot: VectorQuerySnapshot = await vectorQuery.get();
	return snapshot.docs;
};
