"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import { GraduationCap, Search, Plus, Edit, ArrowLeft, AlertCircle, DollarSign } from "lucide-react"
import type { User, Enrollment, Course } from "@/lib/database.types"

export default function EnrollmentsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      router.push("/")
      return
    }

    setUser(session.user)
    loadData()
  }, [router])

  useEffect(() => {
    if (searchTerm) {
      const filtered = enrollments.filter(
        (enrollment) =>
          enrollment.student_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enrollment.student_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enrollment.course_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredEnrollments(filtered)
    } else {
      setFilteredEnrollments(enrollments)
    }
  }, [searchTerm, enrollments])

  const loadData = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const [enrollmentsResult, studentsResult, coursesResult] = await Promise.all([
        DatabaseService.getEnrollments(branchId),
        DatabaseService.getStudents(branchId),
        DatabaseService.getCourses(branchId),
      ])

      if (enrollmentsResult.error) {
        console.error("Error loading enrollments:", enrollmentsResult.error)
      } else {
        setEnrollments(enrollmentsResult.data)
        setFilteredEnrollments(enrollmentsResult.data)
      }

      if (studentsResult.error) {
        console.error("Error loading students:", studentsResult.error)
      } else {
        setStudents(studentsResult.data)
      }

      if (coursesResult.error) {
        console.error("Error loading courses:", coursesResult.error)
      } else {
        setCourses(coursesResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEnrollment = async (enrollmentData: Omit<Enrollment, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await DatabaseService.createEnrollment(enrollmentData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการลงทะเบียน")
      } else {
        alert("ลงทะเบียนสำเร็จ")
        setIsAddDialogOpen(false)
        loadData()
      }
    } catch (error) {
      console.error("Error adding enrollment:", error)
      alert("เกิดข้อผิดพลาดในการลงทะเบียน")
    }
  }

  const handleEditEnrollment = async (enrollmentData: Partial<Enrollment>) => {
    if (!selectedEnrollment) return

    try {
      const { data, error } = await DatabaseService.updateEnrollment(selectedEnrollment.id, enrollmentData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไขการลงทะเบียน")
      } else {
        alert("แก้ไขการลงทะเบียนสำเร็จ")
        setIsEditDialogOpen(false)
        setSelectedEnrollment(null)
        loadData()
      }
    } catch (error) {
      console.error("Error editing enrollment:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขการลงทะเบียน")
    }
  }

  const handlePaymentStatusChange = async (enrollmentId: string, newStatus: "paid" | "pending" | "refunded") => {
    try {
      const { error } = await DatabaseService.updateEnrollment(enrollmentId, {
        payment_status: newStatus,
      })
      if (error) {
        alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะการชำระเงิน")
      } else {
        alert("เปลี่ยนสถานะการชำระเงินสำเร็จ")
        loadData()
      }
    } catch (error) {
      console.error("Error changing payment status:", error)
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะการชำระเงิน")
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "refunded":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "ชำระแล้ว"
      case "pending":
        return "รอชำระ"
      case "refunded":
        return "คืนเงิน"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/admin")} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">การลงทะเบียน</h1>
                  <p className="text-sm text-gray-500">
                    จัดการการลงทะเบียนและสถานะการชำระเงิน{user.role === "admin" ? ` - ${user.branch_name}` : "ทั้งหมด"}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ค้นหาการลงทะเบียน</span>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                ลงทะเบียนใหม่
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อนักเรียนหรือชื่อคอร์ส"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการลงทะเบียน ({filteredEnrollments.length} รายการ)</CardTitle>
            <CardDescription>รายการลงทะเบียนทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEnrollments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {searchTerm ? "ไม่พบการลงทะเบียนที่ตรงกับการค้นหา" : "ยังไม่มีการลงทะเบียนในระบบ"}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>นักเรียน</TableHead>
                      <TableHead>คอร์ส</TableHead>
                      <TableHead>ราคา</TableHead>
                      <TableHead>วันที่ลงทะเบียน</TableHead>
                      <TableHead>สถานะการชำระเงิน</TableHead>
                      <TableHead>จำนวนชั่วโมงเรียน</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => {
                      const course = courses.find((c) => c.id === enrollment.course_id)
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.student_first_name} {enrollment.student_last_name}
                          </TableCell>
                          <TableCell>{enrollment.course_name}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {course ? formatCurrency(course.price) : "-"}
                          </TableCell>
                          <TableCell>{formatDate(enrollment.enrollment_date)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPaymentStatusColor(enrollment.payment_status)}>
                                {getPaymentStatusText(enrollment.payment_status)}
                              </Badge>
                              <Select
                                value={enrollment.payment_status}
                                onValueChange={(value: "paid" | "pending" | "refunded") =>
                                  handlePaymentStatusChange(enrollment.id, value)
                                }
                              >
                                <SelectTrigger className="w-8 h-8 p-0 border-none">
                                  <DollarSign className="h-4 w-4" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">รอชำระ</SelectItem>
                                  <SelectItem value="paid">ชำระแล้ว</SelectItem>
                                  <SelectItem value="refunded">คืนเงิน</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {enrollment.sessions_attended}/{course?.total_sessions || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEnrollment(enrollment)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Enrollment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ลงทะเบียนใหม่</DialogTitle>
            <DialogDescription>ลงทะเบียนนักเรียนเข้าคอร์ส</DialogDescription>
          </DialogHeader>
          <EnrollmentForm
            students={students}
            courses={courses}
            onSubmit={handleAddEnrollment}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Enrollment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขการลงทะเบียน</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลการลงทะเบียน</DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <EnrollmentForm
              enrollment={selectedEnrollment}
              students={students}
              courses={courses}
              onSubmit={handleEditEnrollment}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedEnrollment(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EnrollmentForm({
  enrollment,
  students,
  courses,
  onSubmit,
  onCancel,
}: {
  enrollment?: Enrollment
  students: User[]
  courses: Course[]
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    student_id: enrollment?.student_id || "",
    course_id: enrollment?.course_id || "",
    enrollment_date: enrollment?.enrollment_date || new Date().toISOString().split("T")[0],
    payment_status: enrollment?.payment_status || ("pending" as const),
    status: enrollment?.status || ("active" as const),
    sessions_attended: enrollment?.sessions_attended || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student_id">นักเรียน</Label>
        <Select
          value={formData.student_id}
          onValueChange={(value) => setFormData({ ...formData, student_id: value })}
          disabled={!!enrollment}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกนักเรียน" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="course_id">คอร์ส</Label>
        <Select
          value={formData.course_id}
          onValueChange={(value) => setFormData({ ...formData, course_id: value })}
          disabled={!!enrollment}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกคอร์ส" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} - {formatCurrency(course.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="enrollment_date">วันที่ลงทะเบียน</Label>
        <Input
          id="enrollment_date"
          type="date"
          value={formData.enrollment_date}
          onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="payment_status">สถานะการชำระเงิน</Label>
        <Select
          value={formData.payment_status}
          onValueChange={(value: "paid" | "pending" | "refunded") =>
            setFormData({ ...formData, payment_status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">รอชำระ</SelectItem>
            <SelectItem value="paid">ชำระแล้ว</SelectItem>
            <SelectItem value="refunded">คืนเงิน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="sessions_attended">จำนวนชั่วโมงที่เข้าเรียน</Label>
        <Input
          id="sessions_attended"
          type="number"
          min="0"
          value={formData.sessions_attended}
          onChange={(e) => setFormData({ ...formData, sessions_attended: Number.parseInt(e.target.value) || 0 })}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึก</Button>
      </DialogFooter>
    </form>
  )
}
