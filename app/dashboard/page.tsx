"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatDate, getDayName, formatTime } from "@/lib/utils"
import { User, BookOpen, Calendar, Clock, LogOut, AlertCircle } from "lucide-react"
import type { User as UserType, Schedule, Enrollment } from "@/lib/database.types"

export default function StudentDashboard() {
  const [user, setUser] = useState<UserType | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || session.user.role !== "student") {
      router.push("/")
      return
    }

    setUser(session.user)
    loadStudentData(session.user.id)
  }, [router])

  const loadStudentData = async (studentId: string) => {
    try {
      const [schedulesResult, enrollmentsResult] = await Promise.all([
        DatabaseService.getSchedules(),
        DatabaseService.getEnrollments(),
      ])

      if (schedulesResult.data) {
        // Filter schedules for student's enrollments
        const studentEnrollments =
          enrollmentsResult.data?.filter(
            (enrollment) => enrollment.student_id === studentId && enrollment.status === "active",
          ) || []

        const studentSchedules = schedulesResult.data.filter((schedule) =>
          studentEnrollments.some((enrollment) => enrollment.schedule_id === schedule.id),
        )

        setSchedules(studentSchedules)
        setEnrollments(studentEnrollments)
      }
    } catch (error) {
      console.error("Error loading student data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
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
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">สวัสดี {user.nickname || user.first_name}</h1>
                  <p className="text-sm text-gray-500">นักเรียน - {user.branch_name}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                <p className="font-medium">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ชื่อเล่น</p>
                <p className="font-medium">{user.nickname || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">หมายเลขโทรศัพท์</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ระดับชั้น</p>
                <p className="font-medium">{user.current_grade || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">สาขา</p>
                <p className="font-medium">{user.branch_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">อีเมล</p>
                <p className="font-medium">{user.email || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คอร์สที่ลงทะเบียน</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground">คอร์สที่กำลังเรียน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ชั่วโมงเรียนรวม</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {enrollments.reduce((total, enrollment) => total + enrollment.sessions_attended, 0)}
              </div>
              <p className="text-xs text-muted-foreground">ชั่วโมงที่เข้าเรียนแล้ว</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สถานะการชำระเงิน</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {enrollments.filter((e) => e.payment_status === "paid").length}
              </div>
              <p className="text-xs text-muted-foreground">จาก {enrollments.length} คอร์ส</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Schedules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              ตารางเรียนของฉัน
            </CardTitle>
            <CardDescription>ตารางเรียนสำหรับคอร์สที่ลงทะเบียนไว้</CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>ยังไม่มีตารางเรียน กรุณาติดต่อเจ้าหน้าที่เพื่อลงทะเบียนเรียน</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{schedule.course_name}</h3>
                      <p className="text-sm text-gray-500">{schedule.grade_level}</p>
                      <p className="text-sm text-gray-500">{schedule.branch_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{getDayName(schedule.day_of_week)}</Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enrollment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              รายละเอียดการลงทะเบียน
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>ยังไม่มีการลงทะเบียนเรียน</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{enrollment.course_name}</h3>
                      <p className="text-sm text-gray-500">ลงทะเบียนเมื่อ: {formatDate(enrollment.enrollment_date)}</p>
                      <p className="text-sm text-gray-500">เข้าเรียนแล้ว: {enrollment.sessions_attended} ชั่วโมง</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                        {enrollment.status === "active"
                          ? "กำลังเรียน"
                          : enrollment.status === "completed"
                            ? "จบแล้ว"
                            : "ยกเลิก"}
                      </Badge>
                      <br />
                      <Badge variant={enrollment.payment_status === "paid" ? "default" : "destructive"}>
                        {enrollment.payment_status === "paid"
                          ? "ชำระแล้ว"
                          : enrollment.payment_status === "pending"
                            ? "รอชำระ"
                            : "คืนเงิน"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
