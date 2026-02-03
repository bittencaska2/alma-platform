-- =====================================================
-- CORREÇÃO DEFINITIVA - RODE TUDO ISSO!
-- =====================================================

-- 1. Adicionar coluna user_type baseada em role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type VARCHAR(20);
UPDATE profiles SET user_type = role WHERE user_type IS NULL;

-- 2. Garantir que psychologists tenha todas as colunas
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS crp VARCHAR(20);
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS session_price DECIMAL(10, 2) DEFAULT 160.00;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education_year INTEGER;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS approach TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;

-- 3. Criar registro em psychologists para todos os profiles com role='psychologist'
INSERT INTO psychologists (id, crp, is_active, is_verified, session_price)
SELECT 
    p.id,
    COALESCE(p.role, 'SEM-CRP') as crp,
    true as is_active,
    false as is_verified,
    160.00 as session_price
FROM profiles p
WHERE p.role = 'psychologist'
AND NOT EXISTS (
    SELECT 1 FROM psychologists WHERE psychologists.id = p.id
);

-- 4. Criar registro em patients para todos os profiles com role='patient'
INSERT INTO patients (id, age)
SELECT 
    p.id,
    p.age
FROM profiles p
WHERE p.role = 'patient'
AND NOT EXISTS (
    SELECT 1 FROM patients WHERE patients.id = p.id
);

-- 5. Recarregar cache
NOTIFY pgrst, 'reload schema';

-- 6. Verificar resultado
SELECT 'PSICÓLOGOS CRIADOS:' as info;
SELECT id, crp, is_active FROM psychologists;

SELECT 'PROFILES COM ROLE PSYCHOLOGIST:' as info;
SELECT id, full_name, role, user_type FROM profiles WHERE role = 'psychologist';
