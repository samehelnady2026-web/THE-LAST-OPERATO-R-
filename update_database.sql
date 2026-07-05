-- تحديث جدول players لإضافة الأعمدة الجديدة
-- هذا الـ SQL سيضيف الأعمدة إن لم تكن موجودة

DO $$
BEGIN
    -- إضافة العمود name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'name') THEN
        ALTER TABLE players ADD COLUMN name TEXT DEFAULT '';
    END IF;

    -- إضافة العمود operator_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'operator_id') THEN
        ALTER TABLE players ADD COLUMN operator_id TEXT NOT NULL UNIQUE DEFAULT ('OPERATORE-' || gen_random_uuid()::text);
    END IF;

END $$;