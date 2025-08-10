"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { formatTime, getDayName } from "@/lib/utils"
import { GraduationCap, BookOpen, Users, Calendar, LogOut, Clock } from "lucide-react"
import type { User, Schedule, Course } from "@/lib/database.types"

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = getSession()
    if (!session || session.user.role !== "teacher") {
      router.push("/")
      return
    }

    setUser(session.user)
    loadTeacherData(session.user.id)
  }, [router])

  const loadTeacherData = async (teacherId: string) => {
    try {
      const [schedulesResult, coursesResult] = await Promise.all([
        DatabaseService.getSchedules(undefined, teacherId),
        DatabaseService.getCourses(),
      ])

      if (coursesResult.data) {
        const teacherCourses = coursesResult.data.filter((course) => course.teacher_id === teacherId)
        setCourses(teacherCourses)
      }

      if (schedulesResult.data) {
        setSchedules(schedulesResult.data)
      }
    } catch (error) {
      console.error("Error loading teacher data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = async (enrollmentId: string, checked: boolean) => {
    if (!user) return

    const today = new Date().toISOString().split("T")[0]

    try {
      await DatabaseService.updateAttendance(enrollmentId, today, checked, user.id)

      // Update sessions attended count
      if (checked) {
        const enrollment = schedules.flatMap((s) => s.enrollments || []).find((e) => e.id === enrollmentId)

        if (enrollment) {
          await DatabaseService.updateEnrollmentSessions(enrollmentId, enrollment.sessions_attended + 1)
        }
      }

      // Reload data to reflect changes
      loadTeacherData(user.id)
    } catch (error) {
      console.error("Error updating attendance:", error)
      alert("เกิดข้อผิดพลาดในการบันทึกการเข้าเรียน")
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getTotalStudents = () => {
    return schedules.reduce((total, schedule) => total + (schedule.enrollments?.length || 0), 0)
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
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">สวัสดี {user.nickname || user.first_name}</h1>
                  <p className="text-sm text-gray-500">ครูผู้สอน - {user.branch_name}</p>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คอร์สที่สอน</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">คอร์สทั้งหมด</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">นักเรียนทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalStudents()}</div>
              <p className="text-xs text-muted-foreground">นักเรียนที่กำลังเรียน</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ตารางสอน</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">ช่วงเวลาสอน</p>
            </CardContent>
          </Card>
        </div>

        {/* Teaching Schedule with Attendance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              ตารางสอนและเช็คชื่อ
            </CardTitle>
            <CardDescription>ตารางเรียนและการเช็คชื่อนักเรียนในแต่ละคอร์ส</CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีตารางสอน</p>
              </div>
            ) : (
              <div className="space-y-6">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{schedule.course_name}</h3>
                        <p className="text-gray-600">{schedule.grade_level}</p>
                        <p className="text-sm text-gray-500">{schedule.branch_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {getDayName(schedule.day_of_week)}
                        </Badge>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </p>
                      </div>
                    </div>

                    {/* Students attendance list */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        เช็คชื่อนักเรียน ({schedule.enrollments?.length || 0}/{schedule.max_students})
                      </h4>
                      {schedule.enrollments && schedule.enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {schedule.enrollments.map((enrollment) => (
                            <div
                              key={enrollment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                            >
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={`attendance-${enrollment.id}`}
                                  onCheckedChange={(checked) =>
                                    handleAttendanceChange(enrollment.id, checked as boolean)
                                  }
                                />
                                <div>
                                  <p className="font-medium">
                                    {enrollment.student_first_name} {enrollment.student_last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">เข้าเรียน: {enrollment.sessions_attended} ชั่วโมง</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={enrollment.payment_status === "paid" ? "default" : "secondary"}>
                                  {enrollment.payment_status === "paid" ? "ชำระแล้ว" : "รอชำระ"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">ยังไม่มีนักเรียนลงทะเบียน</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              คอร์สที่รับผิดชอบ
            </CardTitle>
            <CardDescription>รายละเอียดคอร์สเรียนที่คุณสอน</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีคอร์สที่รับผิดชอบ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-3">{course.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">ระดับชั้น:</span>
                        <span className="font-medium">{course.grade_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">จำนวนชั่วโมง:</span>
                        <span className="font-medium">{course.total_sessions} ชั่วโมง</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ค่าเรียน:</span>
                        <span className="font-medium">฿{course.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">สาขา:</span>
                        <span className="font-medium">{course.branch_name}</span>
                      </div>
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
