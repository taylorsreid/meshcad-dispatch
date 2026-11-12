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

		<!-- make sure to include classes={{ input: "appearance-auto" }} or the two component libs will conflict -->
		<Checkbox checked name="remember_me" classes={{ input: "appearance-auto" }}>Remember me?</Checkbox>
        <Button type="submit">Login</Button>
		
		{#if form}
			<div class="text-center text-red-600">{form}</div>
		{/if}
	</form>
</Intro>
