<script lang="ts">
	let dropDiv: HTMLDivElement;

	export let droppedFile: File;

	const preventDrag = (event: DragEvent) => event.preventDefault();

	const hideDroppable = () => {
		dropDiv.style.opacity = '0';
	};

	const onDragEnter = (e: DragEvent) => {
		e.preventDefault();
		dropDiv.style.opacity = '0.2';
	};

	const onDragLeave = (e: DragEvent) => {
		e.preventDefault();
		hideDroppable();
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		hideDroppable();

		const file = e.dataTransfer?.files[0];

		// Check if the file is an image
		if (file && file.type.match(/image\/.*/)) {
			console.log(file);
			droppedFile = file;
		}
	};
</script>

<svelte:document
	on:dragenter={onDragEnter}
	on:dragover={preventDrag}
	on:dragleave={onDragLeave}
	on:drop={onDrop}
/>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={dropDiv}
	on:dragenter={onDragEnter}
	on:dragover={onDragLeave}
	on:drop={onDrop}
	class="pointer-events-none absolute top-0 h-svh w-full bg-red-900 opacity-0 transition-opacity"
></div>
