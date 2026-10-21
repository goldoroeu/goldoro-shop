"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import IconSprite from "@/components/IconSprite";
import { fmt, cap } from "@/lib/format";

const CATEGORIES = [
  { key: "гривни", icon: "i-bracelet" },
  { key: "пръстени", icon: "i-ring" },
  { key: "ланци", icon: "i-chain" },
  { key: "обеци", icon: "i-earring" },
];

const CART_KEY = "goldoro_cart_v1";

export default function Shop({ products }) {
  const router = useRouter();
  const [filter, setFilter] = useState("всички");
  const [cart, setCart] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [subscribeNote, setSubscribeNote] = useState("");

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

  const visibleProducts = useMemo(
    () => (filter === "всички" ? products : products.filter((p) => p.category === filter)),
    [filter, products]
  );

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setAddedId(id);
    setTimeout(() => setAddedId((cur) => (cur === id ? null : cur)), 1100);
  }

  function selectCategory(key) {
    setFilter(key);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSubscribe(e) {
    e.preventDefault();
    setSubscribeNote("Абонирахте се успешно. Благодарим!");
    e.target.reset();
  }

  return (
    <>
      <IconSprite />

      <header className="nav">
        <div className="wrap nav-row">
          <a className="logo" href="#top">
            <svg className="logo-mark" aria-hidden="true">
              <use href="#i-logo" />
            </svg>
            <span>
              Gold'Oro<small>Златни бижута</small>
            </span>
          </a>
          <nav className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
            <a href="#categories">Колекции</a>
            <a href="#catalog">Каталог</a>
            <a href="#trust">Гаранции</a>
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
            <button className="icon-btn" aria-label="Количка" onClick={() => router.push("/checkout")}>
              <svg>
                <use href="#i-cart" />
              </svg>
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <p className="eyebrow">Проба 585°, 750° и 916°</p>
              <h1>
                Злато, което се предава <em>от ръка на ръка.</em>
              </h1>
              <p className="lede">
                Гривни, пръстени, ланци и обеци с печат на пробата и сертификат за произход —
                внимателно подбрани за теб.
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
                  Доставка за 1 ден в България, до 10 дни за Европа
                </li>
                <li>
                  <svg>
                    <use href="#i-truck" />
                  </svg>
                  Безплатна доставка над €900
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
              <p>Цените са в евро. Всяко изделие се предлага с кутия и сертификат.</p>
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
                        <span>
                          {[
                            p.weight ? `${p.weight} гр.` : null,
                            p.size ? (p.category === "пръстени" ? `р-р ${p.size}` : `${p.size} см`) : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
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
              <h2>Защо Gold'Oro</h2>
            </div>
            <ul className="trust-list">
              <li className="trust-item">
                <svg>
                  <use href="#i-shield" />
                </svg>
                <div>
                  <h3>Проба и сертификат</h3>
                  <p>
                    Всяко изделие носи печат на пробата (585‰, 750‰ или 916‰) и се продава със
                    сертификат за произход и автентичност.
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
                    Всяка пратка е застрахована и се доставя с подпис — в рамките на 1 ден в
                    България, до 10 дни за останала Европа.
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
                    Веднъж годишно почистваме и полираме безплатно всяко бижу, купено от Gold'Oro —
                    докато го носите.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="logo" href="#top">
                <svg className="logo-mark" aria-hidden="true">
                  <use href="#i-logo" />
                </svg>
                <span>
                  Gold'Oro<small>Златни бижута</small>
                </span>
              </a>
              <p>
                Онлайн магазин за златни бижута. Проба 585°, 750° и 916°, доставка в цяла ЕС.
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
                <li>+359 88 123 4567</li>
                <li>контакти@goldoro.eu</li>
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
              Проба показва съдържанието на чисто злато в сплавта: 585‰ отговаря на 14К, 750‰ — на
              18К, а 916‰ — на 22К злато. Теглото на всяко изделие е посочено индивидуално в каталога.
            </p>
            <p>© 2026 Gold'Oro. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
