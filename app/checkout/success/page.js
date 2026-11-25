import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import ClearCart from "@/components/ClearCart";

export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  let session = null;
  let orderNumber = null;

  if (sessionId) {
    try {
      session = await stripe().checkout.sessions.retrieve(sessionId);
    } catch {
      session = null;
    }

    const { data: order } = await supabase()
      .from("orders")
      .select("order_number")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    orderNumber = order?.order_number || null;
  }

  return (
    <main className="status-page">
      <ClearCart />
      <div className="status-card">
        <p className="eyebrow">Поръчка приета</p>
        <h1>Благодарим за поръчката!</h1>
        {orderNumber && <p className="order-number">Номер на поръчката: №{orderNumber}</p>}
        <p>
          {session?.customer_details?.email
            ? `Изпратихме потвърждение на ${session.customer_details.email}.`
            : "Ще се свържем с вас за потвърждение на поръчката."}
        </p>
        <Link className="btn btn-gold" href="/">
          Към магазина
        </Link>
      </div>
    </main>
  );
}
