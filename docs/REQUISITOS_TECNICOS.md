# Requisitos Técnicos

## Stack Sugerida

### Frontend
- **React** ou **Vue.js**

### Backend
- **Node.js** ou **Python** (FastAPI/Django)

### Banco de Dados
- **PostgreSQL** ou **MySQL**

### Autenticação
- **JWT** com refresh token

### Hospedagem
- **Vercel/Railway** ou servidor interno

---

## Requisitos de Segurança

| Requisito | Descrição |
|-----------|-----------|
| Autenticação | Login com usuário e senha |
| Criptografia | Senhas criptografadas com **bcrypt** |
| Sessões | Com expiração (configurável) |
| Auditoria | Log de todas as ações |
| Backup | Backup automático do banco de dados |

---

## Requisitos de Interface

| Requisito | Descrição |
|-----------|-----------|
| Plataforma | **Interface web para desktop apenas** |
| Responsividade | **Não é necessário** suporte mobile |
| Navegadores | Chrome, Firefox, Edge (últimas versões) |

---

## Estrutura do Banco de Dados (Sugestão)

### Tabelas Principais

```
┌─────────────────┐     ┌─────────────────┐
│    usuarios     │     │    unidades     │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ nome            │     │ nome            │
│ email           │     │ ativo           │
│ senha_hash      │     └─────────────────┘
│ perfil          │              │
│ unidade_id (FK) │              │
│ ativo           │              │
└─────────────────┘              │
                                 │
┌─────────────────┐              │
│  funcionarios   │◄─────────────┘
├─────────────────┤
│ id              │
│ nome            │
│ matricula       │
│ unidade_id (FK) │
│ cargo           │
│ data_admissao   │
│ ativo           │
└────────┬────────┘
         │
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────────────┐     ┌─────────────────┐
│  emprestimos    │     │     vales       │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ funcionario_id  │     │ funcionario_id  │
│ valor_total     │     │ valor           │
│ num_parcelas    │     │ comentario      │
│ valor_parcela   │     │ referencia      │
│ data_inicio     │     │ forma_desconto  │
│ motivo          │     │ num_parcelas    │
│ status          │     │ data_ocorrido   │
│ usuario_cadastro│     │ status          │
│ usuario_aprovou │     │ usuario_cadastro│
│ created_at      │     │ usuario_aprovou │
│ updated_at      │     │ created_at      │
└────────┬────────┘     │ updated_at      │
         │              └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│          parcelas                       │
├─────────────────────────────────────────┤
│ id                                      │
│ tipo (emprestimo/vale)                  │
│ emprestimo_id (FK, nullable)            │
│ vale_id (FK, nullable)                  │
│ numero                                  │
│ valor                                   │
│ data_prevista                           │
│ data_pagamento                          │
│ status                                  │
│ usuario_baixa                           │
│ comprovante_url                         │
│ observacoes                             │
│ created_at                              │
│ updated_at                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          logs_auditoria                 │
├─────────────────────────────────────────┤
│ id                                      │
│ usuario_id                              │
│ acao                                    │
│ tabela                                  │
│ registro_id                             │
│ dados_anteriores (JSON)                 │
│ dados_novos (JSON)                      │
│ ip_address                              │
│ created_at                              │
└─────────────────────────────────────────┘
```

---

## Enumerações (Enums)

### Perfil de Usuário
```
ADMIN
GESTOR
OPERADOR
```

### Status de Empréstimo
```
PENDENTE_APROVACAO
ATIVO
QUITADO
CANCELADO
REJEITADO
```

### Status de Vale
```
PENDENTE_APROVACAO
PENDENTE
QUITADO
CANCELADO
REJEITADO
```

### Status de Parcela
```
PENDENTE
PAGA
ATRASADA
```

### Forma de Desconto (Vale)
```
INTEGRAL
PARCELAS
```

---

## Armazenamento de Arquivos

### Comprovantes
- Armazenar em serviço de storage (S3, MinIO, etc.) ou sistema de arquivos
- Guardar URL/path no banco de dados
- Formatos aceitos: PDF, JPG, PNG
- Tamanho máximo sugerido: 5MB

---

## Entregáveis Esperados

| # | Entregável |
|---|------------|
| 1 | Repositório Git com código fonte |
| 2 | Documentação de instalação |
| 3 | Manual básico de uso |
| 4 | Banco de dados com scripts de criação |
| 5 | Deploy em ambiente de teste |
