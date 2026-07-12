import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Preferred: Gmail via OAuth2 (your own Google account — no third-party email service)
  const gUser = process.env.GMAIL_USER;
  const gClientId = process.env.GMAIL_CLIENT_ID;
  const gClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (gUser && gClientId && gClientSecret && gRefreshToken) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gUser,
        clientId: gClientId,
        clientSecret: gClientSecret,
        refreshToken: gRefreshToken,
      },
    });
    return transporter;
  }

  // Fallback: plain SMTP (user + password)
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  return transporter;
}

const FROM =
  process.env.EMAIL_FROM ||
  (process.env.GMAIL_USER ? `ZaraSuno <${process.env.GMAIL_USER}>` : "ZaraSuno <sales@zarasuno.app>");

const LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  "https://ttxgowlsvutggtqauuza.supabase.co/storage/v1/object/public/book-covers/brand/goldenlogo.png";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zarasuno.app";

export async function sendCoinsEmail(opts: {
  to: string | null | undefined;
  name?: string | null;
  coins: number;
  balance?: number | null;
  packageName?: string | null;
}) {
  const t = getTransporter();
  if (!t || !opts.to) return; // email not configured or no recipient — skip silently

  const name = opts.name || "there";
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#6B7A73;font-size:14px;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);color:#14211D;font-size:14px;font-weight:700;text-align:right;">${value}</td>
    </tr>`;

  const summaryRows =
    row("Coins added", `+${opts.coins}`) +
    (opts.packageName ? row("Package", opts.packageName) : "") +
    (opts.balance != null ? row("New balance", `${opts.balance} coins`) : "");

  const bullet = (text: string) => `
    <tr><td style="padding:6px 0;color:#14211D;font-size:14px;vertical-align:top;width:26px;">✅</td>
        <td style="padding:6px 0;color:#14211D;font-size:14px;">${text}</td></tr>`;

  const html = `
  <div style="background:#F7F3EA;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 34px -14px rgba(11,93,75,0.22);">
      <div style="background:linear-gradient(135deg,#0E6E58,#0B5D4B);padding:26px 32px;text-align:center;">
        <img src="${LOGO_URL}" alt="ZaraSuno" width="132" style="height:auto;max-width:132px;display:inline-block;" />
      </div>
      <div style="padding:30px 32px;">
        <h1 style="margin:0 0 6px;font-size:22px;color:#14211D;font-weight:800;">Your coins are ready! 🎉</h1>
        <p style="margin:0 0 18px;color:#6B7A73;font-size:14px;">Assalam-o-Alaikum ${name}, your payment is confirmed.</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EA;border-radius:12px;padding:6px 16px;margin:0 0 22px;">
          ${summaryRows}
        </table>

        <p style="margin:0 0 8px;color:#14211D;font-size:15px;font-weight:700;">What you can do now:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          ${bullet("Unlock and listen to full <b>audiobooks</b>")}
          ${bullet("Read quick <b>book summaries</b>")}
          ${bullet("Open premium <b>eBooks</b>")}
          ${bullet("Use your coins anytime — they don’t expire")}
        </table>

        <a href="${SITE_URL}" style="display:inline-block;background:#D9A94C;color:#031D18;text-decoration:none;font-weight:800;padding:13px 26px;border-radius:12px;font-size:15px;">Start Listening & Reading</a>

        <p style="margin:22px 0 0;color:#6B7A73;font-size:13px;">Enjoy ZaraSuno — happy listening & reading! 📚🎧</p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid rgba(0,0,0,0.06);color:#9aa8a0;font-size:12px;text-align:center;">
        This is an automated message from ZaraSuno. Please do not reply to this email.
      </div>
    </div>
  </div>`;

  try {
    await t.sendMail({
      from: FROM,
      to: opts.to,
      subject: `🎉 ${opts.coins} coins added to your ZaraSuno account`,
      html,
    });
  } catch (e) {
    console.error("sendCoinsEmail failed:", e);
  }
}
