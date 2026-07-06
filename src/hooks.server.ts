import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import type { Handle, ServerInit } from "@sveltejs/kit";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import { db } from "./lib/db";
import { promises as fs } from 'fs';
import path from 'path';

export const init: ServerInit = async () => {
    // apply any pending app specific migrations
    const { error, results } = await new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            // This needs to be an absolute path.
            migrationFolder: path.join(process.cwd(), 'src/lib/db/migrations'),
        }),
    }).migrateToLatest()
    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`)
        }
    })
    if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
    }
};

export const handle: Handle = async ({ event, resolve }) => {
    // Fetch current session from Better Auth
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    // Make session and user available on server
    if (session) {
        // @ts-ignore
        event.locals.session = session.session;
        // @ts-ignore
        event.locals.user = session.user;
    }

    return svelteKitHandler({ event, resolve, auth, building });
}