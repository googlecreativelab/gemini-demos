import { json } from '@sveltejs/kit';
import { vectorSearch } from '$lib/cloud-firebase';

/**
 * Search API method using image embeddings for use in the /search route
 * @param request
 * @returns the embeddings and the results of the vector search
 */
export async function POST({ request }) {
	try {
		const body = await request.json();

		console.log('/api/search:', body);

		const searchResultDocs = await vectorSearch(body.collection, body.embeddings);
		const searchResults = searchResultDocs.map((doc) => doc.data());

		return json({ searchResults });
	} catch (error) {
		console.error(error);
		return json({ error });
	}
}
