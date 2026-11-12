import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) {
        const redirectSlug = await db.selectFrom("role")
            .innerJoin("user_has_role", "user_has_role.role_id", "role.id")
            .select(["role.redirect_slug as value"])
            .where("user_has_role.user_id", "=", parseInt(locals.user.id))
            .where("user_has_role.selected", "=", true)
            .executeTakeFirst()

        if (redirectSlug && redirectSlug.value) {
            redirect(303, redirectSlug.value)
        }
        redirect(303, "/app/select-role")        
    }
}