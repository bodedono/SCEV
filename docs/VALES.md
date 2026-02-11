# Módulo de Vales

## O que é Vale?

Vale é uma **despesa operacional** repassada ao garçom/funcionário por situações diversas:

- Cliente saiu sem pagar
- Quebra de material
- Diferença de caixa
- Outras situações

> **Importante**: O motivo específico é registrado no **campo de comentário/observação**, sem categorização fixa.

---

## Funcionalidades

1. **Registrar** novo vale para funcionário
2. **Campo de comentário obrigatório** para descrever o motivo
3. **Vincular** a uma comanda/mesa (opcional)
4. **Fluxo de aprovação** para lançamentos de Gestores de Unidade
5. **Definir forma de desconto** (parcelas ou integral)
6. **Visualizar** histórico de vales por funcionário
7. **Relatório** de vales por período e unidade

---

## Dados do Vale

| Campo | Descrição |
|-------|-----------|
| ID | Identificador único do vale |
| Funcionário | Nome, matrícula, unidade |
| Data do ocorrido | Quando aconteceu a situação |
| Valor | Valor do vale |
| Comentário/Motivo | **OBRIGATÓRIO** - descrição da situação |
| Referência | Nº comanda, mesa, etc. (opcional) |
| Forma de desconto | Parcelas ou integral |
| Número de parcelas | Se aplicável |
| Status | pendente aprovação, pendente, quitado, cancelado, rejeitado |
| Usuário que cadastrou | Quem registrou |
| Usuário que aprovou | Quem aprovou (se aplicável) |
| Data/hora do cadastro | Timestamp da criação |

---

## Status do Vale

```
┌─────────────────────┐
│  Pendente Aprovação │ ← Cadastrado por Gestor
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌──────────┐  ┌──────────┐
│ Pendente │  │ Rejeitado│
└────┬─────┘  └──────────┘
     │
     ▼ (totalmente descontado)
┌─────────┐
│ Quitado │
└─────────┘

* Cancelado: pode ocorrer a qualquer momento (Admin)
```

---

## Formas de Desconto

### 1. Integral
- Valor total descontado de uma vez
- Gera apenas 1 parcela

### 2. Parcelado
- Valor dividido em múltiplas parcelas
- Funcionário define número de parcelas

```
Exemplo:
- Valor do vale: R$ 150,00
- Forma: Parcelas
- Número de parcelas: 3

Parcelas:
1/3 - R$ 50,00
2/3 - R$ 50,00
3/3 - R$ 50,00
```

---

## Diferença: Vale vs Empréstimo

| Aspecto | Empréstimo | Vale |
|---------|------------|------|
| Origem | Solicitação do funcionário | Situação operacional |
| Motivo | Campo justificativa | **Comentário obrigatório** |
| Referência | Não tem | Comanda/mesa (opcional) |
| Categorias | Não | Não (motivo no comentário) |

---

## Campo de Comentário

### Por que é obrigatório?

- Não existem categorias pré-definidas
- Cada situação é única
- Necessário para auditoria e rastreabilidade
- Ajuda a identificar padrões de problemas

### Exemplos de comentários

```
"Mesa 15 - cliente fugiu sem pagar conta de R$ 87,50"
"Quebra de 3 taças durante o serviço"
"Diferença de R$ 23,00 no fechamento do caixa"
"Comanda 1234 - troco dado errado"
```

---

## Baixa de Vale

Mesmo processo do empréstimo:

1. Admin acessa vales pendentes
2. Seleciona vale/parcela para baixa
3. **Anexa comprovante** (obrigatório)
4. Confirma a baixa

> **Nota**: A baixa é **manual** - não há integração com folha de pagamento
