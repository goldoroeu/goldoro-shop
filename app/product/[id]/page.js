import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { data: product } = await supabase()
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("in_stock", true)
    .single();

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
