import nodemailer from 'nodemailer';

function getMailTransporter() {
  const user = process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !pass) {
    return null;
  }

  // Clean pass in case user pasted 16-letter code with spaces (e.g. "abcd efgh ijkl mnop")
  const cleanPass = pass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass: cleanPass
    }
  });
}

export interface SendResetEmailParams {
  to: string;
  resetCode: string;
  expiresInMinutes?: number;
}

export interface SendNewUserEmailParams {
  to: string;
  tempPassword: string;
  name?: string;
  loginUrl?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetCode,
  expiresInMinutes = 15
}: SendResetEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const transporter = getMailTransporter();
  const user = process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();

  if (!transporter || !user) {
    console.warn('[Email] Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in .env.');
    return {
      success: false,
      error: 'Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in .env'
    };
  }

  const fromEmail = process.env.SMTP_FROM?.trim() || `"Google Review Moderator" <${user}>`;

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
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: `[${resetCode}] Your Password Reset Code - Google Review Moderator`,
      html: htmlContent
    });

    console.log(`[Email] Password reset email sent to ${to} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (err: any) {
    console.error('[Email] Unexpected error sending email via Gmail SMTP:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}

export async function sendNewUserInvitationEmail({
  to,
  tempPassword,
  name = 'Moderator',
  loginUrl = 'https://google-reviewer-flag.vercel.app/login'
}: SendNewUserEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const transporter = getMailTransporter();
  const user = process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();

  if (!transporter || !user) {
    console.warn('[Email] Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in .env.');
    return {
      success: false,
      error: 'Gmail SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in .env'
    };
  }

  const fromEmail = process.env.SMTP_FROM?.trim() || `"Google Review Moderator" <${user}>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Access Credentials</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="padding: 28px 32px; background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); border-bottom: 1px solid #27272a;">
      <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Account Provisioned
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
        Welcome to Google Review Moderator
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">
        Authorized Staff & Content Moderation Portal
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #d4d4d8; line-height: 1.6;">
        Hello <strong>${name}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #d4d4d8; line-height: 1.6;">
        Your administrative account has been created. Use the following credentials to access the moderation console:
      </p>

      <!-- Credentials Box -->
      <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;">
          <span style="display: block; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">Authorized Email</span>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 15px; color: #38bdf8; font-weight: 600;">${to}</span>
        </div>
        <div>
          <span style="display: block; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em;">Temporary Password</span>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 17px; color: #34d399; font-weight: 700; letter-spacing: 1px;">${tempPassword}</span>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Log In to Moderation Portal →
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5; border-top: 1px solid #27272a; padding-top: 16px;">
        🔒 <strong>Security recommendation:</strong> Please change your temporary password immediately under <em>Settings &gt; Change Password</em> upon your first login.
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
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: 'Welcome to Google Review Moderator - Your Login Credentials',
      html: htmlContent
    });

    console.log(`[Email] Welcome email sent to ${to} (Message ID: ${info.messageId})`);
    return { success: true, id: info.messageId };
  } catch (err: any) {
    console.error('[Email] Unexpected error sending welcome email via Gmail SMTP:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}
