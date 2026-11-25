import Link from "next/link";
import ClearCart from "@/components/ClearCart";

export default function CodSuccessPage({ searchParams }) {
  const orderNumber = searchParams?.order;

  return (
    <main className="status-page">
      <ClearCart />
      <div className="status-card">
        <p className="eyebrow">Поръчка приета</p>
        <h1>Благодарим за поръчката!</h1>
        {orderNumber && <p className="order-number">Номер на поръчката: №{orderNumber}</p>}
        <p>Ще получите пратката с наложен платеж през Еконт — плащате в брой на куриера при доставка.</p>
        <Link className="btn btn-gold" href="/">
          Към магазина
        </Link>
      </div>
    </main>
  );
}
