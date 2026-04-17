import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();

    // We cannot construct the client fully because NEXT_PUBLIC_SUPABASE_URL and ANON_KEY might not be at runtime here easily without importing lib
    // Wait, let's just use the client from our lib for exchange, actually let's use the standard setup
    // Since this is a route handler we should use SSR client.

    // Fallback: If missing env vars, don't crash the route handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseKey) {
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete({ name, ...options })
            },
          },
        });

        await supabase.auth.exchangeCodeForSession(code);
    }
  }

  // URL to redirect to after sign in process completes
  // Always redirect to the base origin
  return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin);
}
