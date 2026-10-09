import { NextResponse } from 'next/server';
import { createPasswordResetCode } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const result = await createPasswordResetCode(email.trim());

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: `No user account found matching "${email.trim()}". Please verify the email address.`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset verification code generated successfully.',
      email: result.user.email,
      resetCode: result.resetCode,
      expiresAt: result.expiresAt
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
