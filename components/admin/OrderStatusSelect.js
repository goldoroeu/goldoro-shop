"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LABELS = {
  pending: "Чакаща",
  paid: "Платена",
  shipped: "Изпратена",
  cancelled: "Отказана",
};

export default function OrderStatusSelect({ orderId, status }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <select className={`order-status order-status-${status}`} value={status} onChange={handleChange} disabled={saving}>
      {Object.entries(LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
