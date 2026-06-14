import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';
import { NextResponse }       from 'next/server';
import type { NextRequest }   from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code      = searchParams.get('code');
  const next      = searchParams.get('next') ?? '/';
  const error     = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  if (error) {
    const msg = errorDesc ?? error;
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(msg)}`);
  }

  if (!code) return NextResponse.redirect(`${origin}/`);

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

  const { data: { session }, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !session) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(exchangeError?.message ?? 'Auth failed')}`
    );
  }

  // ── Ensure parent row exists ──────────────────────────────────
  // Use the authenticated session client (RLS policy "parents: insert own" allows this)
  // This works without the service role key.
  try {
    const user = session.user;
    const meta = user.user_metadata ?? {};

    // Check if parent row exists using the authenticated client
    const { data: existing } = await supabase
      .from('parents')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existing && user.email) {
      // Insert via authenticated client — RLS "parents: insert own" allows this
      const { error: insertErr } = await supabase.from('parents').insert({
        id:        user.id,
        email:     user.email,
        full_name: meta.full_name ?? meta.name ?? user.email.split('@')[0] ?? 'Parent',
        avatar:    meta.avatar_url ?? meta.picture ?? '👨‍👩‍👧',
        plan:      'free',
      });

      // If insert fails (race condition — row created by another request), that's fine
      if (insertErr && insertErr.code !== '23505' && process.env.NODE_ENV === 'development') {
        console.warn('[callback] parent insert:', insertErr.message);
      }
    }
  } catch (e) {
    // Never block auth flow for DB issues
    if (process.env.NODE_ENV === 'development') console.warn('[callback] parent upsert skipped:', e);
  }

  // ── Redirect back to app ──────────────────────────────────────
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocal       = process.env.NODE_ENV === 'development';
  const base          = isLocal ? origin : (forwardedHost ? `https://${forwardedHost}` : origin);

  return NextResponse.redirect(`${base}${next}`);
}
