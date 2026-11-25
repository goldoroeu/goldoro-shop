import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { sendTelegramMessage, formatOrderMessage } from "@/lib/telegram";

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
    const lineItems = await stripe().checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price.product"],
    });

    const shippingAddress = session.shipping_details?.address;
    const addressLine = shippingAddress
      ? [shippingAddress.line1, shippingAddress.line2, shippingAddress.postal_code, shippingAddress.city, shippingAddress.country]
          .filter(Boolean)
          .join(", ")
      : null;

    const orderItems = lineItems.data.map((li) => ({
      name: li.description,
      catalog_number: li.price?.product?.metadata?.catalog_number || null,
      quantity: li.quantity,
      amount_total: li.amount_total,
    }));

    const { data: inserted } = await supabase()
      .from("orders")
      .upsert(
        {
          payment_method: "card",
          status: "paid",
          stripe_session_id: session.id,
          customer_name: session.customer_details?.name || session.shipping_details?.name || null,
          customer_email: session.customer_details?.email || null,
          customer_phone: session.customer_details?.phone || null,
          city: shippingAddress?.city || null,
          shipping_address: addressLine,
          amount_total: session.amount_total,
          currency: session.currency,
          items: orderItems,
        },
        { onConflict: "stripe_session_id", ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    // Ако реда вече съществуваше (повторен webhook от Stripe), insert е пропуснат
    // и тук data е null — не пращаме известие повторно за същата поръчка.
    if (inserted) {
      await sendTelegramMessage(
        formatOrderMessage({
          orderNumber: inserted.order_number,
          paymentMethod: "card",
          status: "paid",
          customerName: inserted.customer_name,
          customerPhone: inserted.customer_phone,
          city: inserted.city,
          address: inserted.shipping_address,
          items: orderItems,
          amountTotal: session.amount_total,
          currency: session.currency,
        })
      );
    }
  }

  return NextResponse.json({ received: true });
}
