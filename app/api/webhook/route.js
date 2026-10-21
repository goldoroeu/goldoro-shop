import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const lineItems = await stripe().checkout.sessions.listLineItems(session.id, { limit: 100 });

    const shippingAddress = session.shipping_details?.address;
    const addressLine = shippingAddress
      ? [shippingAddress.line1, shippingAddress.line2, shippingAddress.postal_code, shippingAddress.city, shippingAddress.country]
          .filter(Boolean)
          .join(", ")
      : null;

    await supabase()
      .from("orders")
      .upsert(
        {
          payment_method: "card",
          status: "paid",
          stripe_session_id: session.id,
          customer_name: session.customer_details?.name || session.shipping_details?.name || null,
          customer_email: session.customer_details?.email || null,
          customer_phone: session.customer_details?.phone || null,
          shipping_address: addressLine,
          amount_total: session.amount_total,
          currency: session.currency,
          items: lineItems.data.map((li) => ({
            name: li.description,
            quantity: li.quantity,
            amount_total: li.amount_total,
          })),
        },
        { onConflict: "stripe_session_id", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ received: true });
}
