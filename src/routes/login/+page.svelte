<script lang="ts">
	import Intro from "$lib/components/intro.svelte";
	import type { PageProps } from "./$types";
	import { TextField, Checkbox, Button } from "svelte-ux"

	let { form }: PageProps = $props();
</script>

<Intro>
	<form method="POST" class="grid gap-2">
		<TextField
			label="Email"
			name="email"
			required
		/>

		<TextField
			label="Password"
			type="password"
			name="password"
			required
		/>

		<Checkbox checked name="remember_me">Remember me?</Checkbox>
        <Button type="submit">Login</Button>
		
		{#if form}
			<div class="text-center text-red-600">{form}</div>
		{/if}
	</form>
</Intro>
