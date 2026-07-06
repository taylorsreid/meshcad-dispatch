import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { Database } from "bun:sqlite";
import { db, type tablesWithPermissions } from "./db";

export const auth = betterAuth({
    database: new Database("db.sqlite"),
	advanced: {
		database: {
			generateId: "serial"
		}
	},
	emailAndPassword: {
		enabled: true
	},
	experimental: {
		joins: true
	},
	plugins: [sveltekitCookies(getRequestEvent)], // make sure this is the last plugin in the array

	//
	user: {
        fields: {
			name: 'first_name',
            emailVerified: 'email_verified',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
		additionalFields: {
			last_name: {
				type: "string"
			},
			latitude: {
				type: "number"
			},
			longitude: {
				type: "number"
			}
		}
    },
    session: {
        fields: {
			expiresAt: 'expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            ipAddress: 'ip_address',
            userAgent: 'user_agent',
            userId: 'user_id'
        }
    },
    account: {
        fields: {
            accountId: 'account_id',
            providerId: 'provider_id',
            userId: 'user_id',
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            idToken: 'id_token',
            accessTokenExpiresAt: 'access_token_expires_at',
            refreshTokenExpiresAt: 'refresh_token_expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    },
    verification: {
        fields: {
            expiresAt: 'expires_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    },
})

export async function userHasPermissionTo(userId: number, action: "create" | "read" | "update" | "delete", tableName: typeof tablesWithPermissions[number]) {
	// const q = await db.selectFrom("permission").select("name")
	return db.selectFrom("permission")
	.innerJoin("role_has_permission", "permission.id", "role_has_permission.permission_id")
	.innerJoin("role", "role_has_permission.role_id", "role.id")
	.innerJoin("user_has_role", "role.id", "user_has_role.role_id")
	.innerJoin("user", "user_has_role.user_id", "user.id")
	.selectAll()
	.where("name", "=", action + " " + tableName)
}

console.log(userHasPermissionTo(1, "create", "user"))