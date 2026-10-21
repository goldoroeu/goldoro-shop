import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { items, customer } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Количката е празна." }, { status: 400 });
  }

  const name = (customer?.name || "").trim();
  const phone = (customer?.phone || "").trim();
  const deliveryType = customer?.deliveryType === "office" ? "office" : "address";
  const address = (customer?.address || "").trim();
  const email = (customer?.email || "").trim();

  if (!name || !phone || !address) {
    return NextResponse.json({ error: "Име, телефон и адрес/офис са задължителни." }, { status: 400 });
  }

  const ids = items.map((i) => i.id);
  const { data: products, error } = await supabase()
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orderItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product || !product.in_stock) return null;
      const qty = Math.max(1, Math.min(10, Number(item.qty) || 1));
      return { name: product.name, quantity: qty, amount_total: product.price_cents * qty };
    })
    .filter(Boolean);

  if (orderItems.length === 0) {
    return NextResponse.json({ error: "Продуктите в количката не са налични." }, { status: 400 });
  }

  const amountTotal = orderItems.reduce((sum, i) => sum + i.amount_total, 0);

  const { data: order, error: insertError } = await supabase()
    .from("orders")
    .insert({
      payment_method: "cod",
      status: "pending",
      customer_name: name,
      customer_email: email || null,
      customer_phone: phone,
      delivery_type: deliveryType,
      shipping_address: address,
      amount_total: amountTotal,
      currency: "eur",
      items: orderItems,
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, orderId: order.id });
}
