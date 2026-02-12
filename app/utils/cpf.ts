/**
 * Validação de CPF brasileiro (Cadastro de Pessoa Física)
 */

export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const numeros = cpf.replace(/\D/g, '')

  // Deve ter exatamente 11 dígitos
  if (numeros.length !== 11) return false

  // Rejeita CPFs com todos os dígitos iguais (ex: 000.000.000-00, 111.111.111-11)
  if (/^(\d)\1{10}$/.test(numeros)) return false

  // Cálculo do primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i)
  }
  let resto = soma % 11
  const digito1 = resto < 2 ? 0 : 11 - resto

  if (Number(numeros[9]) !== digito1) return false

  // Cálculo do segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i)
  }
  resto = soma % 11
  const digito2 = resto < 2 ? 0 : 11 - resto

  if (Number(numeros[10]) !== digito2) return false

  return true
}

export function formatarCPF(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)

  if (numeros.length <= 3) return numeros
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`
  if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
}

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}
