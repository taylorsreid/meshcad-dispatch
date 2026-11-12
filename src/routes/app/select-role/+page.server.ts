import { db } from "$lib/server/db";
import { error, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const newRoleId: string | undefined = (await request.formData()).get("new_role_id")?.toString()
        if (!newRoleId) {
            return error(400, { message: "No Role ID was submitted." })
        }

        const currentRoleId: number | undefined = (await db.selectFrom("user_has_role")
            .select("role_id")
            .where("user_id", "=", parseInt(locals.user!.id))
            .where("selected", "=", true)
            .executeTakeFirst())?.role_id

        // don't do any more db work if they're selecting the same role
        if (currentRoleId && parseInt(newRoleId) == currentRoleId) {
            return
        }

        // guard against users setting roles they don't have available
        try {
            await db.selectFrom("user_has_role")
                .where("user_id", "=", parseInt(locals.user!.id))
                .where("role_id", "=", parseInt(newRoleId))
                .executeTakeFirstOrThrow()
        } catch (e) {
            return error(401, { message: "User does not have that role assigned/available." })
        }

        // if they currently have a role assigned, remove the assignment
        if (currentRoleId) {
            await db.updateTable("user_has_role")
                .set("selected", null)
                .where("user_id", "=", parseInt(locals.user!.id))
                .where("role_id", "=", currentRoleId)
                .executeTakeFirst()
        }

        // assign new role
        await db.updateTable("user_has_role")
            .set("selected", true)
            .where("user_id", "=", parseInt(locals.user!.id))
            .where("role_id", "=", parseInt(newRoleId))
            .executeTakeFirst()

    }
} satisfies Actions