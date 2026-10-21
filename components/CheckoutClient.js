"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import IconSprite from "@/components/IconSprite";
import { fmt, cap } from "@/lib/format";

const CART_KEY = "goldoro_cart_v1";
const ICONS = { гривни: "i-bracelet", пръстени: "i-ring", ланци: "i-chain", обеци: "i-earring" };

export default function CheckoutClient({ products }) {
  const router = useRouter();
  const [cart, setCart] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [showCodForm, setShowCodForm] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [codForm, setCodForm] = useState({
    name: "",
    phone: "",
    deliveryType: "address",
    address: "",
    email: "",
  });
  const [codSubmitting, setCodSubmitting] = useState(false);
  const [codError, setCodError] = useState("");

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(CART_KEY) || "{}"));
    } catch {
      setCart({});
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, loaded]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((l) => l.product),
    [cart, products]
  );

  const cartTotalCents = cartLines.reduce((sum, l) => sum + l.product.price_cents * l.qty, 0);

  function setQty(id, qty) {
    setCart((c) => ({ ...c, [id]: Math.max(1, Math.min(10, qty)) }));
  }

  function removeLine(id) {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }

  function updateCodField(field, value) {
    setCodForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCheckout() {
    if (cartLines.length === 0) return;
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartLines.map((l) => ({ id: l.product.id, qty: l.qty })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Грешка при създаване на поръчката.");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err.message || "Грешка при създаване на поръчката.");
      setCheckingOut(false);
    }
  }

  async function handleCodSubmit(e) {
    e.preventDefault();
    if (cartLines.length === 0) return;
    setCodSubmitting(true);
    setCodError("");
    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartLines.map((l) => ({ id: l.product.id, qty: l.qty })),
          customer: codForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка при изпращане на поръчката.");
      setCart({});
      router.push("/checkout/cod-success");
    } catch (err) {
      setCodError(err.message || "Грешка при изпращане на поръчката.");
    } finally {
      setCodSubmitting(false);
    }
  }

  return (
    <>
      <IconSprite />

      <header className="nav">
        <div className="wrap nav-row">
          <a className="logo" href="/">
            <svg className="logo-mark" aria-hidden="true">
              <use href="#i-logo" />
            </svg>
            <span>
              Gold'Oro<small>Златни бижута</small>
            </span>
          </a>
          <a className="back-link" href="/">
            &larr; Към магазина
          </a>
        </div>
      </header>

      <main className="checkout-page">
        <div className="wrap">
          <h1>Количка</h1>

          {loaded && cartLines.length === 0 ? (
            <div className="checkout-empty">
              <p>Количката ти е празна.</p>
              <a className="btn btn-gold" href="/#catalog">
                Разгледай каталога
              </a>
            </div>
          ) : (
            <div className="checkout-grid">
              <div className="checkout-items">
                {cartLines.map((l) => (
                  <div className="checkout-line" key={l.product.id}>
                    <div className="cl-media">
                      {l.product.image_url ? (
                        <img src={l.product.image_url} alt={l.product.name} />
                      ) : (
                        <svg>
                          <use href={`#${ICONS[l.product.category] || "i-ring"}`} />
                        </svg>
                      )}
                    </div>
                    <div className="cl-info">
                      <h3>{l.product.name}</h3>
                      <p className="cl-meta">
                        {cap(l.product.category)} &middot; {l.product.proba}
                      </p>
                      <div className="cl-qty">
                        <button
                          type="button"
                          onClick={() => setQty(l.product.id, l.qty - 1)}
                          disabled={l.qty <= 1}
                          aria-label="Намали количеството"
                        >
                          <svg>
                            <use href="#i-minus" />
                          </svg>
                        </button>
                        <span>{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(l.product.id, l.qty + 1)}
                          disabled={l.qty >= 10}
                          aria-label="Увеличи количеството"
                        >
                          <svg>
                            <use href="#i-plus" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="cl-price">{fmt(l.product.price_cents * l.qty)}</div>
                    <button
                      type="button"
                      className="cl-remove"
                      onClick={() => removeLine(l.product.id)}
                      aria-label="Премахни от количката"
                    >
                      <svg>
                        <use href="#i-trash" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <aside className="checkout-summary">
                <div className="cart-total">
                  <span>Общо</span>
                  <span className="price">{fmt(cartTotalCents)}</span>
                </div>

                <h2>Начин на плащане</h2>
                <div className="method-options">
                  <button
                    type="button"
                    className="method-option"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                  >
                    <svg>
                      <use href="#i-card" />
                    </svg>
                    <span>
                      <strong>{checkingOut ? "Пренасочване…" : "Плащане с карта"}</strong>
                      <small>Сигурно плащане през Stripe</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`method-option${showCodForm ? " active" : ""}`}
                    onClick={() => setShowCodForm((v) => !v)}
                  >
                    <svg>
                      <use href="#i-truck" />
                    </svg>
                    <span>
                      <strong>Наложен платеж</strong>
                      <small>Плащане в брой на куриера (Еконт)</small>
                    </span>
                  </button>
                </div>
                {checkoutError && <p className="cart-error">{checkoutError}</p>}

                {showCodForm && (
                  <form className="cod-fields" onSubmit={handleCodSubmit}>
                    <label>
                      Име и фамилия
                      <input
                        required
                        value={codForm.name}
                        onChange={(e) => updateCodField("name", e.target.value)}
                      />
                    </label>
                    <label>
                      Телефон
                      <input
                        required
                        type="tel"
                        placeholder="08xx xxx xxx"
                        value={codForm.phone}
                        onChange={(e) => updateCodField("phone", e.target.value)}
                      />
                    </label>
                    <div className="cod-radio-row">
                      <label className="cod-radio">
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={codForm.deliveryType === "address"}
                          onChange={() => updateCodField("deliveryType", "address")}
                        />
                        До адрес
                      </label>
                      <label className="cod-radio">
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={codForm.deliveryType === "office"}
                          onChange={() => updateCodField("deliveryType", "office")}
                        />
                        До офис на Еконт
                      </label>
                    </div>
                    <label>
                      {codForm.deliveryType === "office" ? "Офис на Еконт (град и адрес)" : "Адрес за доставка"}
                      <input
                        required
                        placeholder={
                          codForm.deliveryType === "office"
                            ? "напр. Варна, офис бул. Владислав Варненчик 1"
                            : "улица, номер, град, пощенски код"
                        }
                        value={codForm.address}
                        onChange={(e) => updateCodField("address", e.target.value)}
                      />
                    </label>
                    <label>
                      Имейл (по желание)
                      <input
                        type="email"
                        value={codForm.email}
                        onChange={(e) => updateCodField("email", e.target.value)}
                      />
                    </label>
                    <button className="btn btn-gold btn-block" type="submit" disabled={codSubmitting}>
                      {codSubmitting ? "Изпращане…" : "Поръчай с наложен платеж"}
                    </button>
                    {codError && <p className="cart-error">{codError}</p>}
                  </form>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
