import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

function normalizePaymentMethod(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase().replace(/[-\s]+/g, "_");
}

function isBankTransferPaymentMethod(value: string | null | undefined) {
  const normalized = normalizePaymentMethod(value);
  const bankTransferMethods = new Set([
    "bank_transfer",
    "banktransfer",
    "manual",
    "manual_payment",
    "manual_bank_transfer",
    "manual_bank_payment",
    "bank_transfer_manual",
    "bank_transfer_manual_payment",
    "bank_transfer_payment",
  ]);

  return bankTransferMethods.has(normalized) || normalized.includes("bank") || (normalized.includes("manual") && normalized.includes("bank"));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  try {
    const adminSession = await requireAdminAccess();

    const { bookingId } = await params;
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "").trim();
    const adminNote = String(formData.get("adminNote") ?? "").trim();
    const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("id, payment_method, payment_status, booking_status, total_price")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isBankTransferPaymentMethod(booking.payment_method)) {
      return NextResponse.json({ error: "This booking does not use bank transfer" }, { status: 400 });
    }

    const { data: payment, error: paymentLookupError } = await supabaseAdmin
      .from("payments")
      .select("id, status, review_status, review_note, rejection_reason")
      .eq("booking_id", bookingId)
      .eq("provider", "manual")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentLookupError) {
      return NextResponse.json({ error: paymentLookupError.message }, { status: 500 });
    }

    const previousStatus = payment?.status ?? booking.payment_status ?? "pending_payment";
    const adminUser = (await supabaseAdmin.auth.getUser()).data.user;
    const auditNote = adminNote || payment?.review_note || "Reviewed by admin.";

    if (action === "approve") {
      if (payment?.status === "paid" && payment.review_status === "approved") {
        return NextResponse.json({ error: "This payment has already been approved." }, { status: 409 });
      }

      const { data: updatedBooking, error: bookingUpdateError } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "paid",
          booking_status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select("id, payment_status, booking_status")
        .maybeSingle();

      if (bookingUpdateError) {
        return NextResponse.json({ error: bookingUpdateError.message }, { status: 500 });
      }
      if (!updatedBooking) {
        return NextResponse.json({ error: "Booking approval was not persisted." }, { status: 500 });
      }

      const paymentUpdate = {
        status: "paid",
        review_status: "approved",
        reviewed_at: new Date().toISOString(),
        review_note: auditNote,
        rejection_reason: null,
        verified_by: adminSession.email,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data: updatedPayment, error: paymentError } = payment
        ? await supabaseAdmin.from("payments").update(paymentUpdate).eq("id", payment.id).select("id, status, review_status").maybeSingle()
        : { data: null, error: new Error("Manual payment record not found.") };

      if (paymentError || !updatedPayment) {
        return NextResponse.json({ error: paymentError?.message ?? "Manual payment approval was not persisted." }, { status: 500 });
      }

      await supabaseAdmin.from("payment_audit_logs").insert({
        payment_id: payment?.id ?? null,
        booking_id: bookingId,
        admin_user_id: adminUser?.id ?? null,
        previous_status: previousStatus,
        new_status: "approved",
        admin_note: auditNote,
        rejection_reason: null,
      });

      return NextResponse.json({
        ok: true,
        bookingId,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        reviewStatus: "approved",
      });
    }

    if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json({ error: "A rejection reason is required." }, { status: 400 });
      }
      if (payment?.status === "rejected" && payment.review_status === "rejected") {
        return NextResponse.json({ error: "This payment has already been rejected." }, { status: 409 });
      }

      const { data: updatedPayment, error: paymentError } = payment
        ? await supabaseAdmin
        .from("payments")
        .update({
          status: "rejected",
          review_status: "rejected",
          reviewed_at: new Date().toISOString(),
          review_note: auditNote,
          rejection_reason: rejectionReason,
          verified_by: adminSession.email,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .select("id, status, review_status, rejection_reason")
        .maybeSingle()
        : { data: null, error: new Error("Manual payment record not found.") };

      if (paymentError || !updatedPayment) {
        return NextResponse.json({ error: paymentError?.message ?? "Payment rejection was not persisted." }, { status: 500 });
      }

      const { data: updatedBooking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "rejected",
          booking_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select("id, payment_status, booking_status")
        .maybeSingle();

      if (bookingError || !updatedBooking) {
        return NextResponse.json({ error: bookingError?.message ?? "Booking rejection was not persisted." }, { status: 500 });
      }

      await supabaseAdmin.from("payment_audit_logs").insert({
        payment_id: payment?.id ?? null,
        booking_id: bookingId,
        admin_user_id: adminUser?.id ?? null,
        previous_status: previousStatus,
        new_status: "rejected",
        admin_note: auditNote,
        rejection_reason: rejectionReason,
      });

      return NextResponse.json({ ok: true, bookingId, action: "reject", rejectionReason });
    }

    if (action === "resubmit") {
      const finalReason = rejectionReason || "Please upload a clearer receipt.";
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "receipt_required",
          review_status: "resubmission_requested",
          reviewed_at: new Date().toISOString(),
          review_note: auditNote,
          rejection_reason: finalReason,
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", bookingId)
        .eq("provider", "manual");

      if (paymentError) {
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }

      await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "receipt_required",
          booking_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      await supabaseAdmin.from("payment_audit_logs").insert({
        payment_id: payment?.id ?? null,
        booking_id: bookingId,
        admin_user_id: adminUser?.id ?? null,
        previous_status: previousStatus,
        new_status: "resubmission_requested",
        admin_note: auditNote,
        rejection_reason: finalReason,
      });

      return NextResponse.json({ ok: true, bookingId, action: "resubmit" });
    }

    return NextResponse.json({ error: "Invalid review action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
