import { auth } from '$lib/server/auth';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { APIError } from 'better-auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ setHeaders, locals }) => {
    // prevent back button from reloading page without redirecting
    setHeaders({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    if (locals.user) {
        redirect(307, "/app")
    }
};

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get("email")?.toString() ?? ""
        const password = formData.get("password")?.toString() ?? ""
        try {
            await auth.api.signInEmail({
                body: { email, password },
                headers: request.headers
            })
        }
        catch (error) {
            if (error instanceof APIError) {
                return fail(error.statusCode, error.body?.message)
            }
            console.log(error)
            return fail(500, "An unknown error occured.")
        }
        redirect(303, "/app")
    }
} satisfies Actions;