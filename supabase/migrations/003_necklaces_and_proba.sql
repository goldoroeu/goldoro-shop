-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- 1) Преименува категория "ланци" на "колиета" навсякъде в данните
-- 2) Маха градусния знак (°) от пробата (585° -> 585)
-- 3) Поправя имената на продуктите от "Златен ланец" на "Златно колие"

alter table products drop constraint if exists products_category_check;

update products set category = 'колиета' where category = 'ланци';

alter table products add constraint products_category_check
  check (category in ('гривни', 'пръстени', 'колиета', 'обеци'));

update products set proba = replace(proba, '°', '') where proba like '%°%';

update products set name = replace(name, 'Златен ланец', 'Златно колие')
  where name like '%Златен ланец%';
