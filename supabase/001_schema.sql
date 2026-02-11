-- ============================================================
-- SCEV - Sistema de Controle de Empréstimos e Vales
-- Schema do banco de dados
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Enums
CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'GESTOR', 'OPERADOR');
CREATE TYPE status_emprestimo AS ENUM ('PENDENTE_APROVACAO', 'ATIVO', 'QUITADO', 'CANCELADO', 'REJEITADO');
CREATE TYPE status_vale AS ENUM ('PENDENTE_APROVACAO', 'PENDENTE', 'QUITADO', 'CANCELADO', 'REJEITADO');
CREATE TYPE status_parcela AS ENUM ('PENDENTE', 'PAGA', 'ATRASADA');
CREATE TYPE forma_desconto AS ENUM ('INTEGRAL', 'PARCELAS');
CREATE TYPE tipo_parcela AS ENUM ('EMPRESTIMO', 'VALE');

-- ============================================================
-- UNIDADES
-- ============================================================
CREATE TABLE unidades (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USUARIOS (vinculado ao auth.users do Supabase)
-- ============================================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  perfil perfil_usuario NOT NULL DEFAULT 'OPERADOR',
  unidade_id BIGINT REFERENCES unidades(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FUNCIONARIOS
-- ============================================================
CREATE TABLE funcionarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  unidade_id BIGINT NOT NULL REFERENCES unidades(id),
  cargo TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_funcionarios_unidade ON funcionarios(unidade_id);
CREATE INDEX idx_funcionarios_matricula ON funcionarios(matricula);
CREATE INDEX idx_funcionarios_ativo ON funcionarios(ativo);

-- ============================================================
-- EMPRESTIMOS
-- ============================================================
CREATE TABLE emprestimos (
  id BIGSERIAL PRIMARY KEY,
  funcionario_id BIGINT NOT NULL REFERENCES funcionarios(id),
  data_solicitacao DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_total NUMERIC(12,2) NOT NULL CHECK (valor_total > 0),
  motivo TEXT NOT NULL,
  num_parcelas INTEGER NOT NULL CHECK (num_parcelas >= 1),
  valor_parcela NUMERIC(12,2) NOT NULL CHECK (valor_parcela > 0),
  data_inicio_desconto DATE NOT NULL,
  status status_emprestimo NOT NULL DEFAULT 'PENDENTE_APROVACAO',
  usuario_cadastro_id UUID NOT NULL REFERENCES usuarios(id),
  usuario_aprovacao_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emprestimos_funcionario ON emprestimos(funcionario_id);
CREATE INDEX idx_emprestimos_status ON emprestimos(status);

-- ============================================================
-- VALES
-- ============================================================
CREATE TABLE vales (
  id BIGSERIAL PRIMARY KEY,
  funcionario_id BIGINT NOT NULL REFERENCES funcionarios(id),
  data_ocorrido DATE NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  comentario TEXT NOT NULL CHECK (length(trim(comentario)) > 0),
  referencia TEXT,
  forma_desconto forma_desconto NOT NULL DEFAULT 'INTEGRAL',
  num_parcelas INTEGER NOT NULL DEFAULT 1 CHECK (num_parcelas >= 1),
  status status_vale NOT NULL DEFAULT 'PENDENTE_APROVACAO',
  usuario_cadastro_id UUID NOT NULL REFERENCES usuarios(id),
  usuario_aprovacao_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vales_funcionario ON vales(funcionario_id);
CREATE INDEX idx_vales_status ON vales(status);

-- ============================================================
-- PARCELAS (compartilhada entre empréstimos e vales)
-- ============================================================
CREATE TABLE parcelas (
  id BIGSERIAL PRIMARY KEY,
  tipo tipo_parcela NOT NULL,
  emprestimo_id BIGINT REFERENCES emprestimos(id),
  vale_id BIGINT REFERENCES vales(id),
  numero INTEGER NOT NULL,
  total_parcelas INTEGER NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  data_prevista DATE NOT NULL,
  data_pagamento DATE,
  status status_parcela NOT NULL DEFAULT 'PENDENTE',
  usuario_baixa_id UUID REFERENCES usuarios(id),
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_parcela_vinculo CHECK (
    (tipo = 'EMPRESTIMO' AND emprestimo_id IS NOT NULL AND vale_id IS NULL)
    OR
    (tipo = 'VALE' AND vale_id IS NOT NULL AND emprestimo_id IS NULL)
  )
);

CREATE INDEX idx_parcelas_emprestimo ON parcelas(emprestimo_id);
CREATE INDEX idx_parcelas_vale ON parcelas(vale_id);
CREATE INDEX idx_parcelas_status ON parcelas(status);
CREATE INDEX idx_parcelas_data_prevista ON parcelas(data_prevista);

-- ============================================================
-- LOGS DE AUDITORIA
-- ============================================================
CREATE TABLE logs_auditoria (
  id BIGSERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  acao TEXT NOT NULL,
  tabela TEXT NOT NULL,
  registro_id BIGINT,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_tabela ON logs_auditoria(tabela);
CREATE INDEX idx_logs_created ON logs_auditoria(created_at);

-- ============================================================
-- FUNÇÕES AUXILIARES
-- ============================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_unidades_updated BEFORE UPDATE ON unidades FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_funcionarios_updated BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_emprestimos_updated BEFORE UPDATE ON emprestimos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_vales_updated BEFORE UPDATE ON vales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_parcelas_updated BEFORE UPDATE ON parcelas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para gerar parcelas de empréstimo
CREATE OR REPLACE FUNCTION gerar_parcelas_emprestimo(p_emprestimo_id BIGINT)
RETURNS VOID AS $$
DECLARE
  emp RECORD;
  i INTEGER;
  data_parcela DATE;
BEGIN
  SELECT * INTO emp FROM emprestimos WHERE id = p_emprestimo_id;

  FOR i IN 1..emp.num_parcelas LOOP
    data_parcela := emp.data_inicio_desconto + ((i - 1) * INTERVAL '1 month');

    INSERT INTO parcelas (tipo, emprestimo_id, numero, total_parcelas, valor, data_prevista)
    VALUES ('EMPRESTIMO', emp.id, i, emp.num_parcelas, emp.valor_parcela, data_parcela);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar parcelas de vale
CREATE OR REPLACE FUNCTION gerar_parcelas_vale(p_vale_id BIGINT)
RETURNS VOID AS $$
DECLARE
  v RECORD;
  i INTEGER;
  valor_parc NUMERIC(12,2);
  data_parcela DATE;
BEGIN
  SELECT * INTO v FROM vales WHERE id = p_vale_id;

  valor_parc := ROUND(v.valor / v.num_parcelas, 2);

  FOR i IN 1..v.num_parcelas LOOP
    data_parcela := CURRENT_DATE + ((i - 1) * INTERVAL '1 month');

    INSERT INTO parcelas (tipo, vale_id, numero, total_parcelas, valor, data_prevista)
    VALUES ('VALE', v.id, i, v.num_parcelas, valor_parc, data_parcela);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se empréstimo foi quitado
CREATE OR REPLACE FUNCTION verificar_quitacao_emprestimo()
RETURNS TRIGGER AS $$
DECLARE
  pendentes INTEGER;
BEGIN
  IF NEW.status = 'PAGA' AND NEW.emprestimo_id IS NOT NULL THEN
    SELECT COUNT(*) INTO pendentes
    FROM parcelas
    WHERE emprestimo_id = NEW.emprestimo_id AND status != 'PAGA';

    IF pendentes = 0 THEN
      UPDATE emprestimos SET status = 'QUITADO' WHERE id = NEW.emprestimo_id;
    END IF;
  END IF;

  IF NEW.status = 'PAGA' AND NEW.vale_id IS NOT NULL THEN
    SELECT COUNT(*) INTO pendentes
    FROM parcelas
    WHERE vale_id = NEW.vale_id AND status != 'PAGA';

    IF pendentes = 0 THEN
      UPDATE vales SET status = 'QUITADO' WHERE id = NEW.vale_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_verificar_quitacao
  AFTER UPDATE ON parcelas
  FOR EACH ROW
  WHEN (NEW.status = 'PAGA')
  EXECUTE FUNCTION verificar_quitacao_emprestimo();

-- ============================================================
-- VIEW: Saldo devedor por funcionário
-- ============================================================
CREATE OR REPLACE VIEW vw_saldo_devedor AS
SELECT
  f.id AS funcionario_id,
  f.nome,
  f.matricula,
  f.unidade_id,
  COALESCE(SUM(p.valor) FILTER (WHERE p.status != 'PAGA'), 0) AS saldo_devedor
FROM funcionarios f
LEFT JOIN emprestimos e ON e.funcionario_id = f.id AND e.status IN ('ATIVO')
LEFT JOIN vales v ON v.funcionario_id = f.id AND v.status IN ('PENDENTE')
LEFT JOIN parcelas p ON (p.emprestimo_id = e.id OR p.vale_id = v.id)
GROUP BY f.id, f.nome, f.matricula, f.unidade_id;

-- ============================================================
-- DADOS INICIAIS
-- ============================================================
INSERT INTO unidades (nome) VALUES
  ('Bode do Nô'),
  ('Burguer do Nô'),
  ('Italianô');
