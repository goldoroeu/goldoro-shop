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

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtEuro(cents) {
  return "€" + ((cents || 0) / 100).toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function shippedEmailHtml({ orderNumber, customerName, items, amountTotal }) {
  const name = escapeHtml(customerName);

  const itemRows = (items || [])
    .map(
      (it) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e3dcc9;font-size:14px;color:#2a2117;">
            ${escapeHtml(it.name)}${it.catalog_number ? ` <span style="color:#6b5d49;">(№${escapeHtml(it.catalog_number)})</span>` : ""}
            <span style="color:#6b5d49;"> &times; ${it.quantity}</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #e3dcc9;font-size:14px;color:#8c6a2e;white-space:nowrap;">
            ${fmtEuro(it.amount_total)}
          </td>
        </tr>`
    )
    .join("");

  const summaryBlock = itemRows
    ? `
    <tr>
      <td style="padding:0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d9cfb8;">
          ${itemRows}
          <tr>
            <td style="padding:14px 0 0;font-size:14px;font-weight:bold;color:#2a2117;">Общо</td>
            <td align="right" style="padding:14px 0 0;font-size:15px;font-weight:bold;color:#8c6a2e;white-space:nowrap;">
              ${fmtEuro(amountTotal)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : "";

  return `
<!doctype html>
<html lang="bg">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#ede7d6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede7d6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fbf8ef;border-radius:16px;overflow:hidden;border:1px solid #d9cfb8;font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="background:#2a2117;padding:26px 32px;text-align:center;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#f2e6d2;letter-spacing:0.04em;">Gold'Oro</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 20px;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8c6a2e;font-weight:bold;">Поръчка изпратена</p>
                <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:26px;line-height:1.2;color:#2a2117;">Поръчка №${orderNumber} е на път</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#6b5d49;">Здравейте${name ? ", " + name : ""},</p>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#6b5d49;">Радваме се да Ви съобщим, че поръчката Ви е предадена на куриер и скоро ще бъде при Вас.</p>
              </td>
            </tr>
            ${summaryBlock}
            <tr>
              <td style="padding:28px 32px 36px;">
                <p style="margin:0;font-size:14px;color:#6b5d49;">Благодарим Ви, че избрахте Gold'Oro.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f3edda;padding:20px 32px;text-align:center;border-top:1px solid #d9cfb8;">
                <p style="margin:0;font-size:12px;color:#6b5d49;">
                  Gold'Oro Ателие &middot;
                  <a href="https://goldoro.eu" style="color:#8c6a2e;text-decoration:none;">goldoro.eu</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
