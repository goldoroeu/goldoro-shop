import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ALLOWED_STATUSES = ["pending", "paid", "shipped", "cancelled"];

export async function PUT(req, { params }) {
  const body = await req.json().catch(() => ({}));
  const { status } = body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Невалиден статус." }, { status: 400 });
  }

  const { data, error } = await supabase()
    .from("orders")
    .update({ status })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
