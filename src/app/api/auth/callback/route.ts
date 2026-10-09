import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/googleAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=missing_code', request.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = 'http://localhost:3000/api/auth/callback';

    if (clientId && clientSecret) {
      const tokens = await exchangeCodeForTokens(code, { clientId, clientSecret, redirectUri });
      // In production, save tokens in encrypted session/cookie
      return NextResponse.redirect(new URL('/?auth_success=true', request.url));
    }

    return NextResponse.redirect(new URL('/?auth_success=demo_mode', request.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(err.message)}`, request.url));
  }
}
