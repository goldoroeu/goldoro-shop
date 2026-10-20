import { supabase } from "@/lib/supabase";
import Shop from "@/components/Shop";

export default async function HomePage() {
  const { data: products } = await supabase()
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  return <Shop products={products || []} />;
}
