import { createEventDispatcher } from 'svelte';

interface NavigationActions {
	next: () => void;
	previous: () => void;
}

export function createStepNavigationEvents(): NavigationActions {
	interface Events {
		next: void;
		previous: void;
	}

	const dispatch = createEventDispatcher<Events>();

	const next = () => dispatch('next');
	const previous = () => dispatch('previous');

	return {
		next,
		previous
	};
}
