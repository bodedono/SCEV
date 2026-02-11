-- ============================================================
-- SCEV - Dados de teste (seed)
-- Execute APÓS criar um usuário Admin pelo Supabase Auth
-- Substitua 'SEU_USER_ID' pelo UUID do usuário criado
-- ============================================================

-- Para criar o primeiro Admin, faça:
-- 1. Crie um usuário no Supabase Auth (Dashboard > Authentication > Users > Add User)
-- 2. Copie o UUID do usuário
-- 3. Substitua abaixo e execute

INSERT INTO usuarios (id, nome, email, perfil, unidade_id)
 VALUES ('SEU_USER_ID_AQUI', 'Admin', 'admin@grupodono.com', 'ADMIN', NULL);
