<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Card from 'smelte/src/components/Card';
	import Button from 'smelte/src/components/Button';

	export let isVisible = false;

	interface DialogEvents {
		close: void;
	}

	const dispatch = createEventDispatcher<DialogEvents>();
	function onClose() {
		dispatch('close');
	}
</script>

{#if isVisible}
	<Card.Card class="dialog over-map absolute bg-white w-full bottom-0">
		<div slot="text" class="p-2 flex flex-col h-full">
			<nav>
				<Button color="primary" icon="arrow_back_ios" text light flat on:click={onClose} />
			</nav>
			<section class="flex-1 overflow-y-auto px-4">
				<slot />
			</section>
		</div>
	</Card.Card>
{/if}

<style>
	:global(.dialog) {
		height: 90vh;
		animation: swipeUp 0.5s ease-in-out;
	}
	@keyframes swipeUp {
		from {
			transform: translateY(90vh);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
