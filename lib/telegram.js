export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // Известието е "nice to have" — никога не чупи реалната поръчка заради него.
  }
}

export function formatOrderMessage({
  orderNumber,
  paymentMethod,
  status,
  customerName,
  customerPhone,
  city,
  address,
  items,
  amountTotal,
  currency,
}) {
  const methodLabel = paymentMethod === "cod" ? "Наложен платеж" : "Карта";
  const statusLabel = status === "paid" ? "платена" : "чакаща";
  const total = ((amountTotal || 0) / 100).toLocaleString("bg-BG", { minimumFractionDigits: 2 });
  const currencySymbol = (currency || "eur").toLowerCase() === "eur" ? "€" : (currency || "").toUpperCase();

  const customerLines = [customerName, customerPhone, [city, address].filter(Boolean).join(" — ")].filter(Boolean);
  const itemsText = (items || [])
    .map((it) => `${it.quantity}× ${it.name}${it.catalog_number ? ` (Арт. № ${it.catalog_number})` : ""}`)
    .join("\n");

  const title = orderNumber ? `Нова поръчка №${orderNumber} — ${methodLabel} (${statusLabel})` : `Нова поръчка — ${methodLabel} (${statusLabel})`;

  const sections = [`<b>${title}</b>`, customerLines.join("\n"), itemsText, `Общо: ${currencySymbol}${total}`].filter(
    Boolean
  );

  return sections.join("\n\n");
}
