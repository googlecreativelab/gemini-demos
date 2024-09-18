/**
 * See https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-multimodal-embedding
 * for more info on how this is built.
 */
import * as aiplatform from '@google-cloud/aiplatform';
import type { EmbeddingRequest } from './api';
import { FIREBASE_PROJECT_ID } from './consts';

const { PredictionServiceClient } = aiplatform.v1;
const { helpers } = aiplatform;

const clientOptions = {
	apiEndpoint: 'us-central1-aiplatform.googleapis.com'
};
const project = FIREBASE_PROJECT_ID; // your firebase/cloud project
const location = 'us-central1';
const publisher = 'google';
const model = 'multimodalembedding@001';
const predictionServiceClient = new PredictionServiceClient(clientOptions);
const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;

type Prompt = {
	image?: {
		bytesBase64Encoded: string;
	};
	text?: string;
};

export const getEmbeddings = async (embedRequest: EmbeddingRequest) => {
	// all params:
	// https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/multimodal-embeddings-api#parameter-list

	let prompt: Prompt = {};

	if (embedRequest.imageBytes) {
		let b64 = '';
		if (typeof embedRequest.imageBytes === 'string') {
			b64 = embedRequest.imageBytes;
		} else {
			b64 = embedRequest.imageBytes.toString('base64');
		}
		prompt.image = {
			bytesBase64Encoded: b64
		};
	}
	if (embedRequest.text) {
		prompt.text = embedRequest.text;
	}

	console.log('prompt:', prompt);

	const instanceValue = helpers.toValue(prompt);
	const instances = [instanceValue];

	const parameter = {
		sampleCount: 1
	};
	const parameters = helpers.toValue(parameter);

	const request = {
		endpoint,
		instances,
		parameters
	};

	// Predict request
	const [response] = await predictionServiceClient.predict(request);
	const predictions = response.predictions || [];
	if (predictions && predictions.length > 0) {
		const availableFields = predictions[0].structValue.fields;

		let embedResponse = {};

		if (availableFields.imageEmbedding) {
			embedResponse.imageEmbeddings = availableFields.imageEmbedding.listValue.values.map(
				(vals) => vals.numberValue
			);
		}

		if (availableFields.textEmbedding) {
			embedResponse.textEmbeddings = availableFields.textEmbedding.listValue.values.map(
				(vals) => vals.numberValue
			);
		}
		console.log('Response generated:', embedResponse);
		return embedResponse;
	} else {
		throw Error('Failure to create embeddings');
	}
};
