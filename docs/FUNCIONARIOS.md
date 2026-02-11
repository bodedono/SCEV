# Módulo de Funcionários

## Dados do Funcionário

| Campo | Descrição |
|-------|-----------|
| ID | Identificador único |
| Nome completo | Nome do funcionário |
| Matrícula | Número de identificação interna |
| Unidade | Bode do Nô, Burguer do Nô, Italianô, etc. |
| Cargo/Função | Posição do funcionário |
| Data de admissão | Quando foi contratado |
| Status | Ativo ou Inativo |
| Saldo devedor total | Empréstimos + Vales pendentes |

---

## Unidades do Grupo Do Nô

- Bode do Nô
- Burguer do Nô
- Italianô
- (outras unidades podem ser cadastradas)

---

## Saldo Devedor

O saldo devedor é calculado automaticamente:

```
Saldo Devedor = Σ(Parcelas pendentes de empréstimos) + Σ(Parcelas pendentes de vales)
```

### Exemplo

```
Funcionário: João Silva
├── Empréstimo #1: R$ 200,00 (2 parcelas pendentes de R$ 100,00)
├── Empréstimo #2: R$ 150,00 (1 parcela pendente)
└── Vale #1: R$ 50,00 (integral pendente)

Saldo Devedor Total: R$ 200,00 + R$ 150,00 + R$ 50,00 = R$ 400,00
```

---

## Status do Funcionário

### Ativo
- Funcionário em exercício
- Pode receber empréstimos e vales
- Parcelas em andamento

### Inativo
- Funcionário desligado
- **NÃO pode** receber novos empréstimos/vales
- Sistema **DEVE mostrar saldo devedor pendente** ao desligar

---

## Ficha do Funcionário

A ficha exibe todas as informações consolidadas:

```
┌────────────────────────────────────────────────┐
│ FICHA DO FUNCIONÁRIO                           │
├────────────────────────────────────────────────┤
│ Nome: João da Silva                            │
│ Matrícula: 12345                               │
│ Unidade: Bode do Nô                            │
│ Cargo: Garçom                                  │
│ Admissão: 15/03/2020                           │
│ Status: Ativo                                  │
├────────────────────────────────────────────────┤
│ SALDO DEVEDOR: R$ 400,00                       │
├────────────────────────────────────────────────┤
│ EMPRÉSTIMOS                                    │
│ ├── #1 - R$ 600,00 - Ativo (4/6 parcelas)     │
│ └── #2 - R$ 300,00 - Quitado                  │
├────────────────────────────────────────────────┤
│ VALES                                          │
│ ├── #1 - R$ 87,50 - Mesa 15 fugiu - Pendente  │
│ └── #2 - R$ 50,00 - Quebra taças - Quitado    │
└────────────────────────────────────────────────┘
```

---

## Desligamento de Funcionário

Quando um funcionário é **desligado** (status → Inativo):

1. Sistema bloqueia novos empréstimos/vales
2. Sistema **exibe alerta** com saldo devedor pendente
3. Parcelas existentes continuam ativas para controle
4. Histórico é mantido para auditoria

> **Importante**: O sistema deve alertar claramente sobre pendências no momento do desligamento

---

## Filtros e Buscas

### Buscar por:
- Nome
- Matrícula
- Unidade

### Filtrar por:
- Unidade
- Status (ativo/inativo)
- Com saldo devedor
- Sem saldo devedor

---

## Permissões por Perfil

| Ação | Admin | Gestor | Operador |
|------|:-----:|:------:|:--------:|
| Ver todos funcionários | ✅ | ❌ | ✅ |
| Ver funcionários da unidade | ✅ | ✅ | ✅ |
| Cadastrar funcionário | ✅ | ❌ | ❌ |
| Editar funcionário | ✅ | ❌ | ❌ |
| Desativar funcionário | ✅ | ❌ | ❌ |
| Ver ficha completa | ✅ | ✅ | ✅ |
