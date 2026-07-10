import { db } from '$lib/db';
import { live } from 'svelte-realtime/server';

// realtime-allow-public

export const setting = live.stream('setting', async (ctx) => {
    return db.selectFrom("setting").selectAll().executeTakeFirst()
}, { merge: 'crud', key: 'id' })