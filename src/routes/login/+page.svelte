<script lang="ts">
    import { enhance } from "$app/forms";
	import Intro from "$lib/components/intro.svelte";
    import type { PageProps } from "../$types";

	let { form }: PageProps = $props();
	// let { form }: { form: ActionData } = $props();
</script>

<Intro>
	<form method="POST" action="?/login" use:enhance>
		<label>
			Email
			<input name="email" type="email" />
		</label>
		<br />
		<label>
			Password
			<input name="password" type="password" />
		</label>
		<br />
		<button>Log in</button>
		<button>Register</button>
		{#if form?.error}<div style="color: red; text-align: center; font-size: smaller;">{form?.error}</div>{/if}
	</form>
	
</Intro>
