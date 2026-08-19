"use client";

import { QRCodeSVG } from "qrcode.react";

type CheckInQrProps = {
  token: string | null | undefined;
  paymentStatus: string | null | undefined;
};

export function CheckInQr({ token, paymentStatus }: CheckInQrProps) {
  if (!token) return null;

  const checkInUrl = typeof window === "undefined" ? `/gate/check-in?token=${encodeURIComponent(token)}` : `${window.location.origin}/gate/check-in?token=${encodeURIComponent(token)}`;
  const normalizedPaymentStatus = String(paymentStatus ?? "pending").trim().toLowerCase();
  const paymentConfirmed = ["paid", "verified"].includes(normalizedPaymentStatus);

  return (
    <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Gate Check-in QR</div>
      <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3 shadow-sm">
        <QRCodeSVG value={checkInUrl} size={220} level="M" includeMargin aria-label="Reservation gate check-in QR code" />
      </div>
      <p className="mt-4 text-sm font-semibold text-emerald-950">Please keep this QR code and show it to our gate staff when you arrive.</p>
      {!paymentConfirmed && <p className="mt-2 text-xs font-semibold text-amber-800">Payment verification pending. Entry is not available until payment is confirmed.</p>}
    </div>
  );
}
