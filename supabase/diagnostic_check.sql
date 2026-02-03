-- =====================================================
-- DIAGNÓSTICO COMPLETO DO BANCO DE DADOS
-- Cole este script no SQL Editor e copie o resultado completo
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 'TABELAS EXISTENTES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'patients', 'psychologists')
ORDER BY table_name;

-- 2. Verificar colunas da tabela psychologists
SELECT 'COLUNAS DA TABELA PSYCHOLOGISTS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'psychologists'
ORDER BY ordinal_position;

-- 3. Verificar colunas da tabela profiles
SELECT 'COLUNAS DA TABELA PROFILES:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verificar quantos psicólogos existem
SELECT 'CONTAGEM DE PSICÓLOGOS:' as info;
SELECT COUNT(*) as total_psychologists FROM psychologists;

-- 5. Ver dados dos psicólogos (mascarando dados sensíveis)
SELECT 'DADOS DOS PSICÓLOGOS:' as info;
SELECT 
    id,
    crp,
    CASE WHEN bio IS NULL THEN 'NULL' WHEN bio = '' THEN 'VAZIO' ELSE 'PREENCHIDO' END as bio_status,
    is_active,
    is_verified,
    session_price
FROM psychologists
LIMIT 5;

-- 6. Verificar políticas RLS em psychologists
SELECT 'POLÍTICAS RLS EM PSYCHOLOGISTS:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies
WHERE tablename = 'psychologists';

-- 7. Verificar se RLS está ativado
SELECT 'STATUS RLS:' as info;
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ATIVADO' ELSE 'DESATIVADO' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'patients', 'psychologists');
