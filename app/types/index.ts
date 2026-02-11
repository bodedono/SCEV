export type PerfilUsuario = 'ADMIN' | 'GESTOR' | 'OPERADOR'

export type StatusEmprestimo = 'PENDENTE_APROVACAO' | 'ATIVO' | 'QUITADO' | 'CANCELADO' | 'REJEITADO'

export type StatusVale = 'PENDENTE_APROVACAO' | 'PENDENTE' | 'QUITADO' | 'CANCELADO' | 'REJEITADO'

export type StatusParcela = 'PENDENTE' | 'PAGA' | 'ATRASADA'

export type FormaDesconto = 'INTEGRAL' | 'PARCELAS'

export interface Unidade {
  id: number
  nome: string
  ativo: boolean
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  unidade_id: number | null
  unidade?: Unidade
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface UsuarioFormData {
  nome: string
  email: string
  senha: string
  perfil: PerfilUsuario
  unidade_id: number | null
  auto_confirmar: boolean
}

export interface UsuarioUpdateData {
  nome?: string
  perfil?: PerfilUsuario
  unidade_id?: number | null
  ativo?: boolean
}

export interface Funcionario {
  id: number
  nome: string
  matricula: string
  unidade_id: number
  unidade?: Unidade
  cargo: string
  data_admissao: string
  ativo: boolean
  saldo_devedor?: number
}

export interface Emprestimo {
  id: number
  funcionario_id: number
  funcionario?: Funcionario
  data_solicitacao: string
  valor_total: number
  motivo: string
  num_parcelas: number
  valor_parcela: number
  data_inicio_desconto: string
  status: StatusEmprestimo
  usuario_cadastro_id: string
  usuario_cadastro?: Usuario
  usuario_aprovacao_id: string | null
  usuario_aprovacao?: Usuario
  parcelas?: Parcela[]
  created_at: string
  updated_at: string
}

export interface Vale {
  id: number
  funcionario_id: number
  funcionario?: Funcionario
  data_ocorrido: string
  valor: number
  comentario: string
  referencia: string | null
  forma_desconto: FormaDesconto
  num_parcelas: number
  status: StatusVale
  usuario_cadastro_id: string
  usuario_cadastro?: Usuario
  usuario_aprovacao_id: string | null
  usuario_aprovacao?: Usuario
  parcelas?: Parcela[]
  created_at: string
  updated_at: string
}

export interface Parcela {
  id: number
  tipo: 'EMPRESTIMO' | 'VALE'
  emprestimo_id: number | null
  vale_id: number | null
  numero: number
  total_parcelas: number
  valor: number
  data_prevista: string
  data_pagamento: string | null
  status: StatusParcela
  usuario_baixa_id: string | null
  usuario_baixa?: Usuario
  comprovante_url: string | null
  observacoes: string | null
  funcionario?: Funcionario
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  pendencias_aprovacao: number
  emprestimos_ativos: number
  vales_pendentes: number
  valor_total_receber: number
  parcelas_atrasadas: number
}

export interface Aprovacao {
  id: number
  tipo: 'EMPRESTIMO' | 'VALE'
  funcionario: Funcionario
  valor: number
  data: string
  solicitante: Usuario
}
