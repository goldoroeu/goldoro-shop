import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="status-page">
      <div className="status-card">
        <p className="eyebrow">Плащането е прекъснато</p>
        <h1>Поръчката не беше завършена</h1>
        <p>Количката ви е запазена — можете да продължите пазаруването и да платите по-късно.</p>
        <Link className="btn btn-gold" href="/">
          Обратно към магазина
        </Link>
      </div>
    </main>
  );
}
