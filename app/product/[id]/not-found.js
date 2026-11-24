import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="status-page">
      <div className="status-card">
        <p className="eyebrow">404</p>
        <h1>Продуктът не е намерен</h1>
        <p>Може би вече не е в наличност, или линкът е грешен.</p>
        <Link className="btn btn-gold" href="/#catalog">
          Към каталога
        </Link>
      </div>
    </main>
  );
}
