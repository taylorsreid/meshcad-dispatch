import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import type { Handle, ServerInit } from "@sveltejs/kit";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import { db } from "./lib/db";
import { promises as fs } from 'fs';
import path from 'path';
import { TransportNodeSerial } from "@meshtastic/transport-node-serial";
import { MeshDevice, Protobuf } from "@meshtastic/core";
import { TransportHTTP } from "@meshtastic/transport-http";
import { TransportNode } from "@meshtastic/transport-node";

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

    // TODO: move somewhere else after the program has started
    // TODO: pull mesh_radio_path from db and start mesh radio if value isn't null
    // const radioPath = await db.selectFrom("setting").select("value").where("key", "=", "mesh_radio_path").executeTakeFirstOrThrow()
    // const radioType = await db.selectFrom("setting").select("value").where("key", "=", "mesh_radio_type").executeTakeFirstOrThrow()

    // if (radioPath.value && radioType.value) {
    //     let transport: TransportNodeSerial | TransportNode | TransportHTTP
    //     const path: string = radioPath.value.split(":")[0]
    //     const baudPortTls: number | boolean | undefined = (() => {
    //         const bpt = radioPath.value!.split(":")[1]
    //         if (bpt === "true") {
    //             return true
    //         }
    //         else if (bpt == "false") {
    //             return false
    //         }
    //         else if (!isNaN(parseInt(bpt))) {
    //             return parseInt(bpt)
    //         }
    //         return undefined
    //     }).call(undefined)
    //     if (radioType.value === "serial" && typeof baudPortTls === "number") {
    //         transport = await TransportNodeSerial.create(path, baudPortTls)
    //     }
    //     else if (radioType.value === "tcp" && typeof baudPortTls === "number") {
    //         transport = await TransportNode.create(path, baudPortTls)
    //     }
    //     else if (radioType.value === "http" && typeof baudPortTls === "boolean") {
    //         transport = await TransportHTTP.create(path, baudPortTls)
    //     }
    //     else {
    //         // TODO: log an error
    //        return
    //     }

    //     const meshRadio = new MeshDevice(transport)
    //     await meshRadio.configure()
    // }
    // else {
    //     // TODO: log an error that both must be set
    // }
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