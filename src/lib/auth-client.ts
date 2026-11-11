import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte"; // make sure to import from better-auth/svelte
import { auth } from "./server/auth";

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>()
    ]
})