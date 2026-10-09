import { NextResponse } from 'next/server';
import { changePassword } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword } = body as {
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const targetEmail = (email && email.trim()) || 'admin@googlereviewer.com';

    if (!currentPassword || !currentPassword.trim()) {
      return NextResponse.json(
        { success: false, error: 'Current password is required.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await changePassword(targetEmail, currentPassword, newPassword.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Password update failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully changed! Use your new credentials for future logins.'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
