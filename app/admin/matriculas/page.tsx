'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface EnrollmentRequest {
  id: string
  full_name: string
  birth_date: string
  cpf: string
  phone: string
  email: string
  shirt_size: string
  pants_size: string
  emergency_contacts: Array<{ name: string; phone: string; relationship: string }>
  accepted_terms: boolean
  declared_truth: boolean
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  rejection_reason?: string
}

const STATUS_LABELS = {
  pending:  { label: 'Pendente',  class: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Aprovado',  class: 'bg-green-500/15 text-green-400 border-green-500/30' },
  rejected: { label: 'Rejeitado', class: 'bg-crimson/15 text-crimson border-crimson/30' },
}

export default function MatriculasPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<EnrollmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selected, setSelected] = useState<EnrollmentRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const query = supabase
      .from('enrollment_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (filter !== 'all') query.eq('status', filter)
    const { data } = await query
    setRequests(data || [])
    setLoading(false)
  }, [filter, supabase])

  useEffect(() => { load() }, [load])

  async function approve(req: EnrollmentRequest) {
    setActionLoading(true)
    await supabase
      .from('enrollment_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', req.id)

    // TODO Flow 2: criar auth.user + profile para o aluno aprovado
    setSelected(null)
    await load()
    setActionLoading(false)
  }

  async function reject() {
    if (!selected) return
    setActionLoading(true)
    await supabase
      .from('enrollment_requests')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selected.id)
    setShowRejectModal(false)
    setRejectionReason('')
    setSelected(null)
    await load()
    setActionLoading(false)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function formatCPF(cpf: string) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  function calcAge(birth: string) {
    const today = new Date()
    const b = new Date(birth)
    let age = today.getFullYear() - b.getFullYear()
    if (today < new Date(today.getFullYear(), b.getMonth(), b.getDate())) age--
    return age
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-steel-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-white">Matrículas</h1>
            <p className="text-steel-300 text-sm mt-0.5">
              Aprovação de fichas de inscrição
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-crimson/20 border border-crimson/40
                             text-crimson text-sm font-semibold rounded-full">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(['all','pending','approved','rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider
                          whitespace-nowrap transition-all border
                          ${filter === f
                            ? 'bg-crimson border-crimson text-white'
                            : 'bg-steel-800 border-steel-600 text-steel-300 hover:border-steel-400'}`}
            >
              {f === 'all' ? 'Todos' : STATUS_LABELS[f].label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-steel-400">Carregando...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-steel-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-steel-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-steel-400 text-sm">Nenhuma matrícula encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div
                key={req.id}
                className="card hover:border-steel-500 cursor-pointer transition-all"
                onClick={() => setSelected(req)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white truncate">{req.full_name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded border
                                        ${STATUS_LABELS[req.status].class}`}>
                        {STATUS_LABELS[req.status].label}
                      </span>
                    </div>
                    <p className="text-steel-300 text-sm">{req.email}</p>
                    <p className="text-steel-400 text-xs mt-1">{formatDate(req.submitted_at)}</p>
                  </div>
                  <svg className="w-5 h-5 text-steel-500 flex-shrink-0 mt-1" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Detalhes da Matrícula ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="w-full md:max-w-xl bg-steel-800 border border-steel-600
                          rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">

            <div className="sticky top-0 bg-steel-800 border-b border-steel-600 px-5 py-4
                            flex items-center justify-between rounded-t-2xl">
              <h2 className="font-display text-lg text-white">Ficha de Matrícula</h2>
              <button onClick={() => setSelected(null)}
                      className="text-steel-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Status badge */}
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded border
                                ${STATUS_LABELS[selected.status].class}`}>
                {STATUS_LABELS[selected.status].label}
              </span>

              {/* Dados */}
              <DetailRow label="Nome Completo" value={selected.full_name} />
              <DetailRow label="Data de Nascimento"
                value={`${new Date(selected.birth_date).toLocaleDateString('pt-BR')} (${calcAge(selected.birth_date)} anos)`} />
              <DetailRow label="CPF" value={formatCPF(selected.cpf)} />
              <DetailRow label="Telefone / WhatsApp" value={selected.phone} />
              <DetailRow label="E-mail" value={selected.email} />
              <DetailRow label="Tamanho da Camiseta" value={selected.shirt_size} />
              <DetailRow label="Tamanho da Calça" value={selected.pants_size} />

              {/* Contatos de emergência */}
              <div>
                <p className="text-xs text-steel-400 uppercase tracking-wider font-semibold mb-2">
                  Contatos de Emergência
                </p>
                {selected.emergency_contacts.map((c, i) => (
                  <div key={i} className="bg-steel-700/50 rounded p-3 mb-2">
                    <p className="text-white text-sm font-medium">{c.name}</p>
                    <p className="text-steel-300 text-xs">{c.phone}{c.relationship ? ` — ${c.relationship}` : ''}</p>
                  </div>
                ))}
              </div>

              {/* Termos */}
              <div className="space-y-2">
                <CheckRow checked={selected.accepted_terms} label="Aceitou os termos e condições" />
                <CheckRow checked={selected.declared_truth} label="Declarou informações verdadeiras" />
              </div>

              <p className="text-steel-400 text-xs">
                Enviado em {formatDate(selected.submitted_at)}
              </p>

              {/* Rejeição */}
              {selected.rejection_reason && (
                <div className="p-3 bg-crimson/10 border border-crimson/30 rounded">
                  <p className="text-xs text-crimson font-semibold mb-1">Motivo da rejeição:</p>
                  <p className="text-steel-200 text-sm">{selected.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Ações */}
            {selected.status === 'pending' && (
              <div className="sticky bottom-0 bg-steel-800 border-t border-steel-600 p-5 flex gap-3">
                <button
                  onClick={() => { setShowRejectModal(true) }}
                  disabled={actionLoading}
                  className="flex-1 py-3 border border-steel-500 hover:border-crimson text-steel-300
                             hover:text-crimson font-display text-sm uppercase tracking-wider
                             rounded transition-all"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => approve(selected)}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-crimson hover:bg-crimson-light text-white
                             font-display text-sm uppercase tracking-wider rounded transition-all"
                >
                  {actionLoading ? 'Aprovando...' : 'Aprovar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Motivo de Rejeição ── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-steel-800 border border-steel-600 rounded-xl p-5">
            <h3 className="font-display text-lg text-white mb-4">Rejeitar Matrícula</h3>
            <p className="text-steel-300 text-sm mb-4">
              Informe o motivo da rejeição (opcional, será registrado internamente):
            </p>
            <textarea
              className="field-input resize-none h-24 mb-4"
              placeholder="Ex: Documentação incompleta, menor de idade sem responsável..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn-secondary py-2"
              >
                Cancelar
              </button>
              <button
                onClick={reject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-crimson hover:bg-crimson-light text-white
                           font-display text-sm uppercase tracking-wider rounded transition-all"
              >
                {actionLoading ? '...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-steel-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  )
}

function CheckRow({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                       ${checked ? 'bg-crimson border-crimson' : 'bg-steel-700 border-steel-500'}`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-steel-200 text-sm">{label}</span>
    </div>
  )
}
