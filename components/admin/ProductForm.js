"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["гривни", "пръстени", "ланци", "обеци"];

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || CATEGORIES[0]);
  const [proba, setProba] = useState(product?.proba || "585°");
  const [weight, setWeight] = useState(product?.weight || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price_cents / 100) : "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [inStock, setInStock] = useState(product?.in_stock ?? true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Грешка при качване на снимка.");
      return;
    }
    const data = await res.json();
    setImageUrl(data.url);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { name, category, proba, weight, description, price, image_url: imageUrl, in_stock: inStock };
    const res = await fetch(isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Грешка при запазване.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Да изтрия ли този продукт?")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      setError("Грешка при изтриване.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Име на продукта
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <div className="admin-form-row">
        <label>
          Категория
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Проба
          <select value={proba} onChange={(e) => setProba(e.target.value)}>
            <option value="585°">585°</option>
            <option value="750°">750°</option>
          </select>
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          Тегло (напр. 3.4 г)
          <input value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label>
          Цена (€)
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
      </div>

      <label>
        Описание
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label>
        Снимка
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
      </label>
      {uploading && <p className="admin-hint">Качване…</p>}
      {imageUrl && <img className="admin-preview" src={imageUrl} alt="Преглед" />}

      <label className="admin-checkbox">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
        В наличност
      </label>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form-actions">
        <button className="btn btn-gold" type="submit" disabled={saving || uploading}>
          {saving ? "Запазване…" : "Запази"}
        </button>
        {isEdit && (
          <button className="btn btn-outline" type="button" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Изтриване…" : "Изтрий продукта"}
          </button>
        )}
      </div>
    </form>
  );
}
