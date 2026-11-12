<script lang="ts">
   import { Button } from "svelte-ux";
   import type { PageProps } from "./$types";
   let { data }: PageProps = $props();
   let selectedRoleId = $state(data.user.roles.find((r) => r.selected)?.id);
</script>

<svelte:head>
	<title>Select Role</title>
	<meta name="description" content="Learn more about our team." />
</svelte:head>

<h1 class="text-center text-2xl">Select Role</h1>

<form method="POST" class="grid gap-2">
   {#each data.user.roles as role}
      <Button
         disabled={role.selected ?? false}
         label={role.name}
         on:click={() => selectedRoleId = role.id}
         type="submit">{role.name}</Button
      >
   {/each}
   <input hidden bind:value={selectedRoleId} name="new_role_id" />
</form>
