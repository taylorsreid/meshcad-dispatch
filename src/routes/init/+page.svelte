<script lang="ts">
	import Intro from "$lib/components/intro.svelte";
	import type { PageProps } from './$types';
	let { form }: PageProps = $props();
	let password: string = $state("")
	let confirmPassword: string = $state("")
</script>

<style>
	.error {
		color: red;
		text-align: center;
		font-size: smaller;
	}
</style>

<Intro>
	<div style="padding-bottom: 3.5vh;">Let's create your first administrator account:</div>
	<form method="POST" class="grid-form">
		<label for="email">Email:</label>
		<input id="email" name="email"  type="email" />
		{#if form?.emailMissing}
			<div></div>
			<div class="error">Email is required.</div>
		{/if}

		<label for="password">Password:</label>
		<input id="password" name="password"  type="password" bind:value={password} />
		{#if form?.passwordMissing}
			<div></div>
			<div class="error">Password is required.</div>
		{/if}

		<label for="confirm_password">Confirm Password:</label>
		<input id="confirm_password" name="confirm_password"  type="password" bind:value={confirmPassword} />
		{#if confirmPassword !== "" && confirmPassword !== password}
			<div></div>
			<div class="error">Passwords do not match.</div>
		{/if}

		<label for="first_name">First Name:</label>
		<input id="first_name" name="first_name"  type="text" />
		{#if form?.firstNameMissing}
			<div></div>
			<div class="error">First Name is required.</div>
		{/if}

		<label for="last_name">Last Name:</label>
		<input id="last_name" name="last_name"  type="text" />
		{#if form?.lastNameMissing}
			<div></div>
			<div class="error">Last Name is required.</div>
		{/if}

		<label for="remember_me">Remember me?</label>
		<input id="remember_me" name="remember_me" type="checkbox">

		<button disabled={password !== confirmPassword}>Register</button>
	</form>
</Intro>
