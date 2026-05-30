/**
 * Email service — sends verification codes via Gmail SMTP.
 *
 * Required env vars:
 *   GMAIL_USER     — your Gmail address (e.g. gnosis.app.noreply@gmail.com)
 *   GMAIL_APP_PASS — a 16-char App Password generated from
 *                    Google Account → Security → 2-Step Verification → App passwords
 *
 * The transporter is created lazily so the server still starts if email
 * isn't configured yet (endpoints will return a helpful error instead).
 */
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASS?.trim();

  if (!user || !pass) {
    throw new Error(
      "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASS in .env",
    );
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return _transporter;
}

/**
 * Send a 6-digit verification code email.
 */
export async function sendVerificationEmail(
  to: string,
  code: string,
): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.GMAIL_USER!;

  await transporter.sendMail({
    from: `"Gnosis" <${from}>`,
    to,
    subject: `${code} is your Gnosis verification code`,
    text: [
      `Hi there,`,
      ``,
      `Your verification code is: ${code}`,
      ``,
      `This code expires in 10 minutes. If you didn't sign up for Gnosis, you can safely ignore this email.`,
      ``,
      `— The Gnosis Team`,
    ].join("\n"),
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FAF8F5; border-radius: 16px;">
        <h1 style="font-size: 24px; color: #1A1714; margin: 0 0 8px;">Gnosis</h1>
        <p style="font-size: 11px; color: #9E9890; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px;">The Academic Archive</p>
        <p style="font-size: 14px; color: #6B6560; margin: 0 0 16px;">Your verification code is:</p>
        <div style="background: #fff; border: 1px solid #E5DDD5; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1A1714;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #9E9890; margin: 0;">This code expires in 10 minutes. If you didn't sign up for Gnosis, you can safely ignore this email.</p>
      </div>
    `,
  });
}
