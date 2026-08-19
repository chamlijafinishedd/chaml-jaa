import QRCode from "qrcode";
import { Resend } from "resend";

const PRODUCTION_SITE_URL = "https://part8-chamlija.vercel.app";

type ReservationEmailData = {
  email: string | null | undefined;
  customerName: string | null | undefined;
  reservationCode: string | null | undefined;
  bookingDate: string | null | undefined;
  bookingTime: string | null | undefined;
  guests: number;
  total: number | null | undefined;
  paymentMethod: string | null | undefined;
  paymentStatus: string | null | undefined;
  bookingStatus: string | null | undefined;
  checkInToken?: string | null;
  rejectionReason?: string | null;
};

type EmailResult = {
  sent: boolean;
  warning?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "—")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: number | null | undefined) {
  return `R ${Number(value ?? 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function baseLayout(title: string, content: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f1e8;color:#17352b;font-family:Arial,sans-serif"><div style="max-width:640px;margin:0 auto;padding:24px 14px"><div style="background:#0f6b4f;color:#fff;padding:22px 24px;border-radius:18px 18px 0 0"><div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700">Büyük Chamlija</div><h1 style="margin:10px 0 0;font-size:28px">${escapeHtml(title)}</h1></div><div style="background:#fff;padding:24px;border-radius:0 0 18px 18px">${content}<p style="margin:28px 0 0;color:#718078;font-size:12px">Büyük Chamlija · Escape to Nature</p></div></div></body></html>`;
}

function reservationDetails(data: ReservationEmailData) {
  return `<div style="background:#f7faf8;border:1px solid #d8e9df;border-radius:14px;padding:16px"><p style="margin:0 0 12px;font-weight:700;color:#0f6b4f">Reservation details</p><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><td style="padding:6px 0;color:#718078">Reference</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(data.reservationCode)}</td></tr><tr><td style="padding:6px 0;color:#718078">Date</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(data.bookingDate)}</td></tr><tr><td style="padding:6px 0;color:#718078">Arrival</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(data.bookingTime)}</td></tr><tr><td style="padding:6px 0;color:#718078">Guests</td><td style="padding:6px 0;text-align:right;font-weight:700">${data.guests}</td></tr><tr><td style="padding:6px 0;color:#718078">Total</td><td style="padding:6px 0;text-align:right;font-weight:700">${formatMoney(data.total)}</td></tr><tr><td style="padding:6px 0;color:#718078">Payment method</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(data.paymentMethod)}</td></tr><tr><td style="padding:6px 0;color:#718078">Payment status</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(data.paymentStatus)}</td></tr><tr><td style="padding:6px 0;color:#718078">Booking status</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(data.bookingStatus)}</td></tr></table></div>`;
}

async function sendEmail(data: ReservationEmailData, subject: string, html: string): Promise<EmailResult> {
  const email = String(data.email ?? "").trim();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!email || !apiKey || !from) {
    return { sent: false, warning: "Email provider is not configured or the booking has no valid email address." };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({ from, to: email, subject, html });
    if (result.error) return { sent: false, warning: result.error.message };
    return { sent: true };
  } catch (error) {
    return { sent: false, warning: error instanceof Error ? error.message : "Email provider request failed." };
  }
}

export async function sendReservationReceivedEmail(data: ReservationEmailData): Promise<EmailResult> {
  const content = `<p style="font-size:16px;line-height:1.6">Hi ${escapeHtml(data.customerName)}, your Chamlija reservation was received successfully.</p><p style="font-size:15px;line-height:1.6;color:#8a5b00;background:#fff8df;border:1px solid #f0ce67;border-radius:12px;padding:14px"><strong>Payment awaiting verification.</strong> Entry is not available until Chamlija staff approve your payment.</p>${reservationDetails(data)}`;
  return sendEmail(data, "Chamlija reservation received", baseLayout("Reservation received", content));
}

export async function sendPaymentConfirmedEmail(data: ReservationEmailData): Promise<EmailResult> {
  const checkInUrl = data.checkInToken ? `${PRODUCTION_SITE_URL}/gate/check-in?token=${encodeURIComponent(data.checkInToken)}` : null;
  const qrDataUrl = checkInUrl ? await QRCode.toDataURL(checkInUrl, { width: 320, margin: 2 }) : null;
  const qr = checkInUrl && qrDataUrl ? `<div style="margin:20px 0;text-align:center"><img src="${qrDataUrl}" width="260" height="260" alt="Chamlija gate check-in QR code" style="max-width:100%;height:auto"/><p style="margin:12px 0"><a href="${checkInUrl}" style="color:#0f6b4f;font-weight:700">Open / save QR code</a></p></div><div style="background:#fff4d6;border:2px solid #e1a900;border-radius:14px;padding:16px;font-size:15px;line-height:1.6"><strong>IMPORTANT — SAVE YOUR QR CODE</strong><br/>You MUST show this QR code at the Chamlija gate to enter.</div>` : "";
  const content = `<p style="font-size:16px;line-height:1.6">Hi ${escapeHtml(data.customerName)}, your payment has been confirmed by Chamlija staff.</p>${reservationDetails(data)}${qr}`;
  return sendEmail(data, "PAYMENT CONFIRMED · Chamlija", baseLayout("Payment confirmed", content));
}

export async function sendPaymentRejectedEmail(data: ReservationEmailData): Promise<EmailResult> {
  const content = `<p style="font-size:16px;line-height:1.6">Hi ${escapeHtml(data.customerName)}, your payment could not be verified.</p><div style="background:#fff0f0;border:2px solid #d64545;border-radius:14px;padding:16px;color:#8d1e1e;line-height:1.6"><strong>PAYMENT VERIFICATION FAILED</strong><br/>Reason: ${escapeHtml(data.rejectionReason || "Payment receipt could not be verified.")}</div><p style="font-size:15px;line-height:1.6">Please contact Chamlija staff or submit a new payment receipt if applicable.</p>${reservationDetails(data)}`;
  return sendEmail(data, "PAYMENT VERIFICATION FAILED · Chamlija", baseLayout("Payment verification failed", content));
}
