import { auth } from "$lib/server/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ setHeaders }) => {
    // prevent back button from reloading page without redirecting
    setHeaders({
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'pragma': 'no-cache',
        'expires': '0'
    });

    // if there's users in the database, redirect to the login page
    const userCount = (await db.selectFrom("user").select(eb => eb.fn.countAll<number>().as("count")).executeTakeFirstOrThrow()).count
    if (userCount > 0) {
        throw redirect(307, "/login")
    }
};

interface FormErrorResponse {
    emailMissing?: true
    passwordMissing?: true
    firstNameMissing?: true
    lastNameMissing?: true
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

            const adminId: number = (await db.selectFrom("role").select("id").where("name", "=", "Administrator").executeTakeFirstOrThrow()).id

            await db.insertInto("user_has_role").values({
                user_id: parseInt(result.user.id),
                role_id: adminId
            }).executeTakeFirstOrThrow()
        } catch (error) {
            console.log(error)
            return fail(400, String(error))
        }
        redirect(303, "/role");
    }
} satisfies Actions