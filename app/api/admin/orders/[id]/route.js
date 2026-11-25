import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail, shippedEmailHtml } from "@/lib/email";

const ALLOWED_STATUSES = ["pending", "paid", "shipped", "cancelled"];

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const { status } = body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Невалиден статус." }, { status: 400 });
  }

  const { data: existing } = await supabase()
    .from("orders")
    .select("status")
    .eq("id", params.id)
    .single();

  const { data, error } = await supabase()
    .from("orders")
    .update({ status })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Пращаме имейл само при реален преход към "изпратена" — не и ако статусът
  // вече си е бил "изпратена" (напр. случаен повторен запис).
  if (status === "shipped" && existing?.status !== "shipped" && data.customer_email) {
    await sendEmail({
      to: data.customer_email,
      subject: `Поръчка №${data.order_number} е изпратена — Gold'Oro`,
      html: shippedEmailHtml({
        orderNumber: data.order_number,
        customerName: data.customer_name,
        items: data.items,
        amountTotal: data.amount_total,
      }),
    });
  }

  return NextResponse.json({ order: data });
}
