<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	// necessary so Scene already inside the 'context' of Canvas
	// see threlte docs for reason:
	// https://threlte.xyz/docs/learn/basics/app-structure#context-not-available
</script>

<div class="flex-1">
	<Canvas>
		<Scene />
	</Canvas>
</div>
<div class="absolute bottom-0">
	<h1>Selected:</h1>
</div>
