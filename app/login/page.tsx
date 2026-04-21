'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authErr || !data.user) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    // Busca role do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role || 'student'
    if (role === 'admin') router.replace('/admin/dashboard')
    else if (role === 'instructor') router.replace('/instructor/dashboard')
    else router.replace('/student/dashboard')
  }

  return (
    <div className="min-h-screen bg-steel-900 flex flex-col">

      {/* Fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-crimson/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-crimson/3 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">

        {/* Logo */}
        <div className="mb-10 text-center animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 bg-crimson rounded-xl flex items-center justify-center
                          shadow-lg shadow-crimson/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0
                       3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946
                       3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138
                       3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806
                       3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438
                       3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-white">Krav Magá</h1>
          <p className="text-steel-300 text-sm mt-1">Plataforma de Gestão</p>
        </div>

        {/* Card de login */}
        <div className="w-full max-w-sm animate-fade-up anim-delay-1">
          <div className="card">
            <h2 className="font-display text-xl text-white mb-6">Entrar na Plataforma</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label className="field-label">E-mail</label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="field-label">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="field-input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400
                               hover:text-steel-200 transition-colors"
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                                 a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878
                                 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3
                                 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543
                                 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542
                                 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-crimson/10 border border-crimson/40 rounded
                                text-crimson text-sm text-center">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="text-center text-steel-400 text-xs mt-4">
            Ainda não é aluno?{' '}
            <a href="/register" className="text-crimson hover:text-crimson-light underline transition-colors">
              Faça sua matrícula
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
