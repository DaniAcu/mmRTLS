<script lang="ts">
  import type { NavDevice } from "../../interfaces/beacon.interface";
  import type { Marker } from "../../streams/marker.types";
  import Dialog from "../../components/Dialog/Dialog.svelte";
  import { markerSubject } from "../../streams/markers-interactions";

  export let navDevice: Marker<NavDevice> | null = null;

  function onClose() {
    markerSubject.next(null);
  }

</script>

<Dialog isVisible={!!navDevice} on:close={onClose}>
  <h3>Nav device</h3>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
    consectetur, nisl eget consectetur tempor, nisl nunc ultrices eros,
    eu porttitor nisl nunc eget nisl.
  </p>
</Dialog>