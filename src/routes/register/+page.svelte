<script lang="ts">
    import { TextField, Checkbox, Button } from "svelte-ux";
    import type { PageProps } from "./$types";
    import "@fontsource/audiowide/400.css";
    import Intro from "$lib/components/intro.svelte";
    let { form, data }: PageProps = $props();
    let password: string = $state("");
    let confirmPassword: string = $state("");
</script>

<Intro>
    {#if data.isInit}
        <div class="pb-9">Let's create your first administrator account:</div>
    {/if}
    <form method="POST" class="grid gap-2" action="/register">
        <TextField
            label="Email"
            name="email"
            required
            error={(function () {
                if (form?.emailMissing) return "Email is required.";
            })()}
        />

        <TextField
            label="Password"
            type="password"
            name="password"
            required
            bind:value={password}
            error={(function () {
                if (form?.passwordMissing) return "Password is required.";
            })()}
        />

        <TextField
            label="Confirm Password"
            type="password"
            name="confirm_password"
            required
            bind:value={confirmPassword}
            error={(function () {
                if (confirmPassword !== password)
                    return "Passwords do not match.";
            })()}
        />

        <TextField
            label="First Name"
            name="first_name"
            required
            error={(function () {
                if (form?.firstNameMissing) return "First Name is required.";
            })()}
        />

        <TextField
            label="Last Name"
            name="last_name"
            required
            error={(function () {
                if (form?.lastNameMissing) return "Last Name is required.";
            })()}
        />
        <Checkbox checked name="remember_me">Remember me?</Checkbox>
        <Button
            disabled={password !== confirmPassword}
            type="submit"
            error={(function () {
                if (form?.other) return form.other;
            })()}>
            Register
        </Button>
    </form>
</Intro>
