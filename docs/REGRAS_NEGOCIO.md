# Regras de Negócio

## Regras Gerais

### 1. Perfis e Acesso

| Regra | Descrição |
|-------|-----------|
| RN01 | Admin tem acesso total e visualiza **todas as unidades** |
| RN02 | Gestor de Unidade vê apenas funcionários **da sua unidade** |
| RN03 | Operador tem acesso **somente leitura** (visualização) |

### 2. Aprovação

| Regra | Descrição |
|-------|-----------|
| RN04 | Gestor de Unidade pode cadastrar empréstimos e vales, mas **requerem aprovação do Admin** |
| RN05 | Lançamentos do Admin são **aprovados automaticamente** |

### 3. Empréstimos

| Regra | Descrição |
|-------|-----------|
| RN06 | **Não há limite** de empréstimo por funcionário |
| RN07 | Parcelas são geradas automaticamente após aprovação |
| RN08 | Baixa de parcelas é **manual** (sem integração com folha) |

### 4. Vales

| Regra | Descrição |
|-------|-----------|
| RN09 | Campo de **comentário é obrigatório** no cadastro de vale |
| RN10 | Vales não têm categorias fixas - motivo descrito no comentário |

### 5. Parcelas

| Regra | Descrição |
|-------|-----------|
| RN11 | Parcelas atrasadas devem gerar **destaque visual** na listagem |
| RN12 | Ao dar baixa em parcela, é **obrigatório anexar comprovante** |

### 6. Funcionários

| Regra | Descrição |
|-------|-----------|
| RN13 | Ao desligar funcionário, sistema deve **mostrar saldo devedor pendente** |

### 7. Auditoria

| Regra | Descrição |
|-------|-----------|
| RN14 | **Todas as operações** devem registrar: usuário, data/hora |

---

## Regras de Validação

### Empréstimo

```
✓ Funcionário obrigatório
✓ Valor total > 0
✓ Número de parcelas >= 1
✓ Data de início obrigatória
✓ Motivo/Justificativa obrigatório
```

### Vale

```
✓ Funcionário obrigatório
✓ Valor > 0
✓ Comentário/Motivo obrigatório (não pode estar vazio)
✓ Forma de desconto obrigatória (integral ou parcelas)
✓ Se parcelas: número de parcelas >= 1
```

### Baixa de Parcela

```
✓ Comprovante anexado obrigatório
✓ Usuário logado registrado
✓ Data/hora registrada automaticamente
```

---

## Regras de Status

### Empréstimo

| De | Para | Condição |
|----|------|----------|
| Pendente Aprovação | Ativo | Admin aprova |
| Pendente Aprovação | Rejeitado | Admin rejeita |
| Ativo | Quitado | Todas as parcelas pagas |
| Qualquer | Cancelado | Admin cancela |

### Vale

| De | Para | Condição |
|----|------|----------|
| Pendente Aprovação | Pendente | Admin aprova |
| Pendente Aprovação | Rejeitado | Admin rejeita |
| Pendente | Quitado | Totalmente descontado |
| Qualquer | Cancelado | Admin cancela |

### Parcela

| De | Para | Condição |
|----|------|----------|
| Pendente | Paga | Baixa registrada com comprovante |
| Pendente | Atrasada | Data prevista ultrapassada (automático) |
| Atrasada | Paga | Baixa registrada com comprovante |

---

## Regras de Cálculo

### Valor da Parcela

```
Valor da Parcela = Valor Total / Número de Parcelas
```

### Saldo Devedor do Funcionário

```
Saldo = Σ(Parcelas pendentes de empréstimos) + Σ(Parcelas pendentes de vales)
```

### Valor Total a Receber (Dashboard)

```
Total = Σ(Todos os saldos devedores de todos os funcionários)
```

---

## Regras de Segurança

| Regra | Descrição |
|-------|-----------|
| RS01 | Login obrigatório com usuário e senha |
| RS02 | Senhas criptografadas (bcrypt) |
| RS03 | Sessões com expiração |
| RS04 | Log de todas as ações (auditoria) |
| RS05 | Backup automático do banco |
