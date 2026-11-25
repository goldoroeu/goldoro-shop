-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- Добавя отделно поле "град" към поръчките, за да е ясно веднага
-- накъде да се изпрати пратката.

alter table orders add column if not exists city text;
