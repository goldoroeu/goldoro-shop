import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminDashboard() {
  const { data: products } = await supabase()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="admin-page">
      <div className="admin-head">
        <h1>Продукти</h1>
        <div className="admin-head-actions">
          <Link className="btn btn-outline btn-sm" href="/admin/orders">
            Поръчки
          </Link>
          <Link className="btn btn-gold" href="/admin/products/new">
            + Нов продукт
          </Link>
          <LogoutButton />
        </div>
      </div>

      {!products || products.length === 0 ? (
        <p className="admin-hint">Няма добавени продукти още.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Име</th>
                <th>Категория</th>
                <th>Проба</th>
                <th>Цена</th>
                <th>Наличност</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.image_url ? <img className="admin-thumb" src={p.image_url} alt="" /> : null}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.proba}</td>
                  <td>€{(p.price_cents / 100).toLocaleString("bg-BG")}</td>
                  <td>{p.in_stock ? "Да" : "Не"}</td>
                  <td>
                    <Link href={`/admin/products/${p.id}`}>Редактирай</Link>
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
