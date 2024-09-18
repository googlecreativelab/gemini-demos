import { UMAP, type UMAPParameters } from 'umap-js';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
	try {
		const data = await request.json();

		const modelOpts: UMAPParameters = {
			nComponents: data.dimensions,
			nEpochs: data.epochs,
			nNeighbors: data.neighbors,
			minDist: data.minDist,
			spread: data.spread
		};
		console.debug(modelOpts);

		const model = new UMAP(modelOpts);
		const mapped = await model.fitAsync(data.embeddings);
		console.log(mapped[0]);

		return json({ data: mapped });
	} catch (err) {
		console.error(err);
		return json({ err });
	}
};
