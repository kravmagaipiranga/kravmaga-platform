import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Belt, FinancialStatus, EnrollmentStatus, CheckinStatus, OrderStatus } from '@/types'

// ─── Tailwind class merge ────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── CPF ────────────────────────────────────────────────────
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(digits[10])
}

// ─── Phone ──────────────────────────────────────────────────
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

// ─── Belt ────────────────────────────────────────────────────
export const BELT_LABELS: Record<Belt, string> = {
  white:  'Branca',
  yellow: 'Amarela',
  orange: 'Laranja',
  green:  'Verde',
  blue:   'Azul',
  brown:  'Marrom',
  black:  'Preta',
}

export const BELT_COLORS: Record<Belt, string> = {
  white:  'bg-white text-gray-900 border border-gray-300',
  yellow: 'bg-yellow-400 text-gray-900',
  orange: 'bg-orange-500 text-white',
  green:  'bg-green-600 text-white',
  blue:   'bg-blue-600 text-white',
  brown:  'bg-amber-800 text-white',
  black:  'bg-gray-900 text-white border border-gray-700',
}

export const BELT_ORDER: Belt[] = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']

export function getNextBelt(current: Belt): Belt | null {
  const idx = BELT_ORDER.indexOf(current)
  return idx < BELT_ORDER.length - 1 ? BELT_ORDER[idx + 1] : null
}

// ─── Status labels ───────────────────────────────────────────
export const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  paid:    'Pago',
  pending: 'Pendente',
  overdue: 'Vencido',
}

export const FINANCIAL_STATUS_COLORS: Record<FinancialStatus, string> = {
  paid:    'bg-green-900/30 text-green-400 border border-green-800',
  pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
  overdue: 'bg-red-900/30 text-red-400 border border-red-800',
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending:   'Aguardando Aprovação',
  active:    'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
}

export const CHECKIN_STATUS_LABELS: Record<CheckinStatus, string> = {
  pending:  'Aguardando',
  approved: 'Confirmado',
  rejected: 'Recusado',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:    'Aguardando',
  processing: 'Processando',
  ready:      'Pronto p/ retirada',
  delivered:  'Entregue',
  cancelled:  'Cancelado',
}

// ─── Date ────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function formatMonthYear(month: number, year: number): string {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1))
}

// ─── Currency ────────────────────────────────────────────────
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ─── Day of week ─────────────────────────────────────────────
export const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const DAYS_OF_WEEK_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
