import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { db } from "./db";

export const auth = betterAuth({ 
    baseURL: {
        allowedHosts: ["*"] // this is designed to run locally
    },
    database: {
        db,
        type: "postgres",
    },
	advanced: {
		database: {
			generateId: "serial",
            joins: true,
		}
	},
	emailAndPassword: {
		enabled: true
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
			lastName: {
                fieldName: "last_name",
				type: "string",
                required: true,
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

