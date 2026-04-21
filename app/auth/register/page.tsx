import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import EnrollmentForm from './EnrollmentForm'

interface Props {
  searchParams: { academia?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: 'Ficha de Matrícula',
    description: 'Preencha sua ficha de matrícula para ingressar na academia.',
  }
}

export default async function RegisterPage({ searchParams }: Props) {
  const supabase = createClient()

  // Pega o ID da academia via query string ou usa a de demonstração
  const academyId = searchParams.academia ?? '00000000-0000-0000-0000-000000000001'

  const { data: academy, error } = await supabase
    .from('academies')
    .select('id, name, logo_url, contract_text')
    .eq('id', academyId)
    .single()

  if (error || !academy) notFound()

  return <EnrollmentForm academy={academy} />
}
