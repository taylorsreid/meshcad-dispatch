import { authClient } from '$lib/auth-client';
import { createMessage } from 'svelte-realtime/server';

export async function upgrade() {
	if (process.env.NODE_ENV === 'development') {
		return { id: crypto.randomUUID() };
	}

	const user = (await authClient.getSession()).data?.user
	return typeof user !== "undefined" ? user : false
}

export const message = createMessage();