import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    // better auth
    await db.schema.createTable("user")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("first_name", "text", c => c.notNull())
        .addColumn("last_name", "text", c => c.notNull())
        .addColumn("latitude", "real")
        .addColumn("longitude", "real")
        .addColumn("email", "text", c => c.notNull().unique())
        .addColumn("email_verified", "integer", c => c.notNull())
        .addColumn("image", "text")
        .addColumn("created_at", "date", c => c.notNull())
        .addColumn("updated_at", "date", c => c.notNull())
        .execute()
    await sql`create table "session" ("id" integer not null primary key, "expires_at" date not null, "token" text not null unique, "created_at" date not null, "updated_at" date not null, "ip_address" text, "user_agent" text, "user_id" integer not null references "user" ("id") on delete cascade);`.execute(db)
    await sql`create table "account" ("id" integer not null primary key, "account_id" text not null, "provider_id" text not null, "user_id" integer not null references "user" ("id") on delete cascade, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" date, "refresh_token_expires_at" date, "scope" text, "password" text, "created_at" date not null, "updated_at" date not null);`.execute(db)
    await sql`create table "verification" ("id" integer not null primary key, "identifier" text not null, "value" text not null, "expires_at" date not null, "created_at" date not null, "updated_at" date not null);`.execute(db)
    await sql`create index "session_user_id_idx" on "session" ("user_id");`.execute(db)
    await sql`create index "account_user_id_idx" on "account" ("user_id");`.execute(db)
    await sql`create index "verification_identifier_idx" on "verification" ("identifier");`.execute(db)

    await db.schema.createTable("permission")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("name", "text", c => c.notNull().unique())
        .execute()

    await db.schema.createTable("role")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("name", "text", c => c.notNull().unique())
        .addColumn("image", "text")
        .addColumn("system", "boolean", c => c.notNull().defaultTo(false))
        .execute()

    await db.schema.createTable("status")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("name", "text", c => c.notNull().unique())
        .addColumn("color", "text")
        .addColumn("system", "boolean", c => c.notNull().defaultTo(false))
        .execute()

    await db.schema.createTable("unit")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("name", "text", c => c.notNull().unique())
        .addColumn("mesh_address", "integer")
        .addColumn("status_id", "integer", c => c.notNull().references("status.id"))
        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
        .addColumn("user_id", "integer", c => c.unique().references("user.id"))
        .addColumn("incident_id", "integer", c => c.references("incident.id"))
        .execute()

    await db.schema.createTable("voice_channel")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("name", "text", c => c.notNull().unique())
        .execute()

    await db.schema.createTable("incident_type")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("name", "text", c => c.notNull().unique())
        .execute()

    await db.schema.createTable("incident")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("priority", "integer")
        .addColumn("latitude", "real")
        .addColumn("longitude", "real")
        .addColumn("address", "text")
        .addColumn("voice_channel_id", "integer", c => c.references("voice_channel.id"))
        .addColumn("sent_at", "integer") // unix time
        .addColumn("created_at", "integer", c => c.notNull().defaultTo(sql`(unixepoch())`))
        .addColumn("closed_at", "integer")
        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
        .addColumn("created_by_user_id", "integer", c => c.notNull().references("user.id"))
        .addColumn("created_by_unit_id", "integer", c => c.references("unit.id")) // null if dispatcher
        .addCheckConstraint("latitude_and_longitude", sql`(latitude IS NULL) = (longitude IS NULL)`) // both columns must be filled out or both columns must be null
        .execute()

    await db.schema.createTable("incident_log")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("created_at", "integer", c => c.notNull().defaultTo(sql`(unixepoch())`))
        .addColumn("text", "text", c => c.notNull())
        .addColumn("send_on_mesh", "boolean", c => c.notNull())
        .addColumn("sent_on_mesh", "boolean", c => c.notNull())
        .addColumn("incident_id", "integer", c => c.notNull().references("incident.id"))
        .addColumn("created_by_user_id", "integer", c => c.notNull().references("user.id"))
        .addColumn("created_by_unit_id", "integer", c => c.references("unit.id")) // null if dispatcher
        .execute()

    await db.schema.createTable("suggested_incident_log")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("text", "text", c => c.notNull())
        .addColumn("send_on_mesh", "boolean", c => c.notNull())
        .execute()

    // pivot tables
    await db.schema.createTable("role_has_permission")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
        .addColumn("permission_id", "integer", c => c.notNull().references("permission.id"))
        .addColumn("system", "boolean", c => c.notNull().defaultTo(false))
        .addUniqueConstraint("role_has_permission_unique", ["role_id", "permission_id"])
        .execute()

    await db.schema.createTable("user_has_role")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("user_id", "integer", c => c.notNull().references("user.id"))
        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
        .addUniqueConstraint("user_has_role_unique", ["user_id", "role_id"])
        .execute()

    await db.schema.createTable("incident_type_has_voice_channel")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
        .addColumn("voice_channel_id", "integer", c => c.notNull().references("voice_channel.id"))
        .addUniqueConstraint("incident_type_has_voice_channel_unique", ["incident_type_id", "voice_channel_id"])
        .execute()

    await db.schema.createTable("incident_type_has_role")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
        .addColumn("role_id", "integer", c => c.notNull().references("role.id"))
        .addUniqueConstraint("incident_type_has_role_unique", ["incident_type_id", "role_id"])
        .execute()

    await db.schema.createTable("incident_type_has_suggested_incident_log")
        .addColumn("id", "integer", c => c.notNull().primaryKey())
        .addColumn("incident_type_id", "integer", c => c.notNull().references("incident_type.id"))
        .addColumn("suggested_incident_log_id", "integer", c => c.notNull().references("suggested_incident_log.id"))
        .addUniqueConstraint("incident_type_has_suggested_incident_log", ["incident_type_id", "suggested_incident_log_id"])
        .execute()

    const tablesWithPermissions: string[] = ["user", "role", "status", "unit", "voice_channel", "incident_type", "incident", "incident_log", "suggested_incident_log"]
    for (let i = 0; i < tablesWithPermissions.length; i++) {
        await db.insertInto("permission")
            .values([
                { name: `create ${tablesWithPermissions[i]}` },
                { name: `read $`}
            ])
            .execute()
    }
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex("verification_identifier_idx").execute()
    await db.schema.dropIndex("account_userId_idx").execute()
    await db.schema.dropIndex("session_userId_idx").execute()
    await db.schema.dropTable("verification").execute()
    await db.schema.dropTable("account").execute()
    await db.schema.dropTable("session").execute()
    await db.schema.dropTable("user").execute()

    // TODO:
}