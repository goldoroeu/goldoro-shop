import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
                <th>Имейл</th>
                <th>Сума</th>
                <th>Артикули</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.created_at).toLocaleString("bg-BG")}</td>
                  <td>{o.customer_email || "—"}</td>
                  <td>€{((o.amount_total || 0) / 100).toLocaleString("bg-BG")}</td>
                  <td>{(o.items || []).map((it) => `${it.quantity}× ${it.name}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
