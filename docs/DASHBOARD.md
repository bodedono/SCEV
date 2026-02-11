# Dashboard e Relatórios

## Dashboard Principal

### Visão Admin (todas as unidades)

```
┌─────────────────────────────────────────────────────────────────┐
│ DASHBOARD                                            Grupo Do Nô │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ 🔔 PENDÊNCIAS   │ 📊 EMPRÉSTIMOS  │ 📋 VALES                    │
│                 │                 │                              │
│ 5 aguardando    │ 23 ativos       │ 12 pendentes                │
│ aprovação       │                 │                              │
├─────────────────┴─────────────────┴─────────────────────────────┤
│                                                                  │
│ 💰 VALOR TOTAL A RECEBER: R$ 45.320,00                          │
│                                                                  │
│ ⚠️  PARCELAS VENCIDAS/ATRASADAS: 8                              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ 📈 EVOLUÇÃO MENSAL                                              │
│                                                                  │
│     |    ___                                                    │
│     |   /   \      ___                                          │
│     |  /     \    /   \                                         │
│     | /       \__/     \                                        │
│     |/                  \_                                      │
│     +----+----+----+----+----                                   │
│       Jan  Fev  Mar  Abr  Mai                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Componentes do Dashboard

| Componente | Descrição |
|------------|-----------|
| Pendências de aprovação | Empréstimos e vales aguardando aprovação do Admin |
| Total de empréstimos ativos | Quantidade de empréstimos em andamento |
| Total de vales pendentes | Quantidade de vales não quitados |
| Valor total a receber | Soma de todas as parcelas pendentes (empréstimos + vales) |
| Parcelas vencidas/atrasadas | Quantidade com destaque visual |
| Gráfico de evolução mensal | Visualização da evolução dos valores |

---

## Relatórios Disponíveis

### 1. Empréstimos por Funcionário

Lista todos os empréstimos de um funcionário específico:
- Histórico completo
- Status de cada empréstimo
- Parcelas pagas e pendentes

### 2. Empréstimos por Unidade

Visão consolidada por unidade:
- Total de empréstimos ativos
- Valor total emprestado
- Valor pendente de recebimento

### 3. Vales por Período

Filtro por data:
- Data inicial e final
- Filtro por unidade (opcional)
- Listagem de vales no período

### 4. Parcelas Pendentes do Mês

Lista de todas as parcelas com vencimento no mês atual:
- Ordenado por data
- Destaque para atrasadas
- Ação rápida de baixa (Admin)

### 5. Histórico de Baixas (Auditoria)

Registro de todas as baixas realizadas:
- Data/hora
- Usuário responsável
- Parcela/vale
- Comprovante anexado

### 6. Histórico de Aprovações/Rejeições

Registro de decisões do Admin:
- Data/hora
- Usuário que aprovou/rejeitou
- Empréstimo/vale afetado
- Status final

---

## Exportação

### Formatos disponíveis (Fase 2)
- Excel (.xlsx)
- PDF

### Dados exportáveis
- Todos os relatórios
- Listagens filtradas
- Ficha do funcionário

---

## Filtros Comuns

| Filtro | Descrição |
|--------|-----------|
| Período | Data inicial e final |
| Unidade | Uma ou todas as unidades |
| Status | Pendente, ativo, quitado, etc. |
| Funcionário | Busca por nome ou matrícula |

---

## Permissões de Relatórios

| Relatório | Admin | Gestor | Operador |
|-----------|:-----:|:------:|:--------:|
| Todas as unidades | ✅ | ❌ | ✅ |
| Própria unidade | ✅ | ✅ | ✅ |
| Histórico de auditoria | ✅ | ❌ | ✅ |
| Exportação | ✅ | ✅ | ✅ |

> **Nota**: Gestor vê apenas relatórios da sua unidade
