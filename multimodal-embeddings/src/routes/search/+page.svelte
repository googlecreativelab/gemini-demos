<script lang="ts">
	import { writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { postJson } from '$lib/utils';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { EmbeddingRequest, SearchRequest, SearchResponse } from '$lib/api';
	import CollectionsList from '$lib/components/CollectionsList.svelte';
	import Droppable from '$lib/components/Droppable.svelte';
	import ImageResult from './ImageResult.svelte';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';

	const enum SearchState {
		Waiting = 'Waiting',
		EmbeddingRequest = 'Embedding request...',
		Searching = 'Searching...'
	}
	let searchState = writable<SearchState>(SearchState.Waiting);

	let inputEl: HTMLInputElement;
	let file: File;
	$: if (file) {
		onFileUpdate();
	}

	let selectedCollection: string;
	let dataURL: string = '';
	let searchText: string = '';
	let searchResponse: SearchResponse | null;
	let errorResponse: string = '';

	const onFilesChange = (e: any) => {
		console.log(e.target.files);
		file = e.target.files[0];
	};

	const onFileUpdate = () => {
		const reader = new FileReader();
		reader.onload = () => {
			dataURL = reader.result as string;
		};
		reader.readAsDataURL(file);
	};

	const search = async () => {
		console.log(searchText, file);
		try {
			errorResponse = '';
			searchResponse = null;

			let embedRequest: EmbeddingRequest = {};

			if (dataURL) {
				embedRequest.imageBytes = dataURL.split(',').pop();
			} // else if <---- this might be necessary if API is ONLY EITHER OR
			if (searchText) {
				embedRequest.text = searchText;
			}
			// first we need to embed the image/text into vector space
			searchState.set(SearchState.EmbeddingRequest);
			const embedResponse = await postJson('/api/getEmbeddings', embedRequest);
			console.log(embedResponse);

			//then we can search against a collection's vector index with that embedding
			searchState.set(SearchState.Searching);
			searchResponse = await postJson('/api/search', {
				embeddings: searchText
					? embedResponse.embeddings.textEmbeddings
					: embedResponse.embeddings.imageEmbeddings,
				collection: selectedCollection
			} as SearchRequest);
			console.log(searchResponse);
		} catch (err: any) {
			console.error('Search Error', err);
			errorResponse = err.details ? err.details.toString() : err;
		} finally {
			searchState.set(SearchState.Waiting);
		}
	};

	const onSearchTextKeyDown = (e: KeyboardEvent) => {
		if (e.key == 'Enter') {
			search();
		}
	};
</script>

<div class="m-auto max-w-5xl p-4">
	<div class="flex w-full flex-row">
		<div class="mr-8 flex max-w-96 flex-col">
			<h2 class="mb-8 text-3xl">My Personal Search</h2>

			<Label for="searchText" class="mb-2">Search within:</Label>
			<CollectionsList class="mb-4" bind:selectedCollection />

			<Label for="searchText" class="mb-2">What are you looking for?</Label>
			<Input
				id="searchText"
				class="mb-4"
				bind:value={searchText}
				placeholder={'"fuzzy images"'}
				on:keydown={onSearchTextKeyDown}
			/>

			<input type="file" bind:this={inputEl} hidden accept="image/*" on:change={onFilesChange} />
			<Label for="searchText" class="mb-2">Or Search by Image:</Label>
			<Button variant="outline" class="mb-4" on:click={() => inputEl.click()}
				>Choose image (or drag and drop)
			</Button>

			{#if file}
				<div class="mb-4">
					<img src={dataURL} class="mx-auto my-0 max-h-48" alt="Searchable input" />
				</div>
			{/if}

			<Button on:click={search} disabled={dataURL.length == 0 && searchText.length == 0}
				>Search</Button
			>

			{#if $searchState != SearchState.Waiting}
				<div class="mt-8 flex flex-row items-center">
					<LoaderCircle class="mr-2 animate-spin" />
					<p class="text-sm">{$searchState}</p>
				</div>
			{/if}
			{#if errorResponse.length > 0}
				<div class="mt-8 w-full border-2 border-solid border-red-500 p-4 text-center">
					<p class="text-lg text-red-500">
						{errorResponse}
					</p>
				</div>
			{/if}
		</div>
		<div class="w-full">
			{#if searchResponse}
				<section class="grid grid-cols-2 gap-4">
					{#each searchResponse.searchResults as result}
						<ImageResult class="mb-4 rounded-lg bg-gray-900 p-4" {result} />
					{/each}
				</section>
			{/if}
		</div>
	</div>
</div>
<Droppable bind:droppedFile={file} />
