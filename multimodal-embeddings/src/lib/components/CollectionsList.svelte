<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from './ui/button';
	import { postJson } from '$lib/utils';
	import { useEmulator } from '$lib/consts';
	import type { Collection } from '$lib/api';
	import * as DropdownMenu from './ui/dropdown-menu';

	export let selectedCollection: string = 'Loading...';
	export let prefix: string = 'Collection';

	let collections: Collection[];

	const getCollections = async () => {
		const res = await postJson('/api/listCollections', {});
		collections = res.collections;
	};

	// We had built a large Firestore database with many collections of
	// embeddings we were testing with, so a simple dropdown component made
	// lots of sense, but setting it to a single collection (like when we're emulating)
	// works too!
	onMount(async () => {
		if (useEmulator) {
			selectedCollection = 'weather';
		} else {
			await getCollections();
			if (collections.length) {
				// Grab first collection as default if available
				selectedCollection = collections[0].id;
			}
		}
	});
</script>

<div class="flex-c"></div>

<div class={$$props.class}>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button class="min-w-64" builders={[builder]} variant="outline"
				>{prefix}: <span class="ml-2 text-blue-300">{selectedCollection}</span>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="min-w-64">
			{#if collections}
				<DropdownMenu.RadioGroup bind:value={selectedCollection}>
					{#each collections as collection}
						<DropdownMenu.RadioItem value={collection.id}>{collection.id}</DropdownMenu.RadioItem>
					{/each}
				</DropdownMenu.RadioGroup>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
