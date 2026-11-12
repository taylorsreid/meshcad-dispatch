<script lang="ts">
	let { children, data } = $props();
	import { goto } from "$app/navigation";
    import { authClient } from "$lib/auth-client";
    import SquareArrowRightExit from "@lucide/svelte/icons/square-arrow-right-exit";
    import UserRound from "@lucide/svelte/icons/user-round";
    import { Avatar, Button, Menu, MenuItem, Toggle } from "svelte-ux";

</script>

<div class="flex justify-end items-center">
    <Button href="/app" title="Role Switcher">{data.user.roles.find((r) => r.selected)?.name}</Button>
    <Toggle let:on={open} let:toggle let:toggleOff>
        <Button on:click={toggle}>
            {#if data.user.image}
                <img alt={`${data.user.first_name} ${data.user.last_name}'s profile picture'`} src={data.user.image} class="size-10 rounded-full object-cover" />
            {:else}
                <Avatar class="bg-primary text-primary-content" icon={UserRound}>{data.user.first_name[0].toUpperCase()}{data.user.last_name[0].toUpperCase()}</Avatar>
            {/if}
            <Menu {open} on:close={toggleOff}>
                <MenuItem disabled>{data.user.first_name} {data.user.last_name}</MenuItem>
                <MenuItem>Profile</MenuItem>
                <MenuItem
                    on:click={() => {
                        authClient.signOut();
                        goto("/login");
                    }}
                >
                    Logout
                    <SquareArrowRightExit />
                </MenuItem>
            </Menu>
        </Button>
    </Toggle>
</div>


{@render children()}
