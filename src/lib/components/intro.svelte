<script lang="ts">
	import type { Snippet } from "svelte";
	import '@fontsource/audiowide/400.css';
	const { children }: { children: Snippet } = $props();
</script>

<div id="parent">
	<div id="blackBorder">
		<div id="logo">MeshCAD</div>
		{@render children()}
	</div>
</div>

<style>
	#parent {
		display: flex;
		justify-content: center; /* Centers horizontally */
		align-items: center; /* Centers vertically */
		height: 100vh; /* Gives the parent height (e.g., full viewport) */
		background-color: skyblue;
		margin: 0;		
	}
	#blackBorder {
		border: 0.25vh solid black;
		padding: 7.5vh;
		background-color: white;
	}
	#logo {
		font-size: 5vh;
		font-family: 'Audiowide';
		text-align: center;
		padding-bottom: 3.5vh;
	}
	:global(.grid-form) {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 10px; /* Space between rows and columns */
	}

</style>
