import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Няма избран файл." }, { status: 400 });
  }
  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ error: "Позволени са само JPG, PNG или WEBP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файлът е по-голям от 5MB." }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  const path = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase()
    .storage.from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase().storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
