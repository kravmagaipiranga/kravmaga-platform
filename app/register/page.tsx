'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Tipos ──────────────────────────────────────────────────
interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

interface FormData {
  full_name: string
  birth_date: string
  cpf: string
  phone: string
  email: string
  shirt_size: string
  pants_size: string
  emergency_contacts: EmergencyContact[]
  accepted_terms: boolean
  declared_truth: boolean
}

const SHIRT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
const PANTS_SIZES = ['34', '36', '38', '40', '42', '44', '46', '48', '50']

const EMPTY_EMERGENCY: EmergencyContact = { name: '', phone: '', relationship: '' }

const INITIAL_FORM: FormData = {
  full_name: '',
  birth_date: '',
  cpf: '',
  phone: '',
  email: '',
  shirt_size: '',
  pants_size: '',
  emergency_contacts: [{ ...EMPTY_EMERGENCY }],
  accepted_terms: false,
  declared_truth: false,
}

// ── Formatadores ──────────────────────────────────────────
function formatCPF(v: string) {
  return v.replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

// ── Componente ────────────────────────────────────────────
export default function RegisterPage() {
  const supabase = createClient()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  // ── Handlers de campo ──
  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => { const next = { ...e }; delete next[key]; return next })
  }

  function updateEmergency(idx: number, field: keyof EmergencyContact, value: string) {
    const updated = form.emergency_contacts.map((c, i) =>
      i === idx ? { ...c, [field]: value } : c
    )
    setField('emergency_contacts', updated)
  }

  function addEmergency() {
    if (form.emergency_contacts.length >= 3) return
    setField('emergency_contacts', [...form.emergency_contacts, { ...EMPTY_EMERGENCY }])
  }

  function removeEmergency(idx: number) {
    setField('emergency_contacts', form.emergency_contacts.filter((_, i) => i !== idx))
  }

  // ── Validação ──
  function validate() {
    const e: Partial<Record<string, string>> = {}
    if (!form.full_name.trim()) e.full_name = 'Nome obrigatório'
    if (!form.birth_date) e.birth_date = 'Data de nascimento obrigatória'
    if (form.cpf.replace(/\D/g, '').length < 11) e.cpf = 'CPF inválido'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.shirt_size) e.shirt_size = 'Selecione um tamanho'
    if (!form.pants_size) e.pants_size = 'Selecione um tamanho'
    if (!form.accepted_terms) e.accepted_terms = 'Você deve aceitar os termos'
    if (!form.declared_truth) e.declared_truth = 'Você deve confirmar a declaração'

    form.emergency_contacts.forEach((c, i) => {
      if (!c.name.trim()) e[`ec_name_${i}`] = 'Nome obrigatório'
      if (c.phone.replace(/\D/g, '').length < 10) e[`ec_phone_${i}`] = 'Telefone inválido'
    })

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')

    try {
      // Busca a academia pelo slug (ex: ?academia=ipiranga ou padrão)
      const params = new URLSearchParams(window.location.search)
      const slug = params.get('academia') || 'ipiranga'

      const { data: academy, error: acErr } = await supabase
        .from('academies')
        .select('id')
        .eq('slug', slug)
        .single()

      if (acErr || !academy) {
        setServerError('Academia não encontrada. Verifique o link de matrícula.')
        return
      }

      const { error } = await supabase.from('enrollment_requests').insert({
        academy_id: academy.id,
        full_name: form.full_name.trim(),
        birth_date: form.birth_date,
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
        email: form.email.toLowerCase().trim(),
        shirt_size: form.shirt_size,
        pants_size: form.pants_size,
        emergency_contacts: form.emergency_contacts,
        accepted_terms: form.accepted_terms,
        declared_truth: form.declared_truth,
      })

      if (error) throw error
      setStep('success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ──────────────────────────────────────────────────────
  // TELA DE SUCESSO
  // ──────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-steel-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-up">
          {/* Ícone */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-crimson/10 border border-crimson/30
                          flex items-center justify-center">
            <svg className="w-10 h-10 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-white mb-3">Solicitação Enviada!</h1>
          <p className="text-steel-200 text-sm leading-relaxed mb-2">
            Sua ficha de matrícula foi recebida com sucesso.
          </p>
          <p className="text-steel-300 text-sm leading-relaxed mb-8">
            Nossa equipe irá analisar suas informações e entrará em contato pelo e-mail{' '}
            <span className="text-white font-medium">{form.email}</span> em breve.
          </p>

          <div className="card text-left mb-6">
            <p className="text-xs text-steel-300 uppercase tracking-widest font-semibold mb-3">
              Próximos passos
            </p>
            {[
              'Aguardar a aprovação da matrícula',
              'Receber e-mail com acesso ao sistema',
              'Acessar o app e fazer check-in no primeiro treino',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <span className="w-5 h-5 rounded-full bg-crimson/20 border border-crimson/40
                                 text-crimson text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-steel-200 text-sm">{s}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setForm(INITIAL_FORM); setStep('form') }}
            className="btn-secondary"
          >
            Fazer outra matrícula
          </button>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────
  // FORMULÁRIO
  // ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-steel-900">

      {/* ── Header ── */}
      <header className="bg-steel-800 border-b border-steel-600 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-crimson rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-base text-white leading-none">Krav Magá</h1>
            <p className="text-steel-300 text-xs mt-0.5">Ficha de Matrícula</p>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-16">

        {/* Intro */}
        <div className="mb-8 animate-fade-up">
          <h2 className="font-display text-2xl text-white mb-2">Formulário de Inscrição</h2>
          <p className="text-steel-300 text-sm leading-relaxed">
            Preencha todos os campos abaixo. Após o envio, sua matrícula será analisada
            e você receberá um e-mail de confirmação.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── SEÇÃO: Dados Pessoais ── */}
          <Section title="Dados Pessoais" number={1}>

            {/* Nome completo */}
            <Field label="Nome Completo" required error={errors.full_name}>
              <input
                type="text"
                className="field-input"
                placeholder="Digite seu nome completo"
                value={form.full_name}
                onChange={e => setField('full_name', e.target.value)}
                autoComplete="name"
              />
            </Field>

            {/* Data de nascimento */}
            <Field label="Data de Nascimento" required error={errors.birth_date}>
              <input
                type="date"
                className="field-input"
                value={form.birth_date}
                onChange={e => setField('birth_date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </Field>

            {/* CPF */}
            <Field label="CPF" required error={errors.cpf}>
              <input
                type="text"
                className="field-input"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={e => setField('cpf', formatCPF(e.target.value))}
                inputMode="numeric"
              />
            </Field>

            {/* Telefone */}
            <Field label="Telefone / WhatsApp" required error={errors.phone}>
              <input
                type="tel"
                className="field-input"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={e => setField('phone', formatPhone(e.target.value))}
                inputMode="tel"
              />
            </Field>

            {/* Email */}
            <Field label="E-mail" required error={errors.email}>
              <input
                type="email"
                className="field-input"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                inputMode="email"
                autoComplete="email"
              />
            </Field>

          </Section>

          {/* ── SEÇÃO: Tamanhos ── */}
          <Section title="Uniformes" number={2}>
            <div className="grid grid-cols-2 gap-4">

              <Field label="Tamanho da Camiseta" required error={errors.shirt_size}>
                <select
                  className="field-select"
                  value={form.shirt_size}
                  onChange={e => setField('shirt_size', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {SHIRT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Tamanho da Calça" required error={errors.pants_size}>
                <select
                  className="field-select"
                  value={form.pants_size}
                  onChange={e => setField('pants_size', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {PANTS_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

            </div>
          </Section>

          {/* ── SEÇÃO: Contatos de Emergência ── */}
          <Section title="Contatos de Emergência" number={3}>
            <p className="text-steel-300 text-xs mb-4 -mt-1">
              Informe ao menos um contato para situações de emergência.
            </p>

            {form.emergency_contacts.map((contact, idx) => (
              <div key={idx}
                   className="bg-steel-700/50 border border-steel-600 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-steel-300 uppercase tracking-wider font-semibold">
                    Contato {idx + 1}
                  </span>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeEmergency(idx)}
                      className="text-steel-400 hover:text-crimson transition-colors text-xs"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <Field label="Nome" required error={errors[`ec_name_${idx}`]}>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Nome do contato"
                    value={contact.name}
                    onChange={e => updateEmergency(idx, 'name', e.target.value)}
                  />
                </Field>

                <Field label="Telefone" required error={errors[`ec_phone_${idx}`]}>
                  <input
                    type="tel"
                    className="field-input"
                    placeholder="(11) 99999-9999"
                    value={contact.phone}
                    onChange={e => updateEmergency(idx, 'phone', formatPhone(e.target.value))}
                    inputMode="tel"
                  />
                </Field>

                <Field label="Parentesco / Relação">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Ex: Mãe, Pai, Cônjuge..."
                    value={contact.relationship}
                    onChange={e => updateEmergency(idx, 'relationship', e.target.value)}
                  />
                </Field>

              </div>
            ))}

            {form.emergency_contacts.length < 3 && (
              <button
                type="button"
                onClick={addEmergency}
                className="w-full py-2.5 border border-dashed border-steel-500 hover:border-crimson/50
                           text-steel-300 hover:text-crimson text-xs font-semibold uppercase tracking-wider
                           rounded transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar contato
              </button>
            )}
          </Section>

          {/* ── SEÇÃO: Termos ── */}
          <Section title="Termos e Declarações" number={4}>

            {/* Termos de contrato */}
            <div className={`bg-steel-700/50 border rounded-lg p-4 mb-3 transition-colors
                             ${errors.accepted_terms ? 'border-crimson/60' : 'border-steel-600'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.accepted_terms}
                    onChange={e => setField('accepted_terms', e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                   ${form.accepted_terms
                                     ? 'bg-crimson border-crimson'
                                     : 'bg-steel-800 border-steel-500 hover:border-steel-300'}`}>
                    {form.accepted_terms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-1">
                    Li e aceito os termos e condições do contrato.
                  </p>
                  <p className="text-steel-300 text-xs leading-relaxed">
                    Atenção: Marcar esta opção representa sua <span className="text-white">assinatura eletrônica</span> e
                    possui a mesma validade jurídica de uma assinatura em um documento impresso. Assim, você estará
                    concordando com todos os termos, itens e cláusulas deste contrato.
                  </p>
                </div>
              </label>
              {errors.accepted_terms && (
                <p className="text-crimson text-xs mt-2 ml-8">{errors.accepted_terms}</p>
              )}
            </div>

            {/* Declaração de verdade */}
            <div className={`bg-steel-700/50 border rounded-lg p-4 transition-colors
                             ${errors.declared_truth ? 'border-crimson/60' : 'border-steel-600'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.declared_truth}
                    onChange={e => setField('declared_truth', e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                   ${form.declared_truth
                                     ? 'bg-crimson border-crimson'
                                     : 'bg-steel-800 border-steel-500 hover:border-steel-300'}`}>
                    {form.declared_truth && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-white text-sm font-medium">
                  Declaro que todas as informações fornecidas neste formulário são verdadeiras e precisas.
                </p>
              </label>
              {errors.declared_truth && (
                <p className="text-crimson text-xs mt-2 ml-8">{errors.declared_truth}</p>
              )}
            </div>

          </Section>

          {/* ── Erro do servidor ── */}
          {serverError && (
            <div className="mb-4 p-3 bg-crimson/10 border border-crimson/40 rounded text-crimson text-sm">
              {serverError}
            </div>
          )}

          {/* ── Botão submit ── */}
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </span>
            ) : 'Enviar Ficha de Matrícula'}
          </button>

          <p className="text-center text-steel-400 text-xs mt-4">
            Já é aluno?{' '}
            <a href="/login" className="text-crimson hover:text-crimson-light underline transition-colors">
              Faça login
            </a>
          </p>

        </form>
      </main>
    </div>
  )
}

// ── Componentes auxiliares ─────────────────────────────────
function Section({
  title, number, children
}: {
  title: string; number: number; children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 rounded-full bg-crimson text-white text-xs font-bold
                         flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h3 className="font-display text-sm tracking-widest text-steel-100">{title}</h3>
        <div className="flex-1 h-px bg-steel-600" />
      </div>
      {children}
    </section>
  )
}

function Field({
  label, required, error, children
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <label className="field-label">
        {label}
        {required && <span className="text-crimson ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-crimson text-xs mt-1">{error}</p>}
    </div>
  )
}
