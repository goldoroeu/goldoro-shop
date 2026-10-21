"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { key: "гривни", icon: "i-bracelet" },
  { key: "пръстени", icon: "i-ring" },
  { key: "ланци", icon: "i-chain" },
  { key: "обеци", icon: "i-earring" },
];

const CART_KEY = "goldoro_cart_v1";

function fmt(cents) {
  return (
    "€" +
    (cents / 100).toLocaleString("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Shop({ products }) {
  const router = useRouter();
  const [filter, setFilter] = useState("всички");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [subscribeNote, setSubscribeNote] = useState("");

  const [checkoutStep, setCheckoutStep] = useState("cart"); // cart | method | cod
  const [codForm, setCodForm] = useState({
    name: "",
    phone: "",
    deliveryType: "address",
    address: "",
    email: "",
  });
  const [codSubmitting, setCodSubmitting] = useState(false);
  const [codError, setCodError] = useState("");

  const cartPanelRef = useRef(null);
  const cartBtnRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      setCart(saved);
    } catch {
      setCart({});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    function handleClick(e) {
      if (
        cartPanelRef.current &&
        !cartPanelRef.current.contains(e.target) &&
        cartBtnRef.current &&
        !cartBtnRef.current.contains(e.target)
      ) {
        setCartOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const visibleProducts = useMemo(
    () => (filter === "всички" ? products : products.filter((p) => p.category === filter)),
    [filter, products]
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((l) => l.product),
    [cart, products]
  );

  const cartCount = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const cartTotalCents = cartLines.reduce((sum, l) => sum + l.product.price_cents * l.qty, 0);

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setAddedId(id);
    setTimeout(() => setAddedId((cur) => (cur === id ? null : cur)), 1100);
  }

  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  }

  function selectCategory(key) {
    setFilter(key);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleCheckout() {
    if (cartLines.length === 0) return;
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartLines.map((l) => ({ id: l.product.id, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Грешка при създаване на поръчката.");
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err.message || "Грешка при създаване на поръчката.");
      setCheckingOut(false);
    }
  }

  function updateCodField(field, value) {
    setCodForm((f) => ({ ...f, [field]: value }));
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
      if (!res.ok) {
        throw new Error(data.error || "Грешка при изпращане на поръчката.");
      }
      setCart({});
      setCartOpen(false);
      setCheckoutStep("cart");
      router.push("/checkout/cod-success");
    } catch (err) {
      setCodError(err.message || "Грешка при изпращане на поръчката.");
    } finally {
      setCodSubmitting(false);
    }
  }

  function openCartPanel() {
    setCartOpen((o) => {
      const next = !o;
      if (next) setCheckoutStep("cart");
      return next;
    });
  }

  function handleSubscribe(e) {
    e.preventDefault();
    setSubscribeNote("Абонирахте се успешно. Благодарим!");
    e.target.reset();
  }

  return (
    <>
      <svg className="sprite" aria-hidden="true">
        <symbol id="i-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="14.5" r="7" />
          <path d="M9.3 8.2 12 3.6l2.7 4.6-2.7 1.4Z" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="i-bracelet" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <ellipse cx="12" cy="12" rx="9" ry="5.6" />
          <circle cx="3.2" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="20.8" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="6" cy="18.4" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="18.4" r="1" fill="currentColor" stroke="none" />
          <circle cx="6" cy="5.6" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="5.6" r="1" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="i-chain" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <ellipse cx="7" cy="9" rx="3.4" ry="5" transform="rotate(20 7 9)" />
          <ellipse cx="13" cy="12" rx="3.4" ry="5" transform="rotate(-20 13 12)" />
          <ellipse cx="19" cy="15" rx="3.4" ry="5" transform="rotate(20 19 15)" />
        </symbol>
        <symbol id="i-earring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="6" r="3.2" />
          <line x1="12" y1="9.2" x2="12" y2="13.5" />
          <path d="M12 13.5c-2.6 0-3.6 2-3 3.8.5 1.5 2 2.5 3 2.5s2.5-1 3-2.5c.6-1.8-.4-3.8-3-3.8Z" />
        </symbol>
        <symbol id="i-card" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <line x1="3" y1="9.5" x2="21" y2="9.5" />
          <line x1="6" y1="14.5" x2="11" y2="14.5" />
        </symbol>
        <symbol id="i-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L20.5 8H6" />
          <circle cx="9" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="17" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12.5 9 17.5 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 20 6.5v5.4C20 17 16.6 20 12 21.5 7.4 20 4 17 4 11.9V6.5Z" />
          <path d="M9 12.3 11.3 14.6 15.5 9.8" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-hammer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m4 20 7-7" strokeLinecap="round" />
          <path d="M9.5 14.5 7 12l5.5-5.5a3 3 0 0 1 4.2 0l.8.8a3 3 0 0 1 0 4.2L12 16Z" />
        </symbol>
        <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 6h10v9H3Z" />
          <path d="M13 10h4l4 3.4V15h-8Z" />
          <circle cx="7" cy="18" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="17" cy="18" r="1.6" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v5M12 16v5M3 12h5M16 12h5" strokeLinecap="round" />
        </symbol>
        <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </symbol>
      </svg>

      <header className="nav">
        <div className="wrap nav-row">
          <a className="logo" href="#top">
            GoldOro<small>Ателие за злато</small>
          </a>
          <nav className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
            <a href="#categories">Колекции</a>
            <a href="#catalog">Каталог</a>
            <a href="#trust">Гаранции</a>
            <a href="#atelier">Ателието</a>
            <a href="#contact">Контакти</a>
          </nav>
          <div className="nav-right">
            <button
              className="icon-btn menu-toggle"
              aria-label="Меню"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg>
                <use href="#i-menu" />
              </svg>
            </button>
            <button
              ref={cartBtnRef}
              className="icon-btn"
              aria-haspopup="true"
              aria-expanded={cartOpen}
              aria-label="Количка"
              onClick={openCartPanel}
            >
              <svg>
                <use href="#i-cart" />
              </svg>
              <span className="cart-badge">{cartCount}</span>
            </button>
            <div ref={cartPanelRef} className={`cart-panel${cartOpen ? " open" : ""}`}>
              {checkoutStep === "cart" && (
                <>
                  <h3>Количка</h3>
                  <div className="cart-items">
                    {cartLines.length === 0 ? (
                      <p className="cart-empty">Количката е празна.</p>
                    ) : (
                      cartLines.map((l) => (
                        <div className="cart-line" key={l.product.id}>
                          <div className="ci-name">
                            <strong>{l.product.name}</strong>
                            <span className="ci-meta">
                              {l.qty} &times; {fmt(l.product.price_cents)}
                            </span>
                          </div>
                          <button type="button" onClick={() => removeFromCart(l.product.id)} aria-label="Премахни">
                            &times;
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="cart-total">
                    <span>Общо</span>
                    <span className="price">{fmt(cartTotalCents)}</span>
                  </div>
                  <button
                    className="btn btn-gold btn-block"
                    onClick={() => setCheckoutStep("method")}
                    disabled={cartLines.length === 0}
                  >
                    Завърши поръчка
                  </button>
                </>
              )}

              {checkoutStep === "method" && (
                <>
                  <button type="button" className="cart-back" onClick={() => setCheckoutStep("cart")}>
                    &larr; Назад към количката
                  </button>
                  <h3>Начин на плащане</h3>
                  <div className="cart-total" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
                    <span>Общо</span>
                    <span className="price">{fmt(cartTotalCents)}</span>
                  </div>
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
                      className="method-option"
                      onClick={() => setCheckoutStep("cod")}
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
                </>
              )}

              {checkoutStep === "cod" && (
                <form onSubmit={handleCodSubmit}>
                  <button type="button" className="cart-back" onClick={() => setCheckoutStep("method")}>
                    &larr; Назад
                  </button>
                  <h3>Наложен платеж</h3>
                  <div className="cart-total" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>
                    <span>Общо (в брой на куриера)</span>
                    <span className="price">{fmt(cartTotalCents)}</span>
                  </div>
                  <div className="cod-fields">
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
                          codForm.deliveryType === "office" ? "напр. Варна, офис бул. Владислав Варненчик 1" : "улица, номер, град, пощенски код"
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
                  </div>
                  <button className="btn btn-gold btn-block" type="submit" disabled={codSubmitting}>
                    {codSubmitting ? "Изпращане…" : "Поръчай с наложен платеж"}
                  </button>
                  {codError && <p className="cart-error">{codError}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">Проба 585° и 750° &middot; ръчна изработка</p>
              <h1>
                Злато, което се предава <em>от ръка на ръка.</em>
              </h1>
              <p className="lede">
                Гривни, пръстени, ланци и обеци, изработени на ръка в нашето ателие в Златоград —
                всяко изделие с печат на пробата и сертификат за произход.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-gold" href="#catalog">
                  Разгледай каталога
                </a>
                <a className="btn btn-outline" href="#contact">
                  Поръчка на едро
                </a>
              </div>
              <ul className="trust-row">
                <li>
                  <svg>
                    <use href="#i-shield" />
                  </svg>
                  Сертификат за автентичност
                </li>
                <li>
                  <svg>
                    <use href="#i-truck" />
                  </svg>
                  Безплатна доставка над €100
                </li>
                <li>
                  <svg>
                    <use href="#i-check" />
                  </svg>
                  30 дни за връщане
                </li>
              </ul>
            </div>
            <div className="hero-panel" aria-hidden="true">
              <svg className="hp-art" viewBox="0 0 520 420">
                <g fill="none" stroke="var(--jv-gold)" strokeWidth="3">
                  <circle cx="162" cy="246" r="62" />
                  <polygon points="162,150 182,184 142,184" fill="var(--jv-gold)" stroke="none" />
                  <ellipse cx="368" cy="118" rx="84" ry="38" />
                  <circle cx="288" cy="118" r="4.5" fill="var(--jv-gold)" stroke="none" />
                  <circle cx="448" cy="118" r="4.5" fill="var(--jv-gold)" stroke="none" />
                  <circle cx="332" cy="84" r="4.5" fill="var(--jv-gold)" stroke="none" />
                  <circle cx="404" cy="84" r="4.5" fill="var(--jv-gold)" stroke="none" />
                  <circle cx="332" cy="152" r="4.5" fill="var(--jv-gold)" stroke="none" />
                  <circle cx="404" cy="152" r="4.5" fill="var(--jv-gold)" stroke="none" />
                  <g strokeWidth="2.5" opacity=".9">
                    <ellipse cx="378" cy="252" rx="26" ry="38" transform="rotate(24 378 252)" />
                    <ellipse cx="420" cy="288" rx="26" ry="38" transform="rotate(-18 420 288)" />
                    <ellipse cx="460" cy="330" rx="26" ry="38" transform="rotate(24 460 330)" />
                  </g>
                  <circle cx="92" cy="332" r="17" strokeWidth="2.5" />
                  <line x1="92" y1="349" x2="92" y2="372" strokeWidth="2.5" />
                  <path
                    d="M92 372c-14 0-19 11-16 20 3 8 11 13 16 13s13-5 16-13c3-9-2-20-16-20Z"
                    strokeWidth="2.5"
                  />
                </g>
              </svg>
              <p className="hp-label">
                Колекция <b>Есен 2026</b> &middot; 585° злато
              </p>
            </div>
          </div>
        </section>

        <section className="categories" id="categories">
          <div className="wrap">
            <div className="section-head">
              <h2>Колекции</h2>
            </div>
            <div className="cat-grid">
              {CATEGORIES.map((c) => {
                const count = products.filter((p) => p.category === c.key).length;
                return (
                  <button className="cat-card" key={c.key} onClick={() => selectCategory(c.key)}>
                    <svg>
                      <use href={`#${c.icon}`} />
                    </svg>
                    <span className="cat-name">{cap(c.key)}</span>
                    <span className="cat-count">
                      {count} {count === 1 ? "модел" : "модела"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="catalog" id="catalog">
          <div className="wrap">
            <div className="section-head">
              <h2>Каталог</h2>
              <p>Цените са в евро, с включено ДДС. Всяко изделие се предлага с кутия и сертификат.</p>
            </div>
            <div className="filters">
              <button
                className={`chip${filter === "всички" ? " active" : ""}`}
                onClick={() => setFilter("всички")}
              >
                Всички
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  className={`chip${filter === c.key ? " active" : ""}`}
                  onClick={() => setFilter(c.key)}
                >
                  {cap(c.key)}
                </button>
              ))}
            </div>

            {visibleProducts.length === 0 ? (
              <p className="empty-state">
                {products.length === 0
                  ? "Все още няма добавени продукти — очаквайте скоро нови колекции."
                  : "Няма продукти в тази категория."}
              </p>
            ) : (
              <div className="product-grid">
                {visibleProducts.map((p) => {
                  const icon = CATEGORIES.find((c) => c.key === p.category)?.icon || "i-ring";
                  return (
                    <article className="product" key={p.id}>
                      <div className="product-media">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} />
                        ) : (
                          <svg>
                            <use href={`#${icon}`} />
                          </svg>
                        )}
                        <span className="proba-badge">{p.proba}</span>
                      </div>
                      <h3 className="product-name">{p.name}</h3>
                      <div className="product-meta">
                        <span>{cap(p.category)}</span>
                        <span>{p.weight}</span>
                      </div>
                      {p.description && (
                        <p style={{ color: "var(--ink-soft)", fontSize: ".85rem" }}>{p.description}</p>
                      )}
                      <div className="product-foot">
                        <span className="price">{fmt(p.price_cents)}</span>
                        <button
                          className={`add-btn${addedId === p.id ? " added" : ""}`}
                          onClick={() => addToCart(p.id)}
                        >
                          {addedId === p.id ? "Добавено" : "Добави"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="trust" id="trust">
          <div className="wrap">
            <div className="section-head">
              <h2>Защо GoldOro</h2>
            </div>
            <ul className="trust-list">
              <li className="trust-item">
                <svg>
                  <use href="#i-shield" />
                </svg>
                <div>
                  <h3>Проба и сертификат</h3>
                  <p>
                    Всяко изделие носи печат на пробата (585‰ или 750‰) и се продава със сертификат
                    за произход и автентичност.
                  </p>
                </div>
              </li>
              <li className="trust-item">
                <svg>
                  <use href="#i-hammer" />
                </svg>
                <div>
                  <h3>Ръчна изработка в Златоград</h3>
                  <p>
                    Отливаме, споявяме и полираме всяко бижу на ръка в нашето ателие — без мащабно
                    фабрично производство.
                  </p>
                </div>
              </li>
              <li className="trust-item">
                <svg>
                  <use href="#i-truck" />
                </svg>
                <div>
                  <h3>Застрахована доставка</h3>
                  <p>
                    Всяка пратка е застрахована и се доставя с подпис — 2–3 работни дни в България,
                    до 7 дни за останала ЕС.
                  </p>
                </div>
              </li>
              <li className="trust-item">
                <svg>
                  <use href="#i-card" />
                </svg>
                <div>
                  <h3>Карта или наложен платеж</h3>
                  <p>Плащате онлайн с карта или в брой на куриера при доставка с Еконт — ти избираш при поръчката.</p>
                </div>
              </li>
              <li className="trust-item">
                <svg>
                  <use href="#i-sparkle" />
                </svg>
                <div>
                  <h3>Безплатно полиране</h3>
                  <p>
                    Веднъж годишно почистваме и полираме безплатно всяко бижу, купено от GoldOro —
                    докато го носите.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="atelier" id="atelier">
          <div className="wrap">
            <div className="atelier-inner">
              <div>
                <blockquote>
                  „Всеки пръстен тръгва като кюлче 585° злато и напуска ателието като история, която
                  някой ще носи с години.“
                  <cite>Майсторите на GoldOro, Златоград</cite>
                </blockquote>
              </div>
              <div className="atelier-text">
                <p className="eyebrow">Ателието</p>
                <h2 style={{ marginTop: "8px" }}>Три поколения златари</h2>
                <p>
                  От 1994 година нашето семейно ателие в Златоград топи, кове и полира злато по
                  традиционни техники, съчетани със съвременен дизайн. Всяко изделие минава през
                  четири чифта ръце, преди да стигне до вас.
                </p>
                <div className="chain-divider" aria-hidden="true">
                  <svg>
                    <use href="#i-chain" />
                  </svg>
                  <svg>
                    <use href="#i-chain" />
                  </svg>
                  <svg>
                    <use href="#i-chain" />
                  </svg>
                  <svg>
                    <use href="#i-chain" />
                  </svg>
                  <svg>
                    <use href="#i-chain" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="logo" href="#top">
                GoldOro<small>Ателие за злато</small>
              </a>
              <p>
                Ателие за златни бижута в Златоград. Проба 585° и 750°, ръчна изработка, доставка в
                цяла ЕС.
              </p>
            </div>
            <div className="foot-col">
              <h4>Колекции</h4>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.key}>
                    <a href="#catalog" onClick={() => selectCategory(c.key)}>
                      {cap(c.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="foot-col">
              <h4>Контакти</h4>
              <ul>
                <li>ул. „Златарска“ 12, Златоград</li>
                <li>+359 88 123 4567</li>
                <li>атeлие@goldoro.bg</li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Новини за колекции</h4>
              <p style={{ fontSize: ".88rem", color: "var(--ink-soft)" }}>
                Нови модели и ограничени серии — веднъж месечно, без спам.
              </p>
              <form className="subscribe" onSubmit={handleSubscribe}>
                <input type="email" required placeholder="имейл@пример.бг" aria-label="Имейл за абонамент" />
                <button className="btn btn-gold btn-sm" type="submit">
                  Абонирай
                </button>
              </form>
              <p className="subscribe-note">{subscribeNote}</p>
            </div>
          </div>
          <div className="legal">
            <p>
              Проба показва съдържанието на чисто злато в сплавта: 585‰ отговаря на 14К, а 750‰ — на
              18К злато. Теглото на всяко изделие е посочено индивидуално в каталога.
            </p>
            <p>© 2026 GoldOro Ателие. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
