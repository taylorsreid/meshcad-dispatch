import { auth } from '$lib/server/auth';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { APIError } from 'better-auth';

// export const load: PageServerLoad = async () => {

// };

export const actions = {
    login: async (event) => {
        const formData = await event.request.formData()
        const email = formData.get("email")?.toString()
        const password = formData.get("password")?.toString()
        if (email && password) {
            try {
                await auth.api.signInEmail({
                    body: { email, password },
                    headers: event.request.headers
                })
                redirect(303, "/role")
            }
            catch (error) {
                if (error instanceof APIError) {
                    return fail(error.statusCode, { error: error.body?.message })
                }
            }
        }
    }
} satisfies Actions;