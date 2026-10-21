# Gold'Oro — онлайн магазин

Витрина с количка, истински Stripe checkout и админ панел за управление на продукти (име, цена, описание, снимки).

## Какво съдържа

- `/` — витрината (каталог, филтри по категория, количка)
- `/admin` — админ панел (защитен с парола): добавяне/редакция/изтриване на продукти, качване на снимки
- `/admin/orders` — списък с платените поръчки
- Checkout през Stripe (истинско плащане, пренасочва към страницата на Stripe)

## Преди да пуснеш сайта — 3 безплатни акаунта

1. **[supabase.com](https://supabase.com)** — база данни за продуктите + съхранение на снимки
2. **[stripe.com](https://stripe.com)** — приемане на плащания
3. **[vercel.com](https://vercel.com)** — хостинг на сайта

Всички имат безплатен план, достатъчен за старт (виж разговора в чата за детайли).

## 1. Supabase — база данни и снимки

1. Влез в [supabase.com](https://supabase.com) → **New project**. Избери си име и парола за базата (запази я някъде, ще ти трябва само ако влизаш директно в базата).
2. Отвори **SQL Editor** → **New query**, копирай съдържанието на [`supabase/schema.sql`](supabase/schema.sql) от тази папка и натисни **Run**. Това създава таблиците `products` и `orders`.
3. Отвори **Storage** → **New bucket** → име: `product-images` → включи **Public bucket** → Create.
4. Отвори **Settings → API** и копирай:
   - **Project URL** → това е `SUPABASE_URL`
   - **service_role** ключа (под "Project API keys", не "anon"!) → това е `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ `service_role` ключът е таен — не го качвай в git, не го споделяй. Той вече е в `.gitignore` чрез `.env.local`.

## 2. Stripe — плащания

1. Влез в [stripe.com](https://stripe.com) → завърши регистрацията (за истински плащания ще поиска данни за бизнеса; дотогава можеш да тестваш в **Test mode**).
2. **Developers → API keys** → копирай **Secret key** → това е `STRIPE_SECRET_KEY`.
3. Webhook-а го настройваш **след** първия деплой в Vercel (защото му трябва истинският адрес на сайта) — виж стъпка 4 по-долу.

## 3. Качване в git + Vercel

В терминала, вътре в тази папка:

```bash
git init
git add .
git commit -m "Gold'Oro shop"
```

Качи го в GitHub (създай празно repo в github.com, после):

```bash
git remote add origin https://github.com/<твоят-акаунт>/goldoro-shop.git
git branch -M main
git push -u origin main
```

После в [vercel.com](https://vercel.com):

1. **Add New → Project** → избери repo `goldoro-shop` → **Import**.
2. Преди да натиснеш Deploy, разгъни **Environment Variables** и добави:

   | Име | Стойност |
   |---|---|
   | `SUPABASE_URL` | от Supabase (стъпка 1) |
   | `SUPABASE_SERVICE_ROLE_KEY` | от Supabase (стъпка 1) |
   | `STRIPE_SECRET_KEY` | от Stripe (стъпка 2) |
   | `STRIPE_WEBHOOK_SECRET` | временно остави празно, ще го сложиш в стъпка 4 |
   | `ADMIN_PASSWORD` | парола по твой избор за `/admin` |
   | `ADMIN_SESSION_SECRET` | произволен дълъг низ (виж по-долу как да го генерираш) |
   | `NEXT_PUBLIC_SITE_URL` | адресът, който Vercel ще ти даде, напр. `https://goldoro-shop.vercel.app` |

   За `ADMIN_SESSION_SECRET`, пусни в терминала:
   ```bash
   openssl rand -hex 32
   ```
   и копирай резултата.

3. Натисни **Deploy**. След ~1 минута ще получиш линк към сайта.
4. Ако после променяш `NEXT_PUBLIC_SITE_URL` (напр. си добавил собствен домейн), update-ни я в Vercel → Settings → Environment Variables → Redeploy.

## 4. Webhook на Stripe (след деплой)

1. В Stripe → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://<твоят-сайт>.vercel.app/api/webhook`
3. Избери event: `checkout.session.completed`
4. Save → копирай **Signing secret** (започва с `whsec_...`)
5. Върни се в Vercel → Settings → Environment Variables → добави `STRIPE_WEBHOOK_SECRET` с тази стойност → **Redeploy** (от Deployments → три точки → Redeploy).

Без тази стъпка плащанията работят, но поръчките няма да се записват в `/admin/orders`.

## 5. Пробвай

1. Отвори сайта → добави продукт от `/admin` (вход с паролата, която си сложил в `ADMIN_PASSWORD`).
2. На витрината добави продукта в количката → **Завърши поръчка**.
3. Докато Stripe акаунтът ти е в **Test mode**, плащането е "на шега" — използвай тестова карта `4242 4242 4242 4242`, произволна бъдеща дата и CVC.
4. Когато си готов за истински продажби, превключи Stripe от Test mode на Live mode (горе вдясно в Stripe Dashboard) и смени `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` в Vercel с live-версиите им.

## Локално разработване (по желание)

Изисква Node.js 18+ инсталиран на машината:

```bash
cp .env.local.example .env.local   # и попълни стойностите
npm install
npm run dev
```

Сайтът тръгва на `http://localhost:3000`.
