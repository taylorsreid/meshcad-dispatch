
import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async (request) => {
    if (request.locals.user) {
        return {
            roles: db.selectFrom("role")
                .innerJoin("user_has_role", "role.id", "user_has_role.role_id")
                .innerJoin("user", "user_has_role.user_id", "user.id")
                .select(["role.id", "role.name", "role.image"])
                .where("user.id", "=", parseInt(request.locals.user.id))
                .execute()
        }
    }
    else {
        error(401, "No user loaded.");
    }

};