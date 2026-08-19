import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/auth/admin";
import { getPrivateReceiptUrl } from "@/lib/payments/manual";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const SIGNED_OBJECT_PREFIX = "/storage/v1/object/sign/payment-receipts/";

function getStoredReceiptPath(receiptUrl: string) {
  try {
    const url = new URL(receiptUrl);
    const markerIndex = url.pathname.indexOf(SIGNED_OBJECT_PREFIX);
    if (markerIndex === -1) return null;

    const encodedPath = url.pathname.slice(markerIndex + SIGNED_OBJECT_PREFIX.length);
    return encodedPath ? decodeURIComponent(encodedPath) : null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    await requireAdminAccess();
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select("receipt_url")
      .eq("booking_id", bookingId)
      .eq("provider", "manual")
      .not("receipt_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Unable to load receipt." }, { status: 500 });
    }

    if (!payment?.receipt_url) {
      return NextResponse.json({ error: "No receipt uploaded." }, { status: 404 });
    }

    const storagePath = getStoredReceiptPath(payment.receipt_url);
    if (!storagePath) {
      return NextResponse.json({ error: "Receipt path is unavailable." }, { status: 404 });
    }

    const signedUrl = await getPrivateReceiptUrl(storagePath, 15 * 60);
    if (!signedUrl) {
      return NextResponse.json({ error: "Unable to open receipt." }, { status: 404 });
    }

    return NextResponse.redirect(signedUrl);
  } catch {
    return NextResponse.json({ error: "Admin receipt access is required." }, { status: 403 });
  }
}
