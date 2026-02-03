-- =====================================================
-- ALMA PLATFORM - CORREÇÃO COMPLETA DE RLS E SCHEMA
-- Rode TUDO isso no Supabase SQL Editor
-- =====================================================

-- 1. CRIAR COLUNAS FALTANTES EM PSYCHOLOGISTS
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS session_price DECIMAL(10, 2) DEFAULT 160.00;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education_year INTEGER;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS approach TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;

-- 2. CRIAR COLUNAS FALTANTES EM PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE;

-- 3. CRIAR TABELA PATIENTS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT,
    age INTEGER,
    emergency_contact VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ATIVAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;

-- 5. REMOVER POLÍTICAS ANTIGAS (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active psychologists" ON psychologists;
DROP POLICY IF EXISTS "Psychologists can update own record" ON psychologists;
DROP POLICY IF EXISTS "Psychologists can insert own record" ON psychologists;
DROP POLICY IF EXISTS "Users can view own patient record" ON patients;
DROP POLICY IF EXISTS "Users can update own patient record" ON patients;
DROP POLICY IF EXISTS "Users can insert own patient record" ON patients;

-- 6. CRIAR POLÍTICAS RLS PARA PROFILES
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 7. CRIAR POLÍTICAS RLS PARA PSYCHOLOGISTS
CREATE POLICY "Anyone can view active psychologists"
    ON psychologists FOR SELECT
    USING (is_active = true OR auth.uid() = id);

CREATE POLICY "Psychologists can update own record"
    ON psychologists FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Psychologists can insert own record"
    ON psychologists FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 8. CRIAR POLÍTICAS RLS PARA PATIENTS
CREATE POLICY "Users can view own patient record"
    ON patients FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own patient record"
    ON patients FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own patient record"
    ON patients FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 9. ATIVAR TODOS OS PSICÓLOGOS EXISTENTES
UPDATE psychologists SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- 10. RECARREGAR CACHE
NOTIFY pgrst, 'reload schema';
