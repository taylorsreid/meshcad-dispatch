import { Kysely, sql } from 'kysely'
import { tablesWithPermissions } from '$lib/server/db'
import type { Migration, MigrationProvider } from 'kysely/migration'

export class BundlerMigrationProvider implements MigrationProvider {
    async getMigrations(): Promise<Record<string, Migration>> {
        return {
            "20260703T204809": {
                async up(db: Kysely<any>): Promise<void> {
                    // enable postgis
                    sql`CREATE EXTENSION IF NOT EXISTS postgis;`.execute(db)

                    // add a column to the BetterAuth user table
                    await db.schema.alterTable("user").addColumn("location", sql`geometry(Point, 4326)`).execute()

                    await db.schema.createTable("permission")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("name", "text", c => c.notNull().unique())
                        .execute()

                    // await db.schema.createTable("setting")
                    //     .addColumn("key", "text", c => c.notNull().primaryKey())
                    //     .addColumn("value", "text")
                    //     .execute()

                    await db.schema.createTable("role")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("name", "text", c => c.notNull().unique())
                        .addColumn("image", "text")
                        .addColumn("redirect_slug", "text")
                        .addColumn("system", "boolean", c => c.notNull().defaultTo(false))
                        .execute()

                    await db.schema.createTable("status")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("name", "text", c => c.notNull().unique())
                        .addColumn("color", "text")
                        .addColumn("system", "boolean", c => c.notNull().defaultTo(false))
                        .execute()

                    await db.schema.createTable("unit")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("name", "text", c => c.notNull().unique())
                        .addColumn("data_adapter", "text")
                        .addColumn("data_address", "text")
                        .addColumn("status_id", "integer", c => c.notNull().references("status.id"))
                        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
                        // .addColumn("incident_id", "integer", c => c.references("incident.id")) // has to be created after incident table
                        .addUniqueConstraint("unit_data_adapter_data_address_unique", ["data_adapter", "data_address"])
                        .execute()

                    await db.schema.alterTable("user").addColumn("unit_id", "integer", c => c.references("unit.id")).execute()

                    await db.schema.createTable("voice_channel")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("name", "text", c => c.notNull().unique())
                        .execute()

                    await db.schema.createTable("incident_type")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("name", "text", c => c.notNull().unique())
                        .execute()

                    await db.schema.createTable("incident")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("priority", "integer")
                        .addColumn("location", sql`geometry(Point, 4326)`)
                        .addColumn("address", "text")
                        .addColumn("voice_channel_id", "integer", c => c.references("voice_channel.id"))
                        .addColumn("sent_at", "timestamptz")
                        .addColumn("created_at", "timestamptz", c => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
                        .addColumn("closed_at", "timestamptz")
                        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
                        .addColumn("created_by_user_id", "integer", c => c.notNull().references("user.id"))
                        .addColumn("created_by_unit_id", "integer", c => c.references("unit.id")) // null if dispatcher
                        .execute()

                    await db.schema.alterTable("unit").addColumn("incident_id", "integer", c => c.references("incident.id")).execute()

                    await db.schema.createTable("incident_log")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("created_at", "timestamptz", c => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
                        .addColumn("text", "text", c => c.notNull())
                        .addColumn("send_on_mesh", "boolean", c => c.notNull())
                        .addColumn("sent_on_mesh", "boolean", c => c.notNull())
                        .addColumn("incident_id", "integer", c => c.notNull().references("incident.id"))
                        .addColumn("created_by_user_id", "integer", c => c.notNull().references("user.id"))
                        .addColumn("created_by_unit_id", "integer", c => c.references("unit.id")) // null if dispatcher
                        .execute()

                    await db.schema.createTable("suggested_incident_log")
                        .addColumn("id", "serial", c => c.notNull().primaryKey())
                        .addColumn("text", "text", c => c.notNull())
                        .addColumn("send_on_mesh", "boolean", c => c.notNull())
                        .execute()

                    // pivot tables
                    await db.schema.createTable("role_has_permission")
                        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
                        .addColumn("permission_id", "integer", c => c.notNull().references("permission.id"))
                        .addColumn("system", "boolean", c => c.notNull().defaultTo(false))
                        .addUniqueConstraint("role_has_permission_unique", ["role_id", "permission_id"])
                        .execute()

                    await db.schema.createTable("user_has_role")
                        .addColumn("user_id", "integer", c => c.notNull().references("user.id"))
                        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
                        .addColumn("selected", "boolean")
                        .addUniqueConstraint("user_has_role_unique", ["user_id", "role_id"])
                        .addUniqueConstraint("user_has_role_selected", ["user_id", "selected"])
                        .execute()

                    await db.schema.createTable("incident_type_has_voice_channel")
                        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
                        .addColumn("voice_channel_id", "integer", c => c.notNull().references("voice_channel.id"))
                        .addUniqueConstraint("incident_type_has_voice_channel_unique", ["incident_type_id", "voice_channel_id"])
                        .execute()

                    await db.schema.createTable("incident_type_has_role")
                        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
                        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
                        .addUniqueConstraint("incident_type_has_role_unique", ["incident_type_id", "role_id"])
                        .execute()

                    await db.schema.createTable("incident_type_has_suggested_incident_log")
                        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
                        .addColumn("suggested_incident_log_id", "integer", c => c.notNull().references("suggested_incident_log.id"))
                        .addUniqueConstraint("incident_type_has_suggested_incident_log_unique", ["incident_type_id", "suggested_incident_log_id"])
                        .execute()

                    const allPermissionIds: { id: number }[] = []
                    for (let i = 0; i < tablesWithPermissions.length; i++) {
                        allPermissionIds.push(...await db.insertInto("permission").values([
                            { name: `create ${tablesWithPermissions[i]}` },
                            { name: `read ${tablesWithPermissions[i]}` },
                            { name: `update ${tablesWithPermissions[i]}` },
                            { name: `delete ${tablesWithPermissions[i]}` }
                        ])
                        .returning(["id"])
                        .execute())
                    }

                    const adminId: number = (await db.insertInto("role").values({
                        name: "Administrator",
                        system: true
                    })
                    .returning("id")
                    .executeTakeFirstOrThrow()).id

                    for (let i = 0; i < allPermissionIds.length; i++) {
                        await db.insertInto("role_has_permission").values({
                            role_id: adminId,
                            permission_id: allPermissionIds[i].id,
                            system: true
                        }).execute()
                    }

                },
                async down(db: Kysely<any>): Promise<void> {
                    await db.schema.dropIndex("verification_identifier_idx").execute()
                    await db.schema.dropIndex("account_userId_idx").execute()
                    await db.schema.dropIndex("session_userId_idx").execute()
                    await db.schema.dropTable("verification").execute()
                    await db.schema.dropTable("account").execute()
                    await db.schema.dropTable("session").execute()
                    await db.schema.dropTable("user").execute()
                    // TODO:
                }
            }
        }

    }
}