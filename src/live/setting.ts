import { userHasPermissionTo } from '$lib/server/utils';
import { db, type SettingTable } from '$lib/server/db';
import { live, LiveError } from 'svelte-realtime/server';

// realtime-allow-public

// no create

export const setting = live.stream('setting', async (ctx) => {
    if (!ctx.user) {
        throw new LiveError('UNAUTHENTICATED', "You must be logged in to view settings.")
    }
    else if (!(await userHasPermissionTo(ctx.user.id, "read", "setting"))) {
        throw new LiveError('FORBIDDEN', "You do not have permission to view settings.")
    }
    return db.selectFrom("setting").selectAll().execute()
}, { merge: 'crud', key: 'id' })

export const updateSetting = live(async (ctx, setting: SettingTable) => {
    if (!ctx.user) {
        throw new LiveError('UNAUTHENTICATED', "You must be logged in to update a setting.")
    }
    else if (!(await userHasPermissionTo(ctx.user.id, "update", "setting"))) {
        throw new LiveError('FORBIDDEN', "You do not have permission to update a setting.")
    }
    const result = await db.updateTable("setting").set({ value: setting.value }).where("key", "=", setting.key).executeTakeFirst()
    ctx.publish("setting", "updated", result)
    return result
})

// no delete