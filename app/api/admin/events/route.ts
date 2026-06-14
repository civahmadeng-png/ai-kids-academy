// ============================================================
// GET /api/admin/events
// Returns event frequency counts for the admin analytics panel.
// Admin-only. Uses service-role client to read app_events.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@supabase/ssr';
import { createClient }              from '@supabase/supabase-js';
import { cookies }                   from 'next/headers';

export const runtime = 'nodejs';

function getServiceDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* server component */ }
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('parents').select('is_admin').eq('id', user.id).single();
  return data?.is_admin === true;
}

export async function GET(req: NextRequest) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getServiceDb();
  if (!db) {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 503 });
  }

  const now      = new Date();
  const ago7d    = new Date(now.getTime() - 7  * 24 * 3600 * 1000).toISOString();
  const ago30d   = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
  const ago24h   = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

  try {
    const [allRes, last30dRes, last7dRes, last24hRes] = await Promise.all([
      db.from('app_events').select('event'),
      db.from('app_events').select('event').gte('occurred_at', ago30d),
      db.from('app_events').select('event').gte('occurred_at', ago7d),
      db.from('app_events').select('event').gte('occurred_at', ago24h),
    ]);

    return NextResponse.json({
      total:    countByEvent(allRes.data   ?? []),
      last30d:  countByEvent(last30dRes.data ?? []),
      last7d:   countByEvent(last7dRes.data  ?? []),
      last24h:  countByEvent(last24hRes.data ?? []),
      generatedAt: now.toISOString(),
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Query failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function countByEvent(rows: Array<{ event: string }>): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.event] = (acc[r.event] ?? 0) + 1;
    return acc;
  }, {});
}
