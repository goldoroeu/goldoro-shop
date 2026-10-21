-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- Добавя поддръжка на "наложен платеж" (Еконт) към съществуващата orders таблица.

alter table orders alter column stripe_session_id drop not null;

alter table orders add column if not exists payment_method text not null default 'card'
  check (payment_method in ('card', 'cod'));

alter table orders add column if not exists status text not null default 'paid'
  check (status in ('pending', 'paid', 'shipped', 'cancelled'));

alter table orders add column if not exists customer_name text;
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists delivery_type text
  check (delivery_type in ('address', 'office'));
alter table orders add column if not exists shipping_address text;
