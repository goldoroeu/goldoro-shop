import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { data: product, error } = await supabase()
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !product) notFound();

  return (
    <main className="admin-page">
      <h1 style={{ marginBottom: "24px" }}>Редакция на продукт</h1>
      <ProductForm product={product} />
    </main>
  );
}
