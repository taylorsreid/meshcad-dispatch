<script lang="ts">
    import type { Snippet } from "svelte";
    import "@fontsource/audiowide/400.css";
    const { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-sky-300">
    <div class="rounded-xl border-2 bg-white p-16 h-fit">
        <div class="text-center text-5xl font-[Audiowide] pb-9">MeshCAD</div>
        {@render children()}
    </div>
</div>
