import { json } from '@sveltejs/kit';
import { listCollections } from '$lib/cloud-firebase';

/**
 * Search API method using image embeddings for use in the /search route
 * @param request
 * @returns the embeddings and the results of the vector search
 */
export async function POST() {
	try {
		const collections = await listCollections();
		console.log('/api/listCollections:', collections);

		return json({ collections });
	} catch (error) {
		console.error(error);
		return json({ error });
	}
}
