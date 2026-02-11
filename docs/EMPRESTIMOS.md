# Módulo de Empréstimos

## Visão Geral

Gerenciamento de empréstimos concedidos aos funcionários, com controle de parcelas e auditoria completa.

---

## Funcionalidades

1. **Cadastrar** novo empréstimo para funcionário
2. **Definir** valor total, número de parcelas e data de início dos descontos
3. **Visualizar** histórico de empréstimos por funcionário
4. **Fluxo de aprovação** para lançamentos de Gestores de Unidade
5. **Registrar baixa** de parcela manualmente com **anexo obrigatório**
6. **Destaque visual** para parcelas pendentes/atrasadas
7. **Relatório** de empréstimos ativos e quitados

---

## Dados do Empréstimo

| Campo | Descrição |
|-------|-----------|
| ID | Identificador único do empréstimo |
| Funcionário | Nome, matrícula, unidade |
| Data da solicitação | Quando foi solicitado |
| Valor total | Valor total do empréstimo |
| Motivo/Justificativa | Razão do empréstimo |
| Número de parcelas | Quantidade de parcelas |
| Valor da parcela | Valor de cada parcela |
| Data de início do desconto | Quando começam os descontos |
| Status | pendente aprovação, ativo, quitado, cancelado, rejeitado |
| Usuário que cadastrou | Quem registrou |
| Usuário que aprovou | Quem aprovou (se aplicável) |
| Data/hora do cadastro | Timestamp da criação |

---

## Status do Empréstimo

```
┌─────────────────────┐
│  Pendente Aprovação │ ← Cadastrado por Gestor
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌───────┐  ┌──────────┐
│ Ativo │  │ Rejeitado│
└───┬───┘  └──────────┘
    │
    ▼ (todas parcelas pagas)
┌─────────┐
│ Quitado │
└─────────┘

* Cancelado: pode ocorrer a qualquer momento (Admin)
```

---

## Dados da Parcela

| Campo | Descrição |
|-------|-----------|
| Número da parcela | Ex: 1/6, 2/6, 3/6... |
| Valor | Valor da parcela |
| Data prevista | Quando deveria ser paga |
| Data de pagamento efetivo | Quando foi realmente paga |
| Status | pendente, paga, atrasada |
| Usuário que registrou a baixa | Quem deu baixa |
| Comprovante anexado | **OBRIGATÓRIO** na baixa |
| Observações | Notas adicionais |

---

## Status da Parcela

| Status | Descrição |
|--------|-----------|
| **Pendente** | Aguardando pagamento |
| **Paga** | Baixa registrada com comprovante |
| **Atrasada** | Data prevista ultrapassada sem pagamento |

> **Importante**: Parcelas atrasadas devem ter **destaque visual** na listagem

---

## Geração de Parcelas

Quando um empréstimo é **aprovado**, o sistema gera automaticamente as parcelas:

```
Exemplo:
- Valor total: R$ 600,00
- Número de parcelas: 6
- Data início: 01/03/2026

Parcelas geradas:
1/6 - R$ 100,00 - 01/03/2026
2/6 - R$ 100,00 - 01/04/2026
3/6 - R$ 100,00 - 01/05/2026
4/6 - R$ 100,00 - 01/06/2026
5/6 - R$ 100,00 - 01/07/2026
6/6 - R$ 100,00 - 01/08/2026
```

---

## Baixa de Parcela

### Processo

1. Admin acessa lista de parcelas pendentes
2. Seleciona a parcela para dar baixa
3. **Anexa comprovante** (obrigatório)
4. Adiciona observações (opcional)
5. Confirma a baixa

### Registro

- Data/hora da baixa
- Usuário que realizou
- Comprovante anexado
- Observações

> **Nota**: A baixa é **manual** - não há integração com folha de pagamento
