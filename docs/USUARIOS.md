# Usuários do Sistema

## Perfis de Acesso

O sistema possui **3 perfis** com permissões distintas:

---

## 1. Admin

**Acesso total ao sistema**

### Permissões
- Cadastrar funcionários
- Registrar empréstimos (aprovação automática)
- Registrar vales (aprovação automática)
- **Aprovar/Rejeitar** lançamentos dos gestores
- Dar baixa em parcelas
- Acessar todos os relatórios
- Configurações do sistema
- **Visualiza TODAS as unidades**

### Fluxo
Quando o Admin cadastra empréstimo ou vale, o registro já entra como **aprovado**.

---

## 2. Gestor de Unidade

**Acesso restrito à sua unidade**

### Permissões
- Vê apenas funcionários **da sua unidade**
- Cadastra empréstimos (requer aprovação do Admin)
- Cadastra vales (requer aprovação do Admin)
- Visualiza seus próprios lançamentos e status
- Relatórios apenas da sua unidade
- **NÃO acessa outras unidades**

### Fluxo
Quando o Gestor cadastra empréstimo ou vale, o registro fica com status **"Pendente Aprovação"** até que o Admin aprove ou rejeite.

---

## 3. Operador

**Somente visualização**

### Permissões
- Consultar funcionários
- Ver empréstimos
- Ver vales
- Ver saldos
- Ver relatórios

### Restrições
- **NÃO pode editar** nada
- **NÃO pode cadastrar** nada
- **NÃO pode aprovar** nada
- **NÃO pode dar baixa** em parcelas

---

## Tabela Resumo

| Funcionalidade | Admin | Gestor | Operador |
|----------------|:-----:|:------:|:--------:|
| Ver todas unidades | ✅ | ❌ | ✅ |
| Ver funcionários | ✅ | ✅* | ✅ |
| Cadastrar funcionário | ✅ | ❌ | ❌ |
| Cadastrar empréstimo | ✅ | ✅** | ❌ |
| Cadastrar vale | ✅ | ✅** | ❌ |
| Aprovar lançamentos | ✅ | ❌ | ❌ |
| Dar baixa em parcela | ✅ | ❌ | ❌ |
| Relatórios | ✅ | ✅* | ✅ |
| Configurações | ✅ | ❌ | ❌ |

`*` Apenas da sua unidade
`**` Requer aprovação do Admin
