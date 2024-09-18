<script lang="ts">
	import { Button, Folder, FpsGraph, Pane, Separator, Slider } from 'svelte-tweakpane-ui';
	import { remapFn, umapParams } from '$lib/store';

	// anchors
	let learnMore: HTMLAnchorElement;
	let firestorage: HTMLAnchorElement;
</script>

<div>
	<a
		hidden
		href="https://pair-code.github.io/understanding-umap/"
		bind:this={learnMore}
		target="_blank">Learn about UMAP</a
	>
	<a
		hidden
		href="https://firebase.corp.google.com/project/cl-demos/storage/cl-demos.appspot.com/files/~2Fmmembed"
		bind:this={firestorage}
		target="_blank">Demo cloud storage</a
	>
	<Pane position="fixed" title="Settings">
		<Folder title="UMAP" expanded>
			<Slider label="Dimensions" bind:value={$umapParams.nComponents} step={1} min={2} max={3} />
			<Slider label="Neighbors" bind:value={$umapParams.nNeighbors} step={1} min={1} max={25} />
			<Slider label="Epochs" bind:value={$umapParams.nEpochs} step={10} min={100} max={1000} />
			<Slider
				label="Min Distance"
				bind:value={$umapParams.minDist}
				step={0.1}
				min={0.1}
				max={3.0}
			/>
			<Slider label="Spread" bind:value={$umapParams.spread} step={0.1} min={0.1} max={5.0} />
			<Button label="Update UMAP" title="Remap" on:click={$remapFn} />
			<Separator />
			<Button title="Add Images to Cloud Storage" on:click={() => firestorage.click()} />
			<Separator />
			<Button title="Learn More About UMAP" on:click={() => learnMore.click()} />
		</Folder>
		<Folder title="Rendering Activity">
			<FpsGraph />
		</Folder>
	</Pane>
</div>
