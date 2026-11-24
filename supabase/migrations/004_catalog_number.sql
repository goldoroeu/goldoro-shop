-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- Добавя каталожен номер на всеки продукт. Съществуващите продукти се
-- номерират по реда на създаване (1, 2, 3...), а всеки нов продукт
-- автоматично получава следващия свободен номер от базата данни.

alter table products add column if not exists catalog_number integer;

with ordered as (
  select id, row_number() over (order by created_at) as rn
  from products
)
update products p set catalog_number = o.rn
from ordered o
where o.id = p.id and p.catalog_number is null;

create sequence if not exists products_catalog_number_seq;
select setval('products_catalog_number_seq', coalesce((select max(catalog_number) from products), 0));

alter table products alter column catalog_number set default nextval('products_catalog_number_seq');
alter table products alter column catalog_number set not null;

alter table products drop constraint if exists products_catalog_number_unique;
alter table products add constraint products_catalog_number_unique unique (catalog_number);
