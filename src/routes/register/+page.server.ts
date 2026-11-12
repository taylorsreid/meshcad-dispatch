import { auth } from "$lib/server/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";
import { userGetTotalCount } from "$lib/server/utils";
import { APIError } from "better-auth";

export const load: PageServerLoad = async ({ setHeaders, locals }) => {
    // prevent back button from reloading page without redirecting
    setHeaders({
        'Cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    // if already logged in, redirect
    if (locals.user) {
        throw redirect(307, "/app")
    }

    return {
        isInit: (await userGetTotalCount()) <= 0
    }
};

interface FormErrorResponse {
    emailMissing?: true
    passwordMissing?: true
    firstNameMissing?: true
    lastNameMissing?: true
    other?: string
}

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData()
        const errors: FormErrorResponse = {}
        if (!formData.has("email") || formData.get("email") === "") {
            errors.emailMissing = true
        }
        if (!formData.has("password") || formData.get("password") === "") {
            errors.passwordMissing = true
        }
        if (!formData.has("first_name") || formData.get("first_name") === "") {
            errors.firstNameMissing = true
        }
        if (!formData.has("last_name") || formData.get("last_name") === "") {
            errors.lastNameMissing = true
        }

        if (Object.keys(errors).length > 0) {
            return fail(400, errors)
        }

        const userCount: number = await userGetTotalCount()

        try {
            const result = await auth.api.signUpEmail({
                headers: request.headers,
                body: {
                    name: formData.get("first_name")!.toString(),
                    lastName: formData.get("last_name")!.toString(),
                    email: formData.get("email")!.toString(),
                    password: formData.get("password")!.toString(),
                    rememberMe: formData.get("remember_me") === "on"
                },
            })

            // only run on the first account
            if (userCount <= 0) {
                const adminId: number = (await db.selectFrom("role").select("id").where("name", "=", "Administrator").executeTakeFirstOrThrow()).id
                await db.insertInto("user_has_role").values({
                    user_id: parseInt(result.user.id),
                    role_id: adminId,
                    selected: true
                }).executeTakeFirstOrThrow()
            }
        } catch (error) {
            if (error instanceof APIError) {
                return fail(error.statusCode, error.body?.message)
            }
            console.log(error)
            errors.other = "An unknown error occured."
            return fail(500, errors)
        }
        redirect(303, "/app");
    }
} satisfies Actions