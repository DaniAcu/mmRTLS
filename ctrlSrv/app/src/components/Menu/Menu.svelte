<script lang="ts">
  import Button from "smelte/src/components/Button";

  export const isDefaultOpen = false;

  let isOpen = isDefaultOpen;
  let menu = {
    icon: "menu",
    className: "menu-content--open"
  }

  $: {
    menu.icon = isOpen ? "expand_more" : "expand_less";
    menu.className = isOpen ? "menu-content--open" : "";
  }

  const toggleOpen = () => {
    isOpen = !isOpen;
  }

</script>

<section class="menu relative">
  <div class="menu-actions">
    <Button color="primary" icon={menu.icon} on:click={toggleOpen}/>
  </div>
  <section class={`menu-content overflow-hidden shadow ${menu.className}`}>
    <div class="menu-content-options p-5">
      <slot></slot>
    </div>
  </section>
</section>

<style>
  .menu {
    /* Leaflet z-index by default */
    z-index: 523;
  }

  .menu-actions {
    position: absolute;
    top: -80px;
    right: 1.5rem;
  }

  .menu-content {
    height: 0;
    box-shadow: 0px -10px 16px 0 rgb(0 0 0 / 10%);
    transition: .3s height ease;
  }

  .menu-content--open {
    height: 30vh;
    max-height: 30vh;
  }

  .menu-content-options {
    overflow: auto;
    max-height: 100%;
  }
</style>
