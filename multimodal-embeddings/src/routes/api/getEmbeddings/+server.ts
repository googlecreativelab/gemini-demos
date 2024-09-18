import { json } from '@sveltejs/kit';
import { getEmbeddings } from '$lib/embedder';
import type { EmbeddingRequest } from '$lib/api.js';

/**
 * Search API method using image embeddings for use in the /search route
 * @param request
 * @returns the embeddings and the results of the vector search
 */
export async function POST({ request }) {
	try {
		const embedRequest = (await request.json()) as EmbeddingRequest;
		console.log('/api/getEmbeddings:', embedRequest);

		const embeddings = await getEmbeddings(embedRequest);
		// console.log('embedResult:', embeddings);

		return json({ embeddings });
	} catch (error) {
		console.error(error);
		return json({ error });
	}
}
