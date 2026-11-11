import { db, type RoleTable, type tablesWithPermissions, type UnitTable } from "$lib/server/db";
import type { Selectable } from "kysely";

export async function userHasPermissionTo(userOrId: { id: string } | number, action: "create" | "read" | "update" | "delete", tableName: typeof tablesWithPermissions[number]) {
    return typeof (await db.selectFrom("permission")
        .innerJoin("role_has_permission", "permission.id", "role_has_permission.permission_id")
        .innerJoin("role", "role_has_permission.role_id", "role.id")
        .innerJoin("user_has_role", "role.id", "user_has_role.role_id")
        .innerJoin("user", "user_has_role.user_id", "user.id")
        .select("permission.id")
        .where("user.id", "=", typeof userOrId === "number" ? userOrId : parseInt(userOrId.id))
        .where("permission.name", "=", action + " " + tableName)
        .executeTakeFirst()) !== "undefined"
}

export async function userHasRole(userOrId: { id: string } | number, roleName: string): Promise<boolean> {
    return typeof (db.selectFrom("role")
        .innerJoin("user_has_role", "role.id", "user_has_role.role_id")
        .innerJoin("user", "user_has_role.user_id", "user.id")
        .select("role.id")
        .where("user.id", "=", typeof userOrId === "number" ? userOrId : parseInt(userOrId.id))
        .where("role.name", "=", roleName)
        .executeTakeFirst()) !== "undefined"
}

// export async function userGetRoles(userOrId: { id: string } | number): Promise<Selectable<RoleTable>[]> {
//     return db.selectFrom("role")
//         .innerJoin("user_has_role", "role.id", "user_has_role.role_id")
//         .innerJoin("user", "user_has_role.user_id", "user.id")
//         .selectAll()
//         .where("user.id", "=", typeof userOrId === "number" ? userOrId : parseInt(userOrId.id))
//         .execute()
// }

export async function getUsersUnit(userOrId: { id: string } | number): Promise<Selectable<UnitTable> | undefined> {
    return db.selectFrom("unit")
        .innerJoin("user", "user.unit_id", "unit.id")
        .selectAll()
        .where("user.id", "=", typeof userOrId === "number" ? userOrId : parseInt(userOrId.id))
        .executeTakeFirst()
}