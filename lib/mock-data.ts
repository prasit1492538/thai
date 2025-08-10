import type { Database } from "@/lib/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]
type Branch = Database["public"]["Tables"]["branches"]["Row"]
type Course = Database["public"]["Tables"]["courses"]["Row"]
type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"]
type Attendance = Database["public"]["Tables"]["attendance"]["Row"]

export const mockData = {
  users: [
    {
      id: "1",
      phone: "0812345678",
      name: "ผู้ดูแลระบบ",
      role: "admin" as const,
      branch_id: "1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      phone: "0823456789",
      name: "นักเรียนทดสอบ",
      role: "student" as const,
      branch_id: "1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      phone: "0834567890",
      name: "ครูทดสอบ",
      role: "teacher" as const,
      branch_id: "1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "4",
      phone: "0845678901",
      name: "ผู้ดูแลระบบสูงสุด",
      role: "superadmin" as const,
      branch_id: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ] as User[],

  branches: [
    {
      id: "1",
      name: "สาขาหลัก",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
      phone: "02-123-4567",
      commission_rate: 0.15,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "สาขาเชียงใหม่",
      address: "456 ถนนนิมมานเหมินท์ เชียงใหม่ 50200",
      phone: "053-123-456",
      commission_rate: 0.12,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ] as Branch[],

  courses: [
    {
      id: "1",
      name: "ภาษาไทยพื้นฐาน",
      description: "เรียนรู้การอ่าน เขียน และพูดภาษาไทยเบื้องต้น",
      price: 3000,
      duration_hours: 20,
      branch_id: "1",
      teacher_id: "3",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "ภาษาไทยระดับกลาง",
      description: "พัฒนาทักษะการใช้ภาษาไทยในระดับกลาง",
      price: 4000,
      duration_hours: 30,
      branch_id: "1",
      teacher_id: "3",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ] as Course[],

  enrollments: [
    {
      id: "1",
      student_id: "2",
      course_id: "1",
      enrollment_date: "2024-01-15",
      status: "active" as const,
      payment_status: "paid" as const,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z",
    },
  ] as Enrollment[],

  attendance: [
    {
      id: "1",
      student_id: "2",
      course_id: "1",
      date: "2024-01-20",
      status: "present" as const,
      notes: null,
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2024-01-20T00:00:00Z",
    },
  ] as Attendance[],
}
