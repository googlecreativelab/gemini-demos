<script lang="ts">
	import { T, extend, useLoader, useTask, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { allImages, collections, remapFn, umapParams } from '$lib/store';
	import { UMAP } from 'umap-js';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { InteractionEvent } from '$lib/api';
	import Image from './Image.svelte';
	import * as THREE from 'three';

	const texLoader = useLoader(THREE.TextureLoader);
	const { renderer, invalidate } = useThrelte();
	extend({ OrbitControls });

	const enum State {
		Loading = 0,
		GeneratingUmap = 1,
		Ready = 2
	}
	const state = writable<State>(State.Loading);

	let imageGroup = new THREE.Group();
	let boundingBox = new THREE.Box3();
	let boundingCenter = new THREE.Vector3();
	let sphere: THREE.Mesh;
	let creationCount = 0;
	let clickRadius = 1.0;
	let updateUmap = false;

	$: if ($collections.length > 0) {
		//collections changed!
		updateUmap = true;

		allImages.set([...$collections[0].images, ...$collections[1].images]);
	}

	$: if ($allImages.length > 0 && updateUmap) {
		console.log('allImages updated', $allImages.length, $allImages[0].ref);
		updateUMAP();
	}

	// umap always acts upon all images regardless of collection state
	const updateUMAP = async () => {
		creationCount = 0;
		state.set(State.GeneratingUmap);
		console.log('updateUMAP', $umapParams);
		const umap = new UMAP($umapParams);
		const allEmbeddings = $allImages.map((id) => id.doc.embeddings!.value);
		const mapped = await umap.fitAsync(allEmbeddings);

		// add to each image object, which surprisingly triggers reactivity
		$allImages.forEach((id, i) => {
			id.umap = mapped[i];
		});
		console.log('UMAP Updated');
		state.set(State.Ready);
		updateUmap = false;

		// invalidate();

		// we're done, so update url to match for sharing
		// $page.url.searchParams.set(COLLECTION_PARAM, collectionName);
		// goto(`?${$page.url.searchParams.toString()}`);
	};

	const imageCreated = () => {
		creationCount++;
		if (creationCount >= $allImages.length) {
			getNewBoundingBox();
		}
	};

	const getNewBoundingBox = () => {
		boundingBox = boundingBox.setFromPoints(imageGroup.children.map((img) => img.position));
		console.log('getNewBoundingBox', boundingBox);

		//for viewing convenience
		boundingBox.getCenter(boundingCenter);
		boundingCenter = boundingCenter.multiplyScalar(-1);

		imageGroup.position.copy(boundingCenter);
	};

	const onImageClick = (e: InteractionEvent) => {
		e.stopPropagation();
		console.log(e.eventObject.position);
		sphere.position.copy(e.eventObject.position).add(boundingCenter);
		invalidate();

		getAllPointsWithinRadius(e.eventObject.position);
	};

	const getAllPointsWithinRadius = (pos: THREE.Vector3) => {
		$allImages.forEach((item, i) => {
			// const dist = item
		});
	};

	onMount(() => {
		remapFn.set(updateUMAP);
	});

	interactivity();
</script>

<T.AxesHelper />

<T.PerspectiveCamera
	position={[0, 0, 40]}
	makeDefault
	let:ref
	on:create={({ ref }) => {
		ref.lookAt(0, 1, 0);
	}}
>
	<T.OrbitControls args={[ref, renderer.domElement]} on:change={invalidate} />
</T.PerspectiveCamera>

<T is={imageGroup}>
	{#if !boundingBox.isEmpty()}
		<T
			is={THREE.Box3Helper}
			args={[boundingBox]}
			material.depthTest={false}
			material.opacity={0.25}
			material.transparent={true}
			material.color={'white'}
		/>
	{/if}

	{#if $state === State.Ready}
		{#each $allImages as imageData}
			<!-- {#if imageData.umap} -->
			<Image
				bind:this={imageData.ref}
				created={imageCreated}
				clickHandler={onImageClick}
				{texLoader}
				{imageData}
			/>
			<!-- {/if} -->
		{/each}
	{/if}
</T>

<T.Mesh let:ref on:create={({ ref }) => (sphere = ref)}>
	<!-- <T.SphereGeometry args={[clickRadius, 16, 16]} radius={clickRadius} /> -->
	<T.MeshBasicMaterial wireframe={true} color="red" transparent={true} opacity={0.1} />
</T.Mesh>
