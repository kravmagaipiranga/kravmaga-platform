// ============================================================
// ENUMS
// ============================================================

export type Role = 'admin' | 'instructor' | 'student'

export type Belt =
  | 'white'
  | 'yellow'
  | 'orange'
  | 'green'
  | 'blue'
  | 'brown'
  | 'black'

export type EnrollmentStatus = 'pending' | 'active' | 'suspended' | 'cancelled'

export type FinancialStatus = 'paid' | 'pending' | 'overdue'

export type CheckinStatus = 'pending' | 'approved' | 'rejected'

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled'

export type EventType = 'seminar' | 'event'

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export type ShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'

export type PantsSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'

// ============================================================
// ENTITIES
// ============================================================

export interface Academy {
  id: string
  name: string
  address: string
  logo_url?: string
  phone?: string
  email?: string
  instagram?: string
  contract_text?: string
  created_at: string
}

export interface Profile {
  id: string
  academy_id: string
  role: Role
  full_name: string
  email: string
  phone?: string
  birth_date?: string
  cpf?: string
  shirt_size?: ShirtSize
  pants_size?: PantsSize
  belt: Belt
  enrollment_status: EnrollmentStatus
  avatar_url?: string
  emergency_contacts?: EmergencyContact[]
  created_at: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship?: string
}

export interface Class {
  id: string
  academy_id: string
  name: string
  instructor_id?: string
  day_of_week: number // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string  // HH:MM
  end_time: string    // HH:MM
  max_students?: number
  description?: string
  created_at: string
  // Joined
  instructor?: Profile
}

export interface Enrollment {
  id: string
  academy_id: string
  student_id: string
  status: EnrollmentStatus
  requested_at: string
  approved_at?: string
  approved_by?: string
  notes?: string
  // Joined
  student?: Profile
}

export interface Checkin {
  id: string
  academy_id: string
  student_id: string
  class_id: string
  status: CheckinStatus
  checked_in_at: string
  approved_at?: string
  approved_by?: string
  // Joined
  student?: Profile
  class?: Class
}

export interface Financial {
  id: string
  academy_id: string
  student_id: string
  month: number // 1-12
  year: number
  amount: number
  status: FinancialStatus
  due_date: string
  paid_at?: string
  notes?: string
  // Joined
  student?: Profile
}

export interface Product {
  id: string
  academy_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  available_shirt_sizes?: ShirtSize[]
  available_pants_sizes?: PantsSize[]
  category: 'uniform' | 'equipment' | 'accessory' | 'other'
  stock: number
  active: boolean
  created_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  size?: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  academy_id: string
  student_id: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  student?: Profile
}

export interface Event {
  id: string
  academy_id: string
  type: EventType
  title: string
  description?: string
  date: string
  location?: string
  max_capacity?: number
  price?: number
  image_url?: string
  created_by: string
  created_at: string
}

export interface EventRegistration {
  id: string
  academy_id: string
  event_id: string
  student_id: string
  status: RegistrationStatus
  requested_at: string
  approved_at?: string
  // Joined
  student?: Profile
  event?: Event
}

export interface Announcement {
  id: string
  academy_id: string
  author_id: string
  title: string
  content: string
  pinned: boolean
  created_at: string
  // Joined
  author?: Profile
}

export interface CurriculumTechnique {
  id: string
  name: string
  description?: string
  video_url?: string
  order: number
}

export interface Curriculum {
  id: string
  academy_id: string
  belt: Belt
  techniques: CurriculumTechnique[]
  updated_at: string
}

export interface TrainingHistory {
  id: string
  academy_id: string
  student_id: string
  type: 'class' | 'seminar' | 'event'
  ref_id: string
  ref_name: string
  date: string
  notes?: string
  registered_by?: string
}

export interface Graduation {
  id: string
  academy_id: string
  student_id: string
  from_belt: Belt
  to_belt: Belt
  promoted_at: string
  promoted_by: string
  notes?: string
  // Joined
  student?: Profile
  promoter?: Profile
}

// ============================================================
// FORM TYPES
// ============================================================

export interface EnrollmentFormData {
  full_name: string
  birth_date: string
  cpf: string
  phone: string
  email: string
  shirt_size: ShirtSize
  pants_size: PantsSize
  emergency_contacts: EmergencyContact[]
  accepted_terms: boolean
  confirmed_truthfulness: boolean
}
