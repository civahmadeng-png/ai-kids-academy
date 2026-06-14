import { NextRequest, NextResponse } from 'next/server';
import { createServerClient }        from '@supabase/ssr';

// ============================================================
// Admin Middleware — runs on every /admin/* request
// Verifies: authenticated + is_admin = TRUE
// Redirects to / if not authorized.
// ============================================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Build a server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 1. Check authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/?admin_error=not_authenticated', req.url));
  }

  // 2. Check is_admin flag
  const { data: parent } = await supabase
    .from('parents')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!parent?.is_admin) {
    return NextResponse.redirect(new URL('/?admin_error=not_authorized', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
