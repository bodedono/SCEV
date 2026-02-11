# Fluxos Principais

## 1. Fluxo de Empréstimo (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMPRÉSTIMO - ADMIN                           │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Admin cadastra  │
    │ empréstimo com  │
    │ valor e parcelas│
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Sistema gera    │
    │ parcelas        │ ← Já aprovado automaticamente
    │ automaticamente │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Todo mês:       │
    │ Admin registra  │◄────────┐
    │ baixa com       │         │
    │ comprovante     │         │ Repete até
    └────────┬────────┘         │ quitar
             │                  │
             ▼                  │
    ┌─────────────────┐         │
    │ Sistema atualiza│─────────┘
    │ status e saldo  │
    └─────────────────┘
```

---

## 2. Fluxo de Empréstimo (Gestor de Unidade)

```
┌─────────────────────────────────────────────────────────────────┐
│                 EMPRÉSTIMO - GESTOR DE UNIDADE                  │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Gestor cadastra │
    │ empréstimo para │
    │ funcionário da  │
    │ sua unidade     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Empréstimo fica │
    │ com status      │
    │ "Pendente       │
    │  Aprovação"     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Admin recebe    │
    │ notificação/    │
    │ visualiza       │
    │ pendências      │
    └────────┬────────┘
             │
        ┌────┴────┐
        ▼         ▼
   ┌────────┐ ┌────────┐
   │ APROVA │ │ REJEITA│
   └───┬────┘ └────────┘
       │
       ▼
    ┌─────────────────┐
    │ Sistema gera    │
    │ parcelas        │
    │ automaticamente │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Todo mês:       │
    │ Admin registra  │
    │ baixa com       │
    │ comprovante     │
    └─────────────────┘
```

---

## 3. Fluxo de Vale (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│                       VALE - ADMIN                              │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Admin registra  │
    │ vale com valor  │
    │ e comentário    │
    │ do motivo       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Sistema vincula │ ← Já aprovado automaticamente
    │ ao funcionário  │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Define forma de │
    │ desconto:       │
    │ - Parcelas      │
    │ - Integral      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Admin registra  │
    │ baixa quando    │
    │ descontado com  │
    │ comprovante     │
    └─────────────────┘
```

---

## 4. Fluxo de Vale (Gestor de Unidade)

```
┌─────────────────────────────────────────────────────────────────┐
│                   VALE - GESTOR DE UNIDADE                      │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Gestor registra │
    │ vale para       │
    │ funcionário da  │
    │ sua unidade     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Vale fica com   │
    │ status          │
    │ "Pendente       │
    │  Aprovação"     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Admin recebe    │
    │ notificação/    │
    │ visualiza       │
    │ pendências      │
    └────────┬────────┘
             │
        ┌────┴────┐
        ▼         ▼
   ┌────────┐ ┌────────┐
   │ APROVA │ │ REJEITA│
   └───┬────┘ └────────┘
       │
       ▼
    ┌─────────────────┐
    │ Define forma de │
    │ desconto        │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Admin registra  │
    │ baixa quando    │
    │ descontado com  │
    │ comprovante     │
    └─────────────────┘
```

---

## 5. Operador

```
┌─────────────────────────────────────────────────────────────────┐
│                        OPERADOR                                 │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────┐
    │                                         │
    │  Operador pode consultar a qualquer     │
    │  momento (SOMENTE VISUALIZAÇÃO)         │
    │                                         │
    │  ✓ Consultar funcionários              │
    │  ✓ Ver empréstimos                     │
    │  ✓ Ver vales                           │
    │  ✓ Ver saldos                          │
    │  ✓ Ver relatórios                      │
    │                                         │
    │  ✗ NÃO pode cadastrar                  │
    │  ✗ NÃO pode editar                     │
    │  ✗ NÃO pode aprovar                    │
    │  ✗ NÃO pode dar baixa                  │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## Resumo dos Fluxos

| Ator | Ação | Requer Aprovação? |
|------|------|:-----------------:|
| Admin | Cadastra empréstimo | ❌ (automático) |
| Admin | Cadastra vale | ❌ (automático) |
| Admin | Dá baixa em parcela | N/A |
| Gestor | Cadastra empréstimo | ✅ (Admin aprova) |
| Gestor | Cadastra vale | ✅ (Admin aprova) |
| Operador | Consulta | N/A (só visualiza) |
