import { getDb } from '../../../lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Cheap DB ping; point an uptime monitor / cron here to keep Neon's compute awake. */
export async function GET() {
  await getDb().query('SELECT 1');
  return new Response('ok', { headers: { 'cache-control': 'no-store' } });
}
