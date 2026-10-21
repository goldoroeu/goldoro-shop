-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- (Пълната схема — за чисто нова база. Ако вече имаш база, виж migrations/001_cod_orders.sql)

create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('гривни', 'пръстени', 'ланци', 'обеци')),
  proba text not null default '585°',
  weight text,
  description text,
  price_cents integer not null,
  image_url text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  payment_method text not null default 'card' check (payment_method in ('card', 'cod')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  stripe_session_id text unique,
  customer_name text,
  customer_email text,
  customer_phone text,
  delivery_type text check (delivery_type in ('address', 'office')),
  shipping_address text,
  amount_total integer,
  currency text default 'eur',
  items jsonb,
  created_at timestamptz not null default now()
);

-- Сайтът пише/чете през service role ключа (на сървъра), който бездруго
-- прескача RLS, затова таблиците остават без допълнителни policy-та.
alter table products enable row level security;
alter table orders enable row level security;
