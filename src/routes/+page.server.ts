import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {

    // const { locals } = getRequestEvent();

    // if (locals.session) {
    //     return {
    //         roles: await db.selectFrom("role")
    //             .innerJoin("user_has_role", "role.id", "user_has_role.role_id")
    //             .innerJoin("user", "user_has_role.user_id", "user.id")
    //             .select(["role.id", "role.name", "role.image"])
    //             .where("user.id", "=", parseInt(locals.session.userId))
    //             .execute()
    //     }
    // }
    // else {
    //     throw redirect(307, "/")
    // }
};