import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

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
