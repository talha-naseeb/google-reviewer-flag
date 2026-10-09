import { NextResponse } from 'next/server';
import { provisionUserWithTempPassword } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, tempPassword } = body as {
      email?: string;
      name?: string;
      role?: 'admin' | 'user';
      tempPassword?: string;
    };

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const result = await provisionUserWithTempPassword({
      email: email.trim(),
      name: name?.trim(),
      role: role || 'admin',
      tempPassword: tempPassword?.trim()
    });

    return NextResponse.json({
      success: true,
      message: `User ${result.email} provisioned successfully and credentials dispatched via email.`,
      email: result.email,
      emailSent: result.emailResult.success,
      emailError: result.emailResult.error || null
    });
  } catch (error: any) {
    console.error('Error provisioning user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
