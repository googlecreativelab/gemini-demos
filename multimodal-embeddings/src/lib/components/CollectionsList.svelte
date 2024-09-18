<script lang="ts">
	import { onMount } from 'svelte';
	import * as DropdownMenu from './ui/dropdown-menu';
	import { Button } from './ui/button';
	import { postJson } from '$lib/utils';
	import type { Collection } from '$lib/api';
	// Must use this component within a +page.svelte in order to take advantage
	// of $page.data which should expose a load() function that has collections
	export let selectedCollection: string = 'Loading...';
	export let prefix: string = 'Collection';
	let collections: Collection[];

	const getCollections = async () => {
		const res = await postJson('/api/listCollections', {});
		collections = res.collections;
	};

	onMount(() => {
		getCollections();
		// set default here
		selectedCollection = '';
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
