import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import { userGetTotalCount } from "$lib/server/utils";

export const load: LayoutServerLoad = async ({ locals, request }) => {

	// route guard against unauthorized/unverified users
	if (!locals.user && !request.url.startsWith("/register") && !request.url.startsWith("/login") && !request.url.startsWith("/docs")) {
        if (await userGetTotalCount() <= 0) { // redirect first time users
            redirect(307, "/register")
        }
        else { // redirect returning users
            redirect(307, "/login")
        }
    }

	const user = await db.selectFrom("user")
		.select(["first_name", "last_name", "image"])
		.where("user.id", "=", parseInt(locals.user!.id))
		.executeTakeFirstOrThrow()

	const roles = await db
		.selectFrom("role")
		.innerJoin("user_has_role", "role.id", "user_has_role.role_id")
		.innerJoin("user", "user_has_role.user_id", "user.id")
		.innerJoin("role_has_permission", "role.id", "role_has_permission.role_id")
		.innerJoin("permission", "role_has_permission.permission_id", "permission.id")
		.select(["role.id", "role.name", "role.image", "role.redirect_slug", "user_has_role.selected"])
		.distinct()
		.where("user.id", "=", parseInt(locals.user!.id))
		.where((eb) => eb("permission.name", "=", "dispatch").or("role.name", "=", "Administrator"))
		.execute()

	return {
		user: { ...user, roles: roles }
	}
}