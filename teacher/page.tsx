"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"

interface Schedule {
  id: string
  course_id: string
  day_of_week: number
  start_time: string
  end_time: string
  courses: {
    name: string
    grade_level: string
  }
  enrollments: {
    id: string
    student_id: string
    sessions_attended: number
    users: {
      first_name: string
      last_name: string
      nickname: string
    }
  }[]
}

export default function TeacherPage() {
  const [user, setUser] = useState<any>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({})
  const [connectionMode, setConnectionMode] = useState<string>("checking")
  const router = useRouter()
  const { toast } = useToast()

  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]

  useEffect(() => {
    async function checkAuth() {
      const session = getSession()

      if (!session) {
        router.push("/")
        return
      }

      if (session.role !== "teacher") {
        router.push(session.role === "student" ? "/dashboard" : "/admin")
        return
      }

      setUser(session)

      // Initialize database service
      await DatabaseService.initialize()
      setConnectionMode(DatabaseService.getConnectionMode())

      await fetchSchedules()
      setLoading(false)
    }

    checkAuth()
  }, [router])

  async function fetchSchedules() {
    try {
      console.log("🔍 Fetching teacher schedules...")
      const { data, error } = await DatabaseService.getSchedules()

      if (error) {
        console.error("Error fetching schedules:", error)
        return
      }

      console.log("📅 Teacher schedules fetched:", data?.length || 0)
      setSchedules(data || [])
    } catch (error) {
      console.error("Exception fetching schedules:", error)
    }
  }

  async function handleAttendance() {
    if (!selectedSchedule || !user) return

    try {
      const today = new Date().toISOString().split("T")[0]

      for (const enrollment of selectedSchedule.enrollments) {
        const isPresent = attendance[enrollment.id] || false

        // Update attendance
        await DatabaseService.updateAttendance(enrollment.id, today, isPresent, user.id)

        // Update session count if present
        if (isPresent) {
          await DatabaseService.updateEnrollmentSessions(enrollment.id, enrollment.sessions_attended + 1)
        }
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "บันทึกการเข้าเรียนแล้ว (โหมดจำลอง)" : "บันทึกการเข้าเรียนแล้ว",
      })

      setSelectedSchedule(null)
      setAttendance({})
      await fetchSchedules()
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการเข้าเรียนได้",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">แดชบอร์ดครูผู้สอน</h1>
          <Badge variant={connectionMode === "offline" ? "outline" : "default"}>
            {connectionMode === "offline" ? "📱 โหมดออฟไลน์" : "✅ ออนไลน์"}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            ครู {user.first_name} {user.last_name}
          </p>
          <Button variant="outline" onClick={logout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ตารางเรียนของฉัน</CardTitle>
            <CardDescription>
              รายการคาบเรียนทั้งหมด
              {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ยังไม่มีตารางเรียน</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วิชา</TableHead>
                    <TableHead>ระดับชั้น</TableHead>
                    <TableHead>วัน</TableHead>
                    <TableHead>เวลา</TableHead>
                    <TableHead>จำนวนนักเรียน</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.courses?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{schedule.courses?.grade_level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dayNames[schedule.day_of_week]}</Badge>
                      </TableCell>
                      <TableCell>
                        {schedule.start_time} - {schedule.end_time}
                      </TableCell>
                      <TableCell>{schedule.enrollments?.length || 0} คน</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setSelectedSchedule(schedule)}
                          disabled={!schedule.enrollments?.length}
                        >
                          เช็คชื่อ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedSchedule && (
          <Card>
            <CardHeader>
              <CardTitle>เช็คชื่อเข้าเรียน</CardTitle>
              <CardDescription>
                {selectedSchedule.courses?.name} - {dayNames[selectedSchedule.day_of_week]}{" "}
                {selectedSchedule.start_time}-{selectedSchedule.end_time}
                {connectionMode === "offline" && " (โหมดจำลอง)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedSchedule.enrollments?.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={enrollment.id}
                      checked={attendance[enrollment.id] || false}
                      onCheckedChange={(checked) =>
                        setAttendance((prev) => ({
                          ...prev,
                          [enrollment.id]: checked as boolean,
                        }))
                      }
                    />
                    <label htmlFor={enrollment.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">
                        {enrollment.users?.first_name} {enrollment.users?.last_name}
                        {enrollment.users?.nickname && ` (${enrollment.users.nickname})`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        เข้าเรียนแล้ว: {enrollment.sessions_attended} ครั้ง
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleAttendance}>บันทึกการเข้าเรียน</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSchedule(null)
                    setAttendance({})
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded mt-4">
                  💡 โหมดออฟไลน์: การบันทึกจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
