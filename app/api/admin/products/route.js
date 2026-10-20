import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const { name, category, proba, weight, description, price, image_url, in_stock } = body;

  if (!name || !category || price === undefined || price === null || price === "") {
    return NextResponse.json({ error: "Име, категория и цена са задължителни." }, { status: 400 });
  }

  const priceCents = Math.round(Number(price) * 100);
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    return NextResponse.json({ error: "Невалидна цена." }, { status: 400 });
  }

  const { data, error } = await supabase()
    .from("products")
    .insert({
      name,
      category,
      proba: proba || "585°",
      weight: weight || null,
      description: description || null,
      price_cents: priceCents,
      image_url: image_url || null,
      in_stock: in_stock !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
