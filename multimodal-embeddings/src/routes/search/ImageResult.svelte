<script lang="ts">
	import type { StoredImage } from '$lib/api';
	import { getThumb } from '$lib/firebase';
	import { onMount } from 'svelte';

	export let result: StoredImage;
	let img: HTMLImageElement;

	onMount(async () => {
		img.src = await getThumb(result.filePath);
	});
</script>

<div class="flex {$$props.class}">
	<img bind:this={img} class="" alt="Thumbnail" />
</div>
