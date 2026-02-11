# Cronograma Sugerido

## Visão Geral

**Total estimado: 7-8 semanas**

---

## Fases do Projeto

| Fase | Descrição | Atividades |
|:----:|-----------|------------|
| 1 | Modelagem e Setup | Modelagem do banco e setup do projeto |
| 2 | Autenticação e Funcionários | Autenticação e CRUD funcionários |
| 3 | Módulo de Empréstimos | Empréstimos + fluxo de aprovação |
| 4 | Módulo de Vales | Cadastro e gestão de vales |
| 5 | Dashboard e Listagens | Telas principais e navegação |
| 6 | Testes e Ajustes | QA, correções e refinamentos |

---

## Detalhamento por Fase

### Fase 1: Modelagem e Setup

**Atividades:**
- Definição final do modelo de dados
- Criação dos scripts SQL
- Setup do repositório Git
- Configuração do ambiente de desenvolvimento
- Setup do projeto frontend
- Setup do projeto backend
- Conexão com banco de dados

**Entregáveis:**
- Repositório configurado
- Banco de dados criado
- Estrutura básica do projeto

---

### Fase 2: Autenticação e CRUD Funcionários

**Atividades:**
- Implementar autenticação JWT
- Criar sistema de refresh token
- Implementar controle de permissões por perfil
- Tela de login
- CRUD de unidades
- CRUD de funcionários
- Filtros e busca

**Entregáveis:**
- Sistema de login funcionando
- Gestão de funcionários completa

---

### Fase 3: Módulo de Empréstimos + Fluxo de Aprovação

**Atividades:**
- Formulário de cadastro de empréstimo
- Lógica de geração de parcelas
- Implementar fluxo de aprovação
- Tela de pendências de aprovação
- Listagem de empréstimos
- Visualização de parcelas

**Entregáveis:**
- Empréstimos funcionando end-to-end
- Fluxo Gestor → Admin operacional

---

### Fase 4: Módulo de Vales

**Atividades:**
- Formulário de cadastro de vale
- Validação de comentário obrigatório
- Formas de desconto (integral/parcelas)
- Fluxo de aprovação
- Listagem de vales

**Entregáveis:**
- Vales funcionando end-to-end

---

### Fase 5: Dashboard e Listagens

**Atividades:**
- Dashboard com totalizadores
- Listagem de parcelas pendentes
- Implementar baixa de parcela
- Upload de comprovante
- Destaque visual para atrasadas
- Ficha consolidada do funcionário

**Entregáveis:**
- Dashboard operacional
- Baixa de parcelas funcionando

---

### Fase 6: Testes e Ajustes

**Atividades:**
- Testes de integração
- Testes de permissões por perfil
- Validação de regras de negócio
- Correção de bugs
- Ajustes de interface
- Documentação final

**Entregáveis:**
- Sistema testado e validado
- Documentação completa
- Deploy em ambiente de teste

---

## Diagrama de Gantt (Simplificado)

```
Semana      1    2    3    4    5    6    7    8
           ─────────────────────────────────────────
Fase 1     ████
Fase 2          ████
Fase 3               ████ ████
Fase 4                         ████
Fase 5                              ████
Fase 6                                   ████
           ─────────────────────────────────────────
```

---

## Marcos (Milestones)

| Semana | Marco |
|:------:|-------|
| 1 | Ambiente configurado, banco criado |
| 2 | Login e CRUD funcionários funcionando |
| 4 | Empréstimos com aprovação funcionando |
| 5 | Vales implementados |
| 6 | Dashboard e baixas funcionando |
| 7-8 | Sistema testado e documentado |

---

## Observações

- As estimativas são aproximadas e podem variar
- Recomenda-se entregas incrementais para validação
- Testes devem ser realizados ao longo de todas as fases
- Documentação deve ser atualizada continuamente
