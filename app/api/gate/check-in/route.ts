import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const PAYMENT_CONFIRMED = ["paid", "verified"];

function extractToken(value: string) {
  if (!value.includes("token=")) return value;
  try {
    return new URL(value, "http://gate.local").searchParams.get("token") ?? "";
  } catch {
    return "";
  }
}

function todayInSouthAfrica() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function POST(request: Request) {
  try {
    const staff = await requireAdminAccess();
    const body = await request.json().catch(() => ({}));
    const token = extractToken(typeof body?.token === "string" ? body.token.trim() : "");
    if (!token) return NextResponse.json({ error: "Invalid QR code." }, { status: 400 });

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id, reservation_code, customer_name, booking_date, booking_time, adults, children_3_plus, children_under_3, selected_area_id, booking_status, payment_status, checked_in, checked_in_at")
      .eq("check_in_token", token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Unable to check in reservation." }, { status: 500 });
    if (!booking) return NextResponse.json({ error: "Reservation could not be found." }, { status: 404 });
    if (booking.checked_in) return NextResponse.json({ error: "This booking has already been checked in.", booking }, { status: 409 });
    if (booking.booking_date !== todayInSouthAfrica()) return NextResponse.json({ error: "This booking is for another date.", booking }, { status: 409 });

    const paymentConfirmed = PAYMENT_CONFIRMED.includes(String(booking.payment_status ?? "").toLowerCase()) || booking.booking_status === "confirmed";
    if (!paymentConfirmed) return NextResponse.json({ error: "Payment is not confirmed.", booking }, { status: 409 });

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ checked_in: true, checked_in_at: new Date().toISOString(), checked_in_by: staff.email })
      .eq("id", booking.id)
      .eq("checked_in", false)
      .select("id, reservation_code, checked_in, checked_in_at")
      .maybeSingle();

    if (updateError) return NextResponse.json({ error: "Unable to complete check-in." }, { status: 500 });
    if (!updated) return NextResponse.json({ error: "This booking has already been checked in." }, { status: 409 });

    return NextResponse.json({ success: true, booking: updated });
  } catch {
    return NextResponse.json({ error: "Gate staff access is required." }, { status: 403 });
  }
}
