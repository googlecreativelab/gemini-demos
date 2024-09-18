import * as THREE from 'three';

export type StoredImage = {
	embeddings: number[];
	filePath: string;
	thumbPath: string;
	label?: string;
};

export type EmbeddingRequest = {
	imageBytes?: Buffer | string;
	text?: string;
};

export type SearchRequest = {
	collection: string;
	embeddings: number[];
};

export type SearchResponse = {
	embeddings: number[];
	searchResults: StoredImage[];
};

export type Collection = {
	id: string;
	path: string;
};

// typescript helper since all threlte events use it and its not exported
export type InteractionEvent = THREE.Intersection & {
	intersections: THREE.Intersection[]; // The first intersection of each intersected object
	object: THREE.Object3D; // The object that was actually hit
	eventObject: THREE.Object3D; // The object that registered the event
	camera: THREE.Camera; // The camera used for raycasting
	delta: THREE.Vector2; //  Distance between mouse down and mouse up event in pixels
	nativeEvent: MouseEvent | PointerEvent | WheelEvent; // The native browser event
	pointer: THREE.Vector2; // The pointer position in normalized device coordinates
	ray: THREE.Ray; // The ray used for raycasting
	stopPropagation: () => void; // Function to stop propagation of the event
	stopped: Boolean; // Whether the event propagation has been stopped
};
