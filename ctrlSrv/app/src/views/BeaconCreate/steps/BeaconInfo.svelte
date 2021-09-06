<script lang="ts">
	import TextField from 'smelte/src/components/TextField';
	import Button from 'smelte/src/components/Button';
	import Dialog from '$src/components/Dialog/Dialog.svelte';
	import { createStepNavigationEvents } from './steps.events';
	import type { Beacon } from '$src/interfaces/beacon.interface';
	import { creatingBeacon } from '$src/streams/beacons';

	const { next, previous } = createStepNavigationEvents();

	let form = {
		mac: {
			error: 'Please enter a valid MAC address',
			pattern: '^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$',
			valid: true
		},
		name: {
			error: 'Please enter a valid name',
			pattern: '^[a-zA-Z0-9_]*$',
			valid: true
		},
		tssi: {
			error: 'Please enter a valid TSII',
			pattern: '[0-9]+',
			valid: true
		},
		channel: {
			error: 'Please enter a valid channel',
			pattern: '[0-9]+',
			valid: true
		}
	};
	type Form = typeof form;

	function onInput(e: Event) {
		const inputHtml = e.target as HTMLInputElement;
		valid(inputHtml);
	}

	function valid(el: HTMLInputElement) {
		const name = el.name as keyof Form;
		const input = form[name];
		input.valid = el.checkValidity();
		form = form; // force update changinf the reference
	}

	function onSubmit(e: Event) {
		const formElement = e.target as HTMLFormElement;
		const formData = new FormData(formElement);

		const beacon: Partial<Beacon> = {
			mac: formData.get('mac') as string,
			name: formData.get('name') as string,
			tssi: parseInt(formData.get('tssi') as string, 10),
			channel: parseInt(formData.get('channel') as string, 10)
		};

		creatingBeacon.next(beacon);

		next();
	}
</script>

<Dialog isVisible={true} fullHeight={true} on:close={previous}>
	<h4>Create Beacons</h4>
	<form action="#" on:submit|preventDefault={onSubmit}>
		<TextField
			name="mac"
			label="Mac"
			pattern={form.mac.pattern.toString()}
			error={form.mac.valid ? '' : form.mac.error}
			required
			on:input={onInput}
		/>
		<TextField name="name" pattern={form.name.pattern} label="Name" required on:input={onInput} />
		<TextField
			name="tssi"
			pattern={form.tssi.pattern}
			type="number"
			label="TSSI"
			required
			on:input={onInput}
		/>
		<TextField
			name="channel"
			pattern={form.channel.pattern}
			type="number"
			label="Channel"
			required
			on:input={onInput}
		/>
		<Button type="submit" block>Create</Button>
	</form>
</Dialog>
