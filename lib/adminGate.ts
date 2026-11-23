import { cookies } from 'next/headers';
import { ADMIN_COOKIE, isAdmin } from './security';

/** For server pages: true only when the visitor holds a valid admin session cookie. */
export async function hasAdminSession(): Promise<boolean> {
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!c && isAdmin(new Request('http://x', { headers: { cookie: `${ADMIN_COOKIE}=${c}` } }));
}
