import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

function todayInSouthAfrica() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
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

    const base = {
      booking: { ...booking, area_name: area?.name ?? "No Picnic Area" },
      paymentConfirmed: String(booking.payment_status ?? "").toLowerCase() === "paid",
      bookingConfirmed: String(booking.booking_status ?? "").toLowerCase() === "confirmed",
      isToday: booking.booking_date === todayInSouthAfrica(),
    };

    return NextResponse.json({ success: true, ...base });
  } catch {
    return NextResponse.json({ error: "Unable to verify QR code." }, { status: 500 });
  }
}
