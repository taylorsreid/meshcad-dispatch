import { describe, it as test, expect } from 'vitest';
import { userHasPermissionTo } from '../../../dispatch/src/lib/auth';

describe('greet', () => {
	test('returns a greeting', () => {
		expect(userHasPermissionTo(1, "create", "unit")).toBeTruthy();
	});
});
