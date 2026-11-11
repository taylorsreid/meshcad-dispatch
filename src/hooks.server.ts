import { building } from "$app/environment";
import { auth } from "$lib/server/auth";
import { BundlerMigrationProvider } from "$lib/server/db/migrations";
import { redirect, type Handle, type ServerInit } from "@sveltejs/kit";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { Migrator } from "kysely/migration";
import { db } from "./lib/server/db";
import { getMigrations } from "better-auth/db/migration";

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

    if (session) {
        event.locals.user = session.user;
        event.locals.session = session.session;
    }

    // if there's no users in the database, redirect to the initial setup page and prompt them to create an admin account
    // TODO: move this value to a cache so we don't hit the db on every single request?
    const userCount: number = (await db.selectFrom("user").select(eb => eb.fn.countAll<number>().as("count")).executeTakeFirstOrThrow()).count
    if (userCount <= 0 && !event.url.pathname.startsWith("/init")) {
        redirect(303, "/init") // don't keep original destination path because init page will redirect them again
    }

    // if they're not logged in and they're not trying to login, register, or init; redirect them to the registration page
    if (!event.locals.session && !(event.url.pathname.startsWith("/login") || event.url.pathname.startsWith("/register") || event.url.pathname.startsWith("/init"))) {
        // preserve the original destination path
        redirect(307, `/register?redirectTo=${event.url.pathname}`);
    }
    return resolve(event);
}