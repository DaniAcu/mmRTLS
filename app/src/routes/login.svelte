<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import { goto } from '$app/navigation';
 
  let email = "";
  let pass = "";

  function onSubmit (e: Event) {
    e.preventDefault();
    console.log({
      email,
      pass
    });
    goto("/");
  }

</script>

<div class="login login-page flex">
  <header class="header center">
    <h1 class="mdc-typography--headline4">Welcome</h1>
  </header>
  <main class="main center">
    <form class="flex" action="#" on:submit={onSubmit}>
      <div class="flex text-field-group">
        <Textfield type="email" bind:value={email} label="Email"/>
        <Textfield type="password" bind:value={pass} label="Password"/>
      </div>
      <Button type="submit" variant="raised">
        <Label>Login</Label>
      </Button>
    </form>
  </main>
</div>

<style>

  /* FORCE MOBILE */
  :global(body) {
    max-width: 26rem;
    height: 100%;
    margin: auto;
  }
  .flex {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login .header {
    clip-path: polygon(100% 0, 100% 100%, 51% 88%, 0 100%, 0 0);
    flex: 2;
    background-color: var(--mdc-theme-primary);
    color: var(--mdc-theme-surface);
  }

  .login .main {
    flex: 1;
  }

  .login-page {
    height: 100vh;
  }

  .login-page > * {
    padding: 1rem;
  }

  .text-field-group {
    padding-bottom: 1rem;
  }
  
</style>


