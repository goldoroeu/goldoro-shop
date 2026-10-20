import Link from "next/link";
import { stripe } from "@/lib/stripe";
import ClearCart from "@/components/ClearCart";

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  let session = null;

  if (sessionId) {
    try {
      session = await stripe().checkout.sessions.retrieve(sessionId);
    } catch {
      session = null;
    }
  }

  return (
    <main className="status-page">
      <ClearCart />
      <div className="status-card">
        <p className="eyebrow">Поръчка приета</p>
        <h1>Благодарим за поръчката!</h1>
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
