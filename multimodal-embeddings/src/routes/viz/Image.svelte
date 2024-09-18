<svelte:options accessors />

<script lang="ts">
	import { getThumb } from '$lib/firebase';
	import { T } from '@threlte/core';
	import { SpriteMaterial, Texture, SRGBColorSpace, Vector3 } from 'three';
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';
	import { writable, type Writable } from 'svelte/store';
	import type { InteractionEvent } from '$lib/api';
	import type { ImageData } from '$lib/store';

	export let created;
	export let imageData: ImageData;
	export let texLoader;
	export let clickHandler;

	$: if (imageData.umap) {
		// console.log('update'); works
		pos.set(new Vector3(imageData.umap[0], imageData.umap[1], imageData.umap[2]));
	}
	export let pos: Writable<Vector3> = writable(new Vector3());

	let texture: Texture;
	let mat: SpriteMaterial;

	const scale = spring(1);

	const onEnter = (e: InteractionEvent) => {
		e.stopPropagation();
		scale.set(1.4);
	};

	const onLeave = (e: InteractionEvent) => {
		e.stopPropagation();
		scale.set(1.0);
	};

	const getTexture = async () => {
		const imgUrl = await getThumb(imageData.doc.thumbPath);
		texture = await texLoader.load(imgUrl);
		texture.colorSpace = SRGBColorSpace; // important!
		mat = new SpriteMaterial({ map: texture });
	};

	onMount(() => {
		getTexture();
	});
</script>

{#if mat}
	<T.Sprite
		on:create={({ ref, cleanup }) => {
			created(ref);
			cleanup(() => {
				if (texture) texture.dispose();
			});
		}}
		position.x={$pos.x}
		position.y={$pos.y}
		position.z={$pos.z}
		scale={$scale}
		on:pointerenter={onEnter}
		on:pointerleave={onLeave}
		on:click={clickHandler}
		material={mat}
	/>
{/if}
