<script lang="ts">
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props()
</script>

 {#await data.roles}
    loading roles
 {:then roles} 
    {JSON.stringify(roles)}
 {/await}