import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const CONFIRMED_PAYMENT_STATUSES = ["paid", "verified"];

function todayInSouthAfrica() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function getDateStatus(bookingDate: string | null | undefined, today: string) {
  if (!bookingDate) return "past";
  if (bookingDate === today) return "today";
  return bookingDate > today ? "future" : "past";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawToken = typeof body?.token === "string" ? body.token.trim() : "";
    const token = rawToken.includes("token=") ? new URL(rawToken, "http://gate.local").searchParams.get("token") ?? "" : rawToken;

    if (!token) return NextResponse.json({ error: "Invalid QR code." }, { status: 400 });

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id, reservation_code, customer_name, booking_date, booking_time, adults, children_3_plus, children_under_3, selected_area_id, booking_status, payment_status, checked_in, checked_in_at, checked_in_by")
      .eq("check_in_token", token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Unable to verify QR code." }, { status: 500 });
    if (!booking) return NextResponse.json({ error: "Reservation could not be found." }, { status: 404 });

    const { data: area } = booking.selected_area_id
      ? await supabaseAdmin.from("products").select("name").eq("id", booking.selected_area_id).maybeSingle()
      : { data: null };

    const today = todayInSouthAfrica();
    const paymentConfirmed = CONFIRMED_PAYMENT_STATUSES.includes(String(booking.payment_status ?? "").toLowerCase());
    const bookingConfirmed = String(booking.booking_status ?? "").toLowerCase() === "confirmed";
    const dateStatus = getDateStatus(booking.booking_date, today);
    const base = {
      booking: { ...booking, area_name: area?.name ?? "No Picnic Area" },
      paymentConfirmed,
      paymentError: paymentConfirmed ? null : "Payment has not been confirmed by Chamlija staff. Entry is not available until payment is approved.",
      bookingConfirmed,
      isToday: booking.booking_date === today,
      dateStatus,
      verificationStatus: !paymentConfirmed ? "PAYMENT NOT CONFIRMED" : !bookingConfirmed ? "BOOKING NOT CONFIRMED" : dateStatus === "today" ? "CHECK-IN APPROVED" : dateStatus === "future" ? "RESERVATION VERIFIED" : "RESERVATION EXPIRED",
      checkInEligible: paymentConfirmed && bookingConfirmed && dateStatus === "today" && !booking.checked_in,
    };

    return NextResponse.json({ success: true, ...base });
  } catch {
    return NextResponse.json({ error: "Unable to verify QR code." }, { status: 500 });
  }
}
