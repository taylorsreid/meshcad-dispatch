<script>
  import { setting } from '$live/setting';
</script>

{#each $setting as msg (msg.id)}
  <p>{msg}</p>
{/each}

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>