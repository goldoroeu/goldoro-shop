import Link from "next/link";
import { supabase } from "@/lib/supabase";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS = { card: "Карта", cod: "Наложен платеж" };

export default async function OrdersPage() {
  const { data: orders } = await supabase()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="admin-page">
      <div className="admin-head">
        <h1>Поръчки</h1>
        <Link className="btn btn-outline btn-sm" href="/admin">
          &larr; Продукти
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <p className="admin-hint">Все още няма поръчки.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Метод</th>
                <th>Клиент</th>
                <th>Доставка</th>
                <th>Сума</th>
                <th>Артикули</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.created_at).toLocaleString("bg-BG")}</td>
                  <td>{PAYMENT_LABELS[o.payment_method] || o.payment_method}</td>
                  <td>
                    {o.customer_name && <div>{o.customer_name}</div>}
                    {o.customer_phone && <div className="admin-hint">{o.customer_phone}</div>}
                    {o.customer_email && <div className="admin-hint">{o.customer_email}</div>}
                  </td>
                  <td>
                    {o.shipping_address ? (
                      <>
                        {o.delivery_type === "office" && <div className="admin-hint">Офис на Еконт:</div>}
                        <div>{o.shipping_address}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>€{((o.amount_total || 0) / 100).toLocaleString("bg-BG")}</td>
                  <td>{(o.items || []).map((it) => `${it.quantity}× ${it.name}`).join(", ")}</td>
                  <td>
                    <OrderStatusSelect orderId={o.id} status={o.status || "pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
