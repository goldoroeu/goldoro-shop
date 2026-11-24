"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import IconSprite from "@/components/IconSprite";
import { fmt, cap } from "@/lib/format";

const CART_KEY = "goldoro_cart_v1";
const ICONS = { гривни: "i-bracelet", пръстени: "i-ring", ланци: "i-chain", обеци: "i-earring" };

export default function ProductDetail({ product }) {
  const router = useRouter();
  const [cart, setCart] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [added, setAdded] = useState(false);

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

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

  function addToCart() {
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const icon = ICONS[product.category] || "i-ring";
  const metaLine = [
    product.weight ? `${product.weight} гр.` : null,
    product.size ? (product.category === "пръстени" ? `размер ${product.size}` : `${product.size} см`) : null,
  ]
    .filter(Boolean)
    .join(" · ");

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
          <a className="back-link" href="/#catalog">
            &larr; Към каталога
          </a>
          <button className="icon-btn" aria-label="Количка" onClick={() => router.push("/checkout")}>
            <svg>
              <use href="#i-cart" />
            </svg>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>
      </header>

      <main className="pdp-page">
        <div className="wrap pdp-grid">
          <div className="pdp-media">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} />
            ) : (
              <svg>
                <use href={`#${icon}`} />
              </svg>
            )}
            <span className="proba-badge">{product.proba}</span>
          </div>

          <div className="pdp-info">
            <p className="eyebrow">{cap(product.category)}</p>
            <h1>{product.name}</h1>
            {metaLine && <p className="pdp-meta">{metaLine}</p>}
            <p className="pdp-price">{fmt(product.price_cents)}</p>
            {product.description && <p className="pdp-description">{product.description}</p>}

            <button className="btn btn-gold btn-block" onClick={addToCart} disabled={added}>
              {added ? "Добавено ✓" : "Добави в количката"}
            </button>
            {added && (
              <a className="pdp-cart-link" href="/checkout">
                Към количката &rarr;
              </a>
            )}

            <ul className="trust-row pdp-trust">
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
                1 ден в България, до 10 дни за Европа
              </li>
              <li>
                <svg>
                  <use href="#i-check" />
                </svg>
                30 дни за връщане
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
