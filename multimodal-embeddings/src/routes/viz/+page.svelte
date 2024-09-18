<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { allDocsInCollection } from '$lib/firebase';
	import { collections, type ImageCollection, type ImageData } from '$lib/store';
	import CollectionsList from '$lib/components/CollectionsList.svelte';
	import Viz from './Viz.svelte';
	import Settings from './Settings.svelte';

	const COLLECTION_PARAM = 'collection';
	const DEFAULT_COLLECTION = 'weather'; // default is our public weather dataset

	// Originally only a visualizer of a single dataset, we started working towards comparing sets
	// but it didn't make it in this repo. Now it's just an easy way to view two collections at once.

	let collection1: ImageCollection;
	let collection2: ImageCollection;
	let collection1name = '';
	let collection2name = '';
	$: if (collection1name != '' && collection2name != '') {
		console.log('Collections Updated:', collection1name, collection2name);
		getAllEmbeddings();
	}

	const getAllEmbeddings = async () => {
		collection1 = await getCollectionData(collection1name);
		collection2 = await getCollectionData(collection2name);

		collections.set([collection1, collection2]);
	};

	const getCollectionData = async (collectionName: string) => {
		try {
			console.log('getCollectionData()', collectionName);
			//  can throw error if collection doesnt exist
			const allDocsSnap = await allDocsInCollection(collectionName);
			const images: ImageData[] = [];
			allDocsSnap.forEach((doc) => {
				const imageData: ImageData = {
					doc: doc.data(),
					collection: collectionName
				};
				images.push(imageData);
			});

			const collection: ImageCollection = { name: collectionName, images };
			return collection;
		} catch (err) {
			// kinda big deal but we can ignore for now
			console.error(err);
			return;
		}
	};

	onMount(async () => {
		const collection = $page.url.searchParams.get(COLLECTION_PARAM);
		if (collection) {
			collection1name = collection;
		} else {
			collection1name = DEFAULT_COLLECTION;
		}
	});
</script>

<div class="flex h-screen w-full flex-col">
	<Viz />
	<div
		class="absolute m-2 flex max-w-md flex-col rounded-lg border-2 border-solid border-gray-900 p-4 backdrop-blur"
	>
		<h1 class="mb-4 text-2xl">The Comparator</h1>
		<p class="mb-2 text-sm">Choose two <s>or more</s> collections below to compare:</p>
		<CollectionsList prefix="Collection 1" bind:selectedCollection={collection1name} />
		<CollectionsList prefix="Collection 2" bind:selectedCollection={collection2name} />
	</div>

	<Settings />
</div>
