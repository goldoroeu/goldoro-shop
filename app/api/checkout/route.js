import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const items = body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Количката е празна." }, { status: 400 });
  }

  const ids = items.map((i) => i.id);
  const { data: products, error } = await supabase()
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const line_items = items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product || !product.in_stock) return null;
      const qty = Math.max(1, Math.min(10, Number(item.qty) || 1));
      return {
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: product.price_cents,
          product_data: {
            name: product.name,
            description: `Проба ${product.proba}${product.weight ? " · " + product.weight : ""}`,
            images: product.image_url ? [product.image_url] : undefined,
          },
        },
      };
    })
    .filter(Boolean);

  if (line_items.length === 0) {
    return NextResponse.json({ error: "Продуктите в количката не са налични." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    shipping_address_collection: {
      allowed_countries: ["BG", "GR", "RO", "DE", "FR", "IT", "ES", "AT", "NL", "BE"],
    },
    phone_number_collection: { enabled: true },
  });

  return NextResponse.json({ url: session.url });
}
