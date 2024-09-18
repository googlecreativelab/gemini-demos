import { writable } from 'svelte/store';
import type { UMAPParameters } from 'umap-js';
import type { DocumentData } from 'firebase/firestore';

export type ImageData = {
	collection: string;
	doc: DocumentData;
	umap?: number[];
	label?: string;
	ref?: any;
};

export type ImageCollection = {
	name: string;
	images: ImageData[];
};

// component access hack
type RemapFunction = () => Promise<void>;
export const remapFn = writable<RemapFunction>();

export const collections = writable<ImageCollection[]>([]);
export const allImages = writable<ImageData[]>([]);

// Settings

// UMAP bindings

export const umapParams = writable<UMAPParameters>({
	nComponents: 3,
	nNeighbors: 15,
	nEpochs: 400,
	minDist: 0.5,
	spread: 1.5
});
