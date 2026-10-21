import { supabase } from "@/lib/supabase";
import CheckoutClient from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { data: products } = await supabase().from("products").select("*");

  return <CheckoutClient products={products || []} />;
}
