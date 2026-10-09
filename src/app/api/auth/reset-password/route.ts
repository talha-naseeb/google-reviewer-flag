import { NextResponse } from 'next/server';
import { resetPasswordWithCode } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, resetCode, newPassword } = body as {
      email?: string;
      resetCode?: string;
      newPassword?: string;
    };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!resetCode || !resetCode.trim()) {
      return NextResponse.json(
        { success: false, error: '6-digit verification reset code is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithCode(email.trim(), resetCode.trim(), newPassword.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Password reset failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You may now log in with your new credentials.'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
