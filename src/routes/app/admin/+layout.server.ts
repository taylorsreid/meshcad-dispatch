import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (locals.user) {
        const adminId: number = (await db.selectFrom("role")
            .select("id")
            .where("name", "=", "Administrator")
            .executeTakeFirstOrThrow()).id

        const isAdmin: boolean = (await db.selectFrom("user_has_role")
            .select("selected")
            .where("user_id", "=", parseInt(locals.user.id))
            .where("role_id", "=", adminId)
            .executeTakeFirstOrThrow()).selected ?? false
        
        if (!isAdmin) {
            redirect(307, "/app")
        }
        
        //TODO: return data
    }
    redirect(307, "/app")
};