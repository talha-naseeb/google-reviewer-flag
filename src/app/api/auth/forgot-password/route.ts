import { NextResponse } from 'next/server';
import { createPasswordResetCode } from '@/lib/users';
import { sendPasswordResetEmail } from '@/lib/email';

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

    // Dispatch email via Resend API
    const emailResult = await sendPasswordResetEmail({
      to: result.user.email,
      resetCode: result.resetCode,
      expiresInMinutes: 15
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Failed to send verification email. Please check your email configuration.'
        },
        { status: 502 }
      );
    }

    // Never return the resetCode in the API response - it must be retrieved from the user's email
    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${result.user.email}.`,
      email: result.user.email,
      emailSent: true
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
