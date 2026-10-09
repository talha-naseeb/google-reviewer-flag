import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || key.startsWith('re_xxxx') || key.length < 10) {
    return null;
  }
  return new Resend(key);
}

export interface SendResetEmailParams {
  to: string;
  resetCode: string;
  expiresInMinutes?: number;
}

export async function sendPasswordResetEmail({
  to,
  resetCode,
  expiresInMinutes = 15
}: SendResetEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    console.warn('[Email] Resend API key is not configured or is a placeholder. Skipping email dispatch.');
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured in .env'
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'Google Review Moderator <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="padding: 28px 32px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #27272a;">
      <div style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Security Notice
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
        Google Review Moderation Portal
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
        Authorized Account Password Reset
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #d4d4d8; line-height: 1.6;">
        Hello,
      </p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #d4d4d8; line-height: 1.6;">
        A request was made to reset the password for your account (<strong>${to}</strong>). Enter the verification code below to complete your password update:
      </p>

      <!-- Code Box -->
      <div style="background-color: #09090b; border: 1px dashed #e11d48; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #a1a1aa; display: block; margin-bottom: 8px;">
          Your 6-Digit Verification Code
        </span>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #f43f5e; display: inline-block;">
          ${resetCode}
        </span>
        <span style="display: block; font-size: 12px; color: #71717a; margin-top: 8px;">
          Valid for ${expiresInMinutes} minutes
        </span>
      </div>

      <p style="margin: 0 0 8px 0; font-size: 13px; color: #a1a1aa; line-height: 1.5;">
        • Do not share this verification code with anyone.<br/>
        • If you did not request this change, please ignore this email; your account remains secure.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 20px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #71717a;">
        Google Content Moderation & AI Policy Flagging Suite
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `[${resetCode}] Your Password Reset Code - Google Review Moderator`,
      html: htmlContent
    });

    if (data.error) {
      console.error('[Email] Resend API error:', data.error);
      return { success: false, error: data.error.message };
    }

    console.log(`[Email] Password reset email sent to ${to} (Message ID: ${data.data?.id})`);
    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[Email] Unexpected error sending email via Resend:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}
