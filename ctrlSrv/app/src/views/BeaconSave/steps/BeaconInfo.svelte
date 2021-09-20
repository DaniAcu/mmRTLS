<script lang="ts">
	import TextField from 'smelte/src/components/TextField';
	import Button from 'smelte/src/components/Button';
	import Dialog from '$src/components/Dialog/Dialog.svelte';
	import { createStepNavigationEvents } from './steps.events';
	import type { Beacon } from '$src/interfaces/beacon.interface';
	import { BeaconController } from '$src/streams/beacons/beacons.controller';

	const { next, previous } = createStepNavigationEvents();
	const defaultBeacon = BeaconController.get();

	let form = {
		mac: {
			error: 'Please enter a valid MAC address',
			pattern: '^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$',
			valid: true,
			value: defaultBeacon?.mac || ''
		},
		name: {
			error: 'Please enter a valid name',
			pattern: '^[a-zA-Z0-9_]*$',
			valid: true,
			value: defaultBeacon?.name || ''
		},
		tssi: {
			error: 'Please enter a valid TSII',
			pattern: '[0-9]+',
			valid: true,
			value: defaultBeacon?.tssi?.toString() || ''
		},
		channel: {
			error: 'Please enter a valid channel',
			pattern: '[0-9]+',
			valid: true,
			value: defaultBeacon?.channel?.toString() || ''
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

		const prevBeacon = BeaconController.get();

		const beacon: Partial<Beacon> = {
			...prevBeacon,
			mac: formData.get('mac') as string,
			name: formData.get('name') as string,
			tssi: parseInt(formData.get('tssi') as string, 10),
			channel: parseInt(formData.get('channel') as string, 10)
		};

		BeaconController.add(beacon);

		next();
	}
</script>

<Dialog isVisible={true} fullHeight={true} on:close={previous}>
	<h4>Beacons Info</h4>
	<form action="#" on:submit|preventDefault={onSubmit}>
		<TextField
			name="mac"
			label="Mac"
			pattern={form.mac.pattern.toString()}
			error={form.mac.valid ? '' : form.mac.error}
			bind:value={form.mac.value}
			required
			on:input={onInput}
		/>
		<TextField
			name="name"
			pattern={form.name.pattern}
			label="Name"
			error={form.name.valid ? '' : form.name.error}
			bind:value={form.name.value}
			required
			on:input={onInput}
		/>
		<TextField
			name="tssi"
			pattern={form.tssi.pattern}
			type="number"
			label="TSSI"
			error={form.tssi.valid ? '' : form.tssi.error}
			bind:value={form.tssi.value}
			required
			on:input={onInput}
		/>
		<TextField
			name="channel"
			pattern={form.channel.pattern}
			type="number"
			label="Channel"
			error={form.channel.valid ? '' : form.channel.error}
			bind:value={form.channel.value}
			required
			on:input={onInput}
		/>
		<Button type="submit" block>Save</Button>
	</form>
</Dialog>
