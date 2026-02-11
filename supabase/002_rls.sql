-- ============================================================
-- SCEV - Row Level Security (RLS)
-- Execute APÓS o 001_schema.sql
-- ============================================================

-- Função auxiliar para pegar perfil do usuário logado
CREATE OR REPLACE FUNCTION get_user_perfil()
RETURNS perfil_usuario AS $$
  SELECT perfil FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Função auxiliar para pegar unidade do usuário logado
CREATE OR REPLACE FUNCTION get_user_unidade_id()
RETURNS BIGINT AS $$
  SELECT unidade_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vales ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- UNIDADES
-- ============================================================
-- Todos podem ver unidades
CREATE POLICY "unidades_select" ON unidades FOR SELECT USING (true);
-- Apenas Admin pode inserir/atualizar
CREATE POLICY "unidades_insert" ON unidades FOR INSERT WITH CHECK (get_user_perfil() = 'ADMIN');
CREATE POLICY "unidades_update" ON unidades FOR UPDATE USING (get_user_perfil() = 'ADMIN');

-- ============================================================
-- USUARIOS
-- ============================================================
-- Cada um vê seu próprio perfil, Admin vê todos
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT USING (
  id = auth.uid() OR get_user_perfil() = 'ADMIN'
);
CREATE POLICY "usuarios_insert" ON usuarios FOR INSERT WITH CHECK (get_user_perfil() = 'ADMIN');
CREATE POLICY "usuarios_update" ON usuarios FOR UPDATE USING (get_user_perfil() = 'ADMIN');

-- ============================================================
-- FUNCIONARIOS
-- ============================================================
-- Admin e Operador veem todos. Gestor vê só da sua unidade
CREATE POLICY "funcionarios_select" ON funcionarios FOR SELECT USING (
  get_user_perfil() IN ('ADMIN', 'OPERADOR')
  OR (get_user_perfil() = 'GESTOR' AND unidade_id = get_user_unidade_id())
);
-- Apenas Admin pode criar/editar
CREATE POLICY "funcionarios_insert" ON funcionarios FOR INSERT WITH CHECK (get_user_perfil() = 'ADMIN');
CREATE POLICY "funcionarios_update" ON funcionarios FOR UPDATE USING (get_user_perfil() = 'ADMIN');

-- ============================================================
-- EMPRESTIMOS
-- ============================================================
-- Admin e Operador veem todos. Gestor vê só os da sua unidade
CREATE POLICY "emprestimos_select" ON emprestimos FOR SELECT USING (
  get_user_perfil() IN ('ADMIN', 'OPERADOR')
  OR (
    get_user_perfil() = 'GESTOR'
    AND funcionario_id IN (SELECT id FROM funcionarios WHERE unidade_id = get_user_unidade_id())
  )
);
-- Admin e Gestor podem criar
CREATE POLICY "emprestimos_insert" ON emprestimos FOR INSERT WITH CHECK (
  get_user_perfil() IN ('ADMIN', 'GESTOR')
);
-- Apenas Admin pode atualizar (aprovar, rejeitar, cancelar)
CREATE POLICY "emprestimos_update" ON emprestimos FOR UPDATE USING (
  get_user_perfil() = 'ADMIN'
);

-- ============================================================
-- VALES
-- ============================================================
CREATE POLICY "vales_select" ON vales FOR SELECT USING (
  get_user_perfil() IN ('ADMIN', 'OPERADOR')
  OR (
    get_user_perfil() = 'GESTOR'
    AND funcionario_id IN (SELECT id FROM funcionarios WHERE unidade_id = get_user_unidade_id())
  )
);
CREATE POLICY "vales_insert" ON vales FOR INSERT WITH CHECK (
  get_user_perfil() IN ('ADMIN', 'GESTOR')
);
CREATE POLICY "vales_update" ON vales FOR UPDATE USING (
  get_user_perfil() = 'ADMIN'
);

-- ============================================================
-- PARCELAS
-- ============================================================
CREATE POLICY "parcelas_select" ON parcelas FOR SELECT USING (
  get_user_perfil() IN ('ADMIN', 'OPERADOR')
  OR (
    get_user_perfil() = 'GESTOR'
    AND (
      emprestimo_id IN (SELECT e.id FROM emprestimos e JOIN funcionarios f ON f.id = e.funcionario_id WHERE f.unidade_id = get_user_unidade_id())
      OR vale_id IN (SELECT v.id FROM vales v JOIN funcionarios f ON f.id = v.funcionario_id WHERE f.unidade_id = get_user_unidade_id())
    )
  )
);
-- Apenas Admin pode dar baixa (update)
CREATE POLICY "parcelas_update" ON parcelas FOR UPDATE USING (
  get_user_perfil() = 'ADMIN'
);

-- ============================================================
-- LOGS DE AUDITORIA
-- ============================================================
-- Apenas Admin pode ver logs
CREATE POLICY "logs_select" ON logs_auditoria FOR SELECT USING (
  get_user_perfil() = 'ADMIN'
);
-- Qualquer usuário autenticado pode inserir log
CREATE POLICY "logs_insert" ON logs_auditoria FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE: Bucket de comprovantes
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', false)
ON CONFLICT (id) DO NOTHING;

-- Qualquer autenticado pode fazer upload
CREATE POLICY "comprovantes_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'comprovantes' AND auth.uid() IS NOT NULL);

-- Qualquer autenticado pode ver
CREATE POLICY "comprovantes_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'comprovantes' AND auth.uid() IS NOT NULL);
