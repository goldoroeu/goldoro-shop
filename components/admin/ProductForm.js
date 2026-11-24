"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["гривни", "пръстени", "ланци", "обеци"];
const PRICE_RATE_KEY = "goldoro_admin_price_per_gram";

export default function ProductForm({ product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || CATEGORIES[0]);
  const [proba, setProba] = useState(product?.proba || "585°");
  const [weight, setWeight] = useState(product?.weight || "");
  const [size, setSize] = useState(product?.size || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price_cents / 100) : "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [pricePerGram, setPricePerGram] = useState("89");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRICE_RATE_KEY);
      if (saved) setPricePerGram(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PRICE_RATE_KEY, pricePerGram);
    } catch {
      /* ignore */
    }
  }, [pricePerGram]);

  const weightNum = parseFloat(weight);
  const rateNum = parseFloat(pricePerGram);
  const suggestedPrice =
    Number.isFinite(weightNum) && Number.isFinite(rateNum) && weightNum > 0 && rateNum > 0
      ? (weightNum * rateNum).toFixed(2)
      : null;

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
    const payload = { name, category, proba, weight, size, description, price, image_url: imageUrl, in_stock: inStock };
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
            <option value="585°">585° (14К)</option>
            <option value="750°">750° (18К)</option>
            <option value="916°">916° (22К)</option>
          </select>
        </label>
      </div>

      <div className="admin-form-row">
        <label>
          Тегло в грамове (напр. 3.4)
          <input value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label>
          Цена на грам (€)
          <input
            type="number"
            min="0"
            step="0.01"
            value={pricePerGram}
            onChange={(e) => setPricePerGram(e.target.value)}
          />
        </label>
      </div>

      <div className="admin-calc-row">
        {suggestedPrice ? (
          <>
            <span>
              Предложена цена: <strong>€{suggestedPrice}</strong> ({weight} гр. &times; €{pricePerGram}/гр.)
            </span>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPrice(suggestedPrice)}>
              Приложи
            </button>
          </>
        ) : (
          <span className="admin-hint">Въведи тегло, за да изчисля предложена цена.</span>
        )}
      </div>

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

      {category !== "обеци" && (
        <label>
          {category === "пръстени" ? "Размер (ЕС номер, напр. 54)" : "Размер (см, напр. 18)"}
          <input value={size} onChange={(e) => setSize(e.target.value)} />
        </label>
      )}

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
