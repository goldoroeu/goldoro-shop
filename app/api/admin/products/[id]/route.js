import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const { name, category, proba, weight, description, price, image_url, in_stock } = body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (category !== undefined) update.category = category;
  if (proba !== undefined) update.proba = proba;
  if (weight !== undefined) update.weight = weight || null;
  if (description !== undefined) update.description = description || null;
  if (image_url !== undefined) update.image_url = image_url || null;
  if (in_stock !== undefined) update.in_stock = in_stock;

  if (price !== undefined && price !== "") {
    const priceCents = Math.round(Number(price) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      return NextResponse.json({ error: "Невалидна цена." }, { status: 400 });
    }
    update.price_cents = priceCents;
  }

  const { data, error } = await supabase()
    .from("products")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(req, { params }) {
  const { error } = await supabase().from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
