-- Изпълни това в Supabase Dashboard -> SQL Editor -> New query -> Run
-- Добавя поле "размер" към продуктите (см за гривни/ланци, номер за пръстени).

alter table products add column if not exists size text;
