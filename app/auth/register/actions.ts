'use server'

import { createClient } from '@/lib/supabase/server'
import type { EnrollmentFormData } from '@/types'

interface SubmitEnrollmentInput extends EnrollmentFormData {
  academy_id: string
}

export async function submitEnrollment(data: SubmitEnrollmentInput) {
  const supabase = createClient()

  // Verifica se já existe solicitação pendente com mesmo CPF/email na academia
  const cpfClean = data.cpf.replace(/\D/g, '')

  const { data: existing } = await supabase
    .from('enrollment_requests')
    .select('id, status')
    .eq('academy_id', data.academy_id)
    .or(`cpf.eq.${cpfClean},email.eq.${data.email}`)
    .in('status', ['pending', 'active'])
    .maybeSingle()

  if (existing) {
    if (existing.status === 'pending') {
      return {
        success: false,
        error: 'Já existe uma solicitação de matrícula pendente com este CPF ou e-mail. Aguarde a aprovação da academia.',
      }
    }
    if (existing.status === 'active') {
      return {
        success: false,
        error: 'Já existe uma matrícula ativa com este CPF ou e-mail.',
      }
    }
  }

  const { error } = await supabase.from('enrollment_requests').insert({
    academy_id:             data.academy_id,
    full_name:              data.full_name.trim(),
    birth_date:             data.birth_date,
    cpf:                    cpfClean,
    phone:                  data.phone.replace(/\D/g, ''),
    email:                  data.email.toLowerCase().trim(),
    shirt_size:             data.shirt_size,
    pants_size:             data.pants_size,
    emergency_contacts:     data.emergency_contacts,
    accepted_terms:         data.accepted_terms,
    confirmed_truthfulness: data.confirmed_truthfulness,
    status:                 'pending',
  })

  if (error) {
    console.error('Enrollment error:', error)
    return {
      success: false,
      error: 'Ocorreu um erro ao enviar a solicitação. Tente novamente.',
    }
  }

  return { success: true }
}
