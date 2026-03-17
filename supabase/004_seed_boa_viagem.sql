-- ============================================================
-- SCEV - Seed Boa Viagem (dados da folha 02/2026)
-- ============================================================
-- Fonte: PDF "Informações para a folha - 02.2026" (unidade Boa Viagem).
-- Inclui apenas empréstimos; admissões/afastações foram ignorados.
--
-- Pré-requisitos:
-- 1. Execute 001_schema.sql e 002_rls.sql antes.
-- 2. Tenha pelo menos um usuário Admin (criado pelo app ou em
--    Supabase Auth + insert em usuarios com perfil 'ADMIN').
-- 3. Execute este script no SQL Editor do Supabase (role com bypass RLS).
-- ============================================================

DO $$
DECLARE
  v_unidade_id BIGINT;
  v_jonathan_id BIGINT;
  v_elane_id BIGINT;
  v_ronne_id BIGINT;
  v_emp_jonathan_id BIGINT;
  v_emp_elane_id BIGINT;
  v_emp_ronne_id BIGINT;
  v_admin_id UUID;
BEGIN
  -- Usar o primeiro Admin cadastrado (não é necessário substituir placeholder)
  SELECT id INTO v_admin_id FROM usuarios WHERE perfil = 'ADMIN' LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário Admin encontrado. Crie um Admin pelo app ou pelo Supabase Auth (e insira em usuarios com perfil ADMIN) antes de rodar este seed.';
  END IF;

  -- 1. Unidade Boa Viagem
  INSERT INTO unidades (nome, ativo)
  VALUES ('Boa Viagem', true)
  ON CONFLICT (nome) DO UPDATE SET ativo = true
  RETURNING id INTO v_unidade_id;

  -- Se ON CONFLICT fez UPDATE, RETURNING pode não retornar em algumas versões; garantir id
  IF v_unidade_id IS NULL THEN
    SELECT id INTO v_unidade_id FROM unidades WHERE nome = 'Boa Viagem' LIMIT 1;
  END IF;

  -- 2. Funcionários (dados fictícios: matrícula, cargo, data_admissao)
  INSERT INTO funcionarios (nome, matricula, unidade_id, cargo, data_admissao, ativo)
  VALUES ('Jonathan Dias Ferrer', 'BV001', v_unidade_id, 'Operador', '2020-01-01', true)
  ON CONFLICT (matricula) DO NOTHING;
  SELECT id INTO v_jonathan_id FROM funcionarios WHERE matricula = 'BV001' LIMIT 1;

  INSERT INTO funcionarios (nome, matricula, unidade_id, cargo, data_admissao, ativo)
  VALUES ('Elane Mendes', 'BV002', v_unidade_id, 'Atendente', '2020-01-01', true)
  ON CONFLICT (matricula) DO NOTHING;
  SELECT id INTO v_elane_id FROM funcionarios WHERE matricula = 'BV002' LIMIT 1;

  INSERT INTO funcionarios (nome, matricula, unidade_id, cargo, data_admissao, ativo)
  VALUES ('Ronne Henrique', 'BV003', v_unidade_id, 'Operador', '2020-01-01', true)
  ON CONFLICT (matricula) DO NOTHING;
  SELECT id INTO v_ronne_id FROM funcionarios WHERE matricula = 'BV003' LIMIT 1;

  -- 3. Empréstimos (valor_parcela fixo conforme PDF; sem juros do app)
  INSERT INTO emprestimos (
    funcionario_id, data_solicitacao, valor_total, motivo, num_parcelas, valor_parcela,
    data_inicio_desconto, status, usuario_cadastro_id, usuario_aprovacao_id
  )
  VALUES (
    v_jonathan_id, '2025-06-15', 13000.00, 'Empréstimo consignado', 26, 500.00,
    '2025-07-01', 'ATIVO', v_admin_id, v_admin_id
  )
  RETURNING id INTO v_emp_jonathan_id;

  INSERT INTO emprestimos (
    funcionario_id, data_solicitacao, valor_total, motivo, num_parcelas, valor_parcela,
    data_inicio_desconto, status, usuario_cadastro_id, usuario_aprovacao_id
  )
  VALUES (
    v_elane_id, '2026-01-22', 600.00, 'Empréstimo consignado', 2, 300.00,
    '2026-01-22', 'ATIVO', v_admin_id, v_admin_id
  )
  RETURNING id INTO v_emp_elane_id;

  INSERT INTO emprestimos (
    funcionario_id, data_solicitacao, valor_total, motivo, num_parcelas, valor_parcela,
    data_inicio_desconto, status, usuario_cadastro_id, usuario_aprovacao_id
  )
  VALUES (
    v_ronne_id, '2026-01-22', 1683.68, 'Empréstimo consignado', 4, 420.92,
    '2026-01-22', 'ATIVO', v_admin_id, v_admin_id
  )
  RETURNING id INTO v_emp_ronne_id;

  -- 4. Gerar parcelas (função do schema)
  PERFORM gerar_parcelas_emprestimo(v_emp_jonathan_id);
  PERFORM gerar_parcelas_emprestimo(v_emp_elane_id);
  PERFORM gerar_parcelas_emprestimo(v_emp_ronne_id);

  -- 5. Jonathan: parcelas 1 a 8 = PAGA (07/2025 a 02/2026)
  UPDATE parcelas
  SET status = 'PAGA', data_pagamento = data_prevista
  WHERE emprestimo_id = v_emp_jonathan_id AND numero BETWEEN 1 AND 8;

  -- 6. Parcelas atrasadas (data_prevista já passou)
  UPDATE parcelas
  SET status = 'ATRASADA'
  WHERE status = 'PENDENTE' AND data_prevista < CURRENT_DATE;
END $$;
