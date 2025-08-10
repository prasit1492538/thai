import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount)
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":")
  return `${hours}:${minutes}`
}

export function getDayName(dayOfWeek: number): string {
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
  return days[dayOfWeek] || ""
}

export function getGradeLevel(grade: string): string {
  const gradeMap: { [key: string]: string } = {
    "ม.1": "มัธยมศึกษาปีที่ 1",
    "ม.2": "มัธยมศึกษาปีที่ 2",
    "ม.3": "มัธยมศึกษาปีที่ 3",
    "ม.4": "มัธยมศึกษาปีที่ 4",
    "ม.5": "มัธยมศึกษาปีที่ 5",
    "ม.6": "มัธยมศึกษาปีที่ 6",
  }
  return gradeMap[grade] || grade
}

export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^0[0-9]{9}$/
  return phoneRegex.test(phone)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function sortByDate(items: any[], dateField: string, ascending = false): any[] {
  return items.sort((a, b) => {
    const dateA = new Date(a[dateField]).getTime()
    const dateB = new Date(b[dateField]).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as { [key: string]: T[] },
  )
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  return addDays(weekStart, 6)
}

export function formatPhoneNumber(phone: string): string {
  // Format: 081-234-5678
  if (phone.length === 10 && phone.startsWith("0")) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
  }
  return phone
}

export function parsePhoneNumber(formattedPhone: string): string {
  // Remove all non-digit characters
  return formattedPhone.replace(/\D/g, "")
}
