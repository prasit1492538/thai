export interface User {
  id: string
  phone: string
  first_name: string
  last_name: string
  email?: string
  role: "student" | "teacher" | "admin" | "superadmin"
  branch_id: string
  guardian_name?: string
  guardian_surname?: string
  guardian_occupation?: string
  guardian_line_id?: string
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  manager_name: string
  commission_rate: number
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  description: string
  grade_level: string
  total_sessions: number
  price: number
  branch_id: string
  teacher_id: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrollment_date: string
  payment_status: "pending" | "paid" | "refunded"
  sessions_attended: number
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  course_id: string
  class_date: string
  status: "present" | "absent" | "late"
  check_in_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  enrollment_id: string
  amount: number
  payment_date: string
  payment_method: "cash" | "transfer" | "card"
  status: "pending" | "completed" | "failed" | "refunded"
  created_at: string
  updated_at: string
}

export interface Revenue {
  id: string
  branch_id: string
  course_id: string
  student_id: string
  amount: number
  commission: number
  date: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  course_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface DatabaseResult<T> {
  data: T | null
  error: string | null
}

export interface DatabaseInitResult {
  success: boolean
  mode: "json" | "mysql" | "supabase"
  message: string
}
