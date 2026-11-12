import { building } from "$app/environment";
import { auth } from "$lib/server/auth";
import { BundlerMigrationProvider } from "$lib/server/db/migrations";
import { type Handle, type ServerInit } from "@sveltejs/kit";
import { getMigrations } from "better-auth/db/migration";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { Migrator } from "kysely/migration";
import { db } from "./lib/server/db";

export const init: ServerInit = async () => {
    // let BetterAuth handle it's own migrations, otherwise it gets mad and gives 500 errors
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();

    // run our other migrations
    const { error, results } = await new Migrator({ db, provider: new BundlerMigrationProvider() }).migrateToLatest()
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

    // TODO: initialize adapters from config file if set and make it accesible from the server globally
};

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Let Better Auth handle internal auth API routes automatically
    if (event.url.pathname.startsWith("/api/auth")) {
        return svelteKitHandler({ event, resolve, auth, building });
    }

    const session = await auth.api.getSession({
        headers: event.request.headers,
    })
    
    if(session) {
        event.locals.user = session.user;
        event.locals.session = session.session;
    }

    return resolve(event)
}