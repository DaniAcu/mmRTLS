<script>
  import Card from "smelte/src/components/Card";
  import { expoIn } from "svelte/easing"

  export let isVisible = false;
  
</script>

<style>
  :global(.dialog) {
    height: 90vh;
    animation: swipeUp 0.5s ease-in-out;
  }

  @keyframes swipeUp {
    from { transform: translateY(90vh); }
    to { transform: translateY(0); }
  }
</style>

{#if isVisible}
  <Card.Card class="dialog over-map absolute bg-white w-full bottom-0">
    <div slot="text" class="p-5">
      <slot></slot>
    </div>
  </Card.Card>
{/if}
