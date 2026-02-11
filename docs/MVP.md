# MVP - Versão Inicial

## Escopo da Primeira Entrega

O MVP deve focar nas funcionalidades essenciais para o sistema funcionar.

---

## Funcionalidades do MVP

### 1. Autenticação
- [x] Login com Admin, Gestor de Unidade e Operador
- [x] Controle de permissões por perfil
- [x] Sessões com expiração

### 2. Módulo de Funcionários
- [x] CRUD de funcionários
- [x] Filtro por unidade
- [x] Visualização de ficha com saldo devedor

### 3. Módulo de Empréstimos
- [x] Cadastro de empréstimo com parcelas
- [x] Geração automática de parcelas
- [x] Visualização de histórico

### 4. Módulo de Vales
- [x] Cadastro de vale (com comentário obrigatório)
- [x] Definição de forma de desconto
- [x] Visualização de histórico

### 5. Fluxo de Aprovação
- [x] Gestor lança → Admin aprova/rejeita
- [x] Listagem de pendências de aprovação
- [x] Notificação visual de pendências

### 6. Baixa de Parcelas
- [x] Baixa manual de parcelas
- [x] Anexo obrigatório de comprovante
- [x] Registro de auditoria

### 7. Ficha do Funcionário
- [x] Visualização consolidada
- [x] Empréstimos + vales + saldo devedor

---

## Deixar para Fase 2

| Funcionalidade | Descrição |
|----------------|-----------|
| Relatórios avançados | Gráficos, análises detalhadas |
| Exportação Excel/PDF | Download de relatórios |
| Notificações automáticas | Alertas de pendências por email |
| Integração folha de pagamento | Baixa automática (futuro) |
| Dashboard gráficos | Visualizações mais elaboradas |

---

## Checklist de Desenvolvimento

### Fase 1: Setup e Autenticação
```
[ ] Criar repositório Git
[ ] Setup do projeto (frontend + backend)
[ ] Configurar banco de dados
[ ] Implementar autenticação JWT
[ ] Criar tabela de usuários
[ ] Implementar login
[ ] Implementar controle de perfis
```

### Fase 2: Funcionários
```
[ ] Criar tabela de unidades
[ ] Criar tabela de funcionários
[ ] CRUD de funcionários (Admin)
[ ] Listagem com filtros
[ ] Ficha do funcionário
```

### Fase 3: Empréstimos
```
[ ] Criar tabela de empréstimos
[ ] Criar tabela de parcelas
[ ] Formulário de cadastro
[ ] Geração automática de parcelas
[ ] Fluxo de aprovação (Gestor → Admin)
[ ] Listagem de empréstimos
```

### Fase 4: Vales
```
[ ] Criar tabela de vales
[ ] Formulário de cadastro (comentário obrigatório)
[ ] Fluxo de aprovação
[ ] Listagem de vales
```

### Fase 5: Baixa de Parcelas
```
[ ] Listagem de parcelas pendentes
[ ] Modal de baixa com upload
[ ] Registro de comprovante
[ ] Atualização de status
[ ] Cálculo de saldo devedor
```

### Fase 6: Dashboard e Pendências
```
[ ] Dashboard com métricas básicas
[ ] Listagem de pendências de aprovação
[ ] Destaque visual para atrasadas
```

### Fase 7: Testes e Ajustes
```
[ ] Testes de integração
[ ] Testes de permissões
[ ] Ajustes de UX
[ ] Correção de bugs
```

---

## Critérios de Aceite do MVP

### Obrigatórios

1. **Login funcional** com os 3 perfis
2. **CRUD de funcionários** operando corretamente
3. **Cadastro de empréstimo** gerando parcelas
4. **Cadastro de vale** com comentário obrigatório
5. **Fluxo de aprovação** completo
6. **Baixa de parcela** com comprovante anexado
7. **Ficha do funcionário** mostrando saldo
8. **Auditoria** registrando todas as operações

### Desejáveis (se houver tempo)

- Dashboard com totalizadores básicos
- Filtros nas listagens
- Ordenação de colunas
