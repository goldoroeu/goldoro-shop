export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch {
    // Имейлът е допълнителна услуга — никога не чупи смяната на статус заради него.
  }
}

export function shippedEmailHtml({ orderNumber, customerName }) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #2a2117; max-width: 480px; margin: 0 auto; line-height: 1.6;">
      <h2 style="color: #8c6a2e; margin-bottom: 16px;">Поръчка №${orderNumber} е изпратена</h2>
      <p>Здравейте${customerName ? ", " + customerName : ""},</p>
      <p>Вашата поръчка <strong>№${orderNumber}</strong> от Gold'Oro е предадена на куриер и е на път към Вас.</p>
      <p>Благодарим Ви, че пазарувате от Gold'Oro!</p>
    </div>
  `;
}
