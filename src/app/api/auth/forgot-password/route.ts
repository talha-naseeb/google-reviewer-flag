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

    const isApiKeyConfigured = Boolean(
      process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxxxxxxxx'
    );

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? `A 6-digit verification code has been dispatched to ${result.user.email}.`
        : 'Password reset code generated.',
      email: result.user.email,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      // Provide fallback resetCode for seamless testing if Resend key is not yet configured
      resetCode: isApiKeyConfigured && emailResult.success ? undefined : result.resetCode,
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
