import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/googleAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id') || process.env.GOOGLE_CLIENT_ID || 'demo-client-id';
  const redirectUri = searchParams.get('redirect_uri') || 'http://localhost:3000/api/auth/callback';

  if (!clientId || clientId === 'demo-client-id') {
    return NextResponse.json({
      success: false,
      message: 'Google Client ID is not configured. Update in Settings or set GOOGLE_CLIENT_ID environment variable.',
      demoUrl: getGoogleAuthUrl('DEMO_CLIENT_ID.apps.googleusercontent.com', redirectUri)
    });
  }

  const authUrl = getGoogleAuthUrl(clientId, redirectUri);
  return NextResponse.redirect(authUrl);
}
