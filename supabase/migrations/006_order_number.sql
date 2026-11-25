-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- Добавя човешки номер на поръчка, започващ от 7643 (вместо вътрешния
-- UUID). Съществуващите 3 поръчки стават 7643, 7644, 7645 по реда на
-- създаване, а всяка следваща поръчка получава следващия номер
-- автоматично от базата данни.

alter table orders add column if not exists order_number integer;

with ordered as (
  select id, row_number() over (order by created_at) as rn
  from orders
)
update orders o set order_number = 7642 + ord.rn
from ordered ord
where ord.id = o.id and o.order_number is null;

create sequence if not exists orders_order_number_seq;
select setval('orders_order_number_seq', coalesce((select max(order_number) from orders), 7642));

alter table orders alter column order_number set default nextval('orders_order_number_seq');
alter table orders alter column order_number set not null;

alter table orders drop constraint if exists orders_order_number_unique;
alter table orders add constraint orders_order_number_unique unique (order_number);
