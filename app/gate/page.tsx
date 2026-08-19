"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function GateContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(() => searchParams.get("token") ?? "");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/gate/check-in")
      .then((response) => response.json().catch(() => ({})))
      .then((data) => setAuthenticated(data.authenticated === true))
      .catch(() => setAuthenticated(false));
  }, []);

  async function verify(tokenValue = token) {
    setChecking(true);
    setError("");
    setResult(null);
    const response = await fetch(`/api/gate/verify?token=${encodeURIComponent(tokenValue)}`);
    const data = await response.json().catch(() => ({}));
    setChecking(false);
    if (!response.ok) setError(data.error || "Unable to verify reservation.");
    else setResult(data);
  }

  useEffect(() => {
    const initialToken = searchParams.get("token") ?? "";
    if (initialToken) void verify(initialToken);
  }, [searchParams]);

  async function checkIn() {
    const response = await fetch("/api/gate/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error || "Unable to check in reservation.");
    else setResult((current: any) => ({ ...current, checkedIn: true, booking: { ...current?.booking, ...data.booking } }));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Gate staff</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Chamlija Gate Check-in</h1>
        <p className="mt-2 text-sm text-slate-500">Scan a reservation QR or enter its secure token.</p>
        <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste QR token or URL" className="mt-6 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm" />
        <button type="button" onClick={() => verify()} disabled={!token || checking} className="mt-3 min-h-12 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{checking ? "Checking..." : "Verify Reservation"}</button>
        {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div>}
        {result?.booking && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-sm font-black text-emerald-950">{!result.paymentConfirmed ? "⚠ PAYMENT NOT CONFIRMED" : !result.bookingConfirmed ? "⚠ BOOKING NOT CONFIRMED" : result.dateStatus === "today" ? "✓ CHECK-IN APPROVED" : result.dateStatus === "future" ? "✓ RESERVATION VERIFIED" : "⚠ RESERVATION EXPIRED"}</div><div className="mt-3 space-y-1 text-sm"><div>Customer: {result.booking.customer_name || "—"}</div><div>Booking: {result.booking.reservation_code || result.booking.id}</div><div>Date: {result.booking.booking_date}</div><div>Arrival: {result.booking.booking_time || "—"}</div><div>Adults: {result.booking.adults ?? 0}</div><div>Children: {(result.booking.children_3_plus ?? 0) + (result.booking.children_under_3 ?? 0)}</div><div>Picnic Area: {result.booking.area_name || "No Picnic Area"}</div><div>Payment Status: {result.booking.payment_status || "—"}</div><div>Booking Status: {result.booking.booking_status || "—"}</div></div>{result.booking.checked_in ? <div className="mt-4 font-bold text-amber-800">Already checked in{result.booking.checked_in_at ? ` · ${result.booking.checked_in_at}` : ""}{result.booking.checked_in_by ? ` · ${result.booking.checked_in_by}` : ""}</div> : !result.paymentConfirmed ? <div className="mt-4 text-sm font-semibold text-amber-800">{result.paymentError || "Payment has not been confirmed by Chamlija staff. Entry is not available until payment is approved."}</div> : !result.bookingConfirmed ? <div className="mt-4 text-sm font-semibold text-amber-800">Booking has not been confirmed.</div> : result.dateStatus === "future" ? <div className="mt-4 text-sm font-semibold text-emerald-800">This reservation is confirmed for {result.booking.booking_date}. Check-in will be available on the reservation date.</div> : result.dateStatus === "past" ? <div className="mt-4 text-sm font-semibold text-amber-800">This reservation date has passed. Check-in is no longer available.</div> : authenticated ? <button type="button" onClick={checkIn} className="mt-5 min-h-12 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white">ALLOW ENTRY</button> : <div className="mt-4 text-sm font-semibold text-amber-800">Gate staff authentication is required to check in.</div>}</div>}
      </div>
    </main>
  );
}

export default function GatePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" />}>
      <GateContent />
    </Suspense>
  );
}
