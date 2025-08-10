"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  name: string
  description: string | null
  grade_level: string | null
  total_sessions: number
  price: number
  created_at: string
}

interface Schedule {
  id: string
  course_id: string
  branch_id: string
  day_of_week: number
  start_time: string
  end_time: string
  branches: {
    name: string
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null)
  const [deleteSchedule, setDeleteSchedule] = useState<Schedule | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteScheduleDialogOpen, setIsDeleteScheduleDialogOpen] = useState(false)
  const [connectionMode, setConnectionMode] = useState<string>("checking")
  const router = useRouter()
  const { toast } = useToast()

  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]

  useEffect(() => {
    async function checkAuthAndFetchData() {
      const session = getSession()

      if (!session) {
        router.push("/")
        return
      }

      if (session.role === "student") {
        router.push("/dashboard")
        return
      }

      // Initialize database service
      await DatabaseService.initialize()
      setConnectionMode(DatabaseService.getConnectionMode())

      await fetchCourses()
      await fetchSchedules()
    }

    checkAuthAndFetchData()
  }, [router])

  async function fetchCourses() {
    try {
      console.log("🔍 Fetching courses...")
      const { data, error } = await DatabaseService.getCourses()

      if (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลคอร์สได้",
          variant: "destructive",
        })
        return
      }

      console.log("📚 Courses fetched:", data?.length || 0)
      setCourses(data || [])
    } catch (error) {
      console.error("Exception fetching courses:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส",
        variant: "destructive",
      })
    }
  }

  async function fetchSchedules() {
    try {
      console.log("🔍 Fetching schedules...")
      const { data, error } = await DatabaseService.getSchedules()

      if (error) {
        console.error("Error fetching schedules:", error)
        return
      }

      console.log("📅 Schedules fetched:", data?.length || 0)
      setSchedules(data || [])
    } catch (error) {
      console.error("Exception fetching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCourse(formData: FormData) {
    try {
      const courseData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        grade_level: formData.get("grade_level") as string,
        total_sessions: Number.parseInt(formData.get("total_sessions") as string),
        price: Number.parseFloat(formData.get("price") as string),
      }

      const { error } = await DatabaseService.addCourse(courseData)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มคอร์สได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "เพิ่มคอร์สใหม่แล้ว (โหมดจำลอง)" : "เพิ่มคอร์สใหม่แล้ว",
      })

      setIsAddDialogOpen(false)
      await fetchCourses()
    } catch (error) {
      console.error("Error adding course:", error)
    }
  }

  async function handleEditCourse(formData: FormData) {
    if (!editCourse) return

    try {
      const updates = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        grade_level: formData.get("grade_level") as string,
        total_sessions: Number.parseInt(formData.get("total_sessions") as string),
        price: Number.parseFloat(formData.get("price") as string),
      }

      const { error } = await DatabaseService.updateCourse(editCourse.id, updates)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแก้ไขคอร์สได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "แก้ไขคอร์สแล้ว (โหมดจำลอง)" : "แก้ไขคอร์สแล้ว",
      })

      setIsEditDialogOpen(false)
      setEditCourse(null)
      await fetchCourses()
    } catch (error) {
      console.error("Error editing course:", error)
    }
  }

  async function handleDeleteCourse() {
    if (!deleteCourse) return

    try {
      const { error } = await DatabaseService.deleteCourse(deleteCourse.id)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบคอร์สได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "ลบคอร์สแล้ว (โหมดจำลอง)" : "ลบคอร์สแล้ว",
      })

      setIsDeleteDialogOpen(false)
      setDeleteCourse(null)
      await fetchCourses()
      await fetchSchedules()
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  async function handleDeleteSchedule() {
    if (!deleteSchedule) return

    try {
      const { error } = await DatabaseService.deleteSchedule(deleteSchedule.id)

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบตารางเรียนได้",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "สำเร็จ",
        description: connectionMode === "offline" ? "ลบตารางเรียนแล้ว (โหมดจำลอง)" : "ลบตารางเรียนแล้ว",
      })

      setIsDeleteScheduleDialogOpen(false)
      setDeleteSchedule(null)
      await fetchSchedules()
    } catch (error) {
      console.error("Error deleting schedule:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">จัดการคอร์ส</h1>
          <Badge variant={connectionMode === "offline" ? "outline" : "default"}>
            {connectionMode === "offline" ? "📱 โหมดออฟไลน์" : "✅ ออนไลน์"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={logout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Courses Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>หลักสูตรทั้งหมด</CardTitle>
                <CardDescription>
                  จำนวนหลักสูตร: {courses.length} คอร์ส
                  {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มคอร์สใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มคอร์สใหม่</DialogTitle>
                    <DialogDescription>กรอกข้อมูลหลักสูตรใหม่</DialogDescription>
                  </DialogHeader>
                  <form action={handleAddCourse}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">ชื่อคอร์ส</Label>
                        <Input id="name" name="name" placeholder="เช่น คณิตศาสตร์ ม.3" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">รายละเอียด</Label>
                        <Input id="description" name="description" placeholder="รายละเอียดคอร์ส" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grade_level">ระดับชั้น</Label>
                        <Input id="grade_level" name="grade_level" placeholder="เช่น m3, m6" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_sessions">จำนวนครั้งเรียน</Label>
                        <Input id="total_sessions" name="total_sessions" type="number" placeholder="30" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">ราคา (บาท)</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="12000" required />
                      </div>
                      {connectionMode === "offline" && (
                        <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          💡 โหมดออฟไลน์: การเพิ่มจะเป็นการจำลองเท่านั้น
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="submit">เพิ่มคอร์ส</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ยังไม่มีหลักสูตรในระบบ</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อคอร์ส</TableHead>
                    <TableHead>ระดับชั้น</TableHead>
                    <TableHead>จำนวนครั้งเรียน</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>
                        {course.grade_level ? <Badge variant="secondary">{course.grade_level}</Badge> : "-"}
                      </TableCell>
                      <TableCell>{course.total_sessions} ครั้ง</TableCell>
                      <TableCell>{course.price.toLocaleString()} บาท</TableCell>
                      <TableCell>{new Date(course.created_at).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditCourse(course)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteCourse(course)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Schedules Section */}
        <Card>
          <CardHeader>
            <CardTitle>ตารางเรียน</CardTitle>
            <CardDescription>
              ตารางเรียนทั้งหมด: {schedules.length} ตาราง
              {connectionMode === "offline" && " (ข้อมูลจำลอง)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ยังไม่มีตารางเรียนในระบบ</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>คอร์ส</TableHead>
                    <TableHead>สาขา</TableHead>
                    <TableHead>วัน</TableHead>
                    <TableHead>เวลา</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => {
                    const course = courses.find((c) => c.id === schedule.course_id)
                    return (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{course?.name || "ไม่พบคอร์ส"}</TableCell>
                        <TableCell>{schedule.branches?.name || "ไม่พบสาขา"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{dayNames[schedule.day_of_week]}</Badge>
                        </TableCell>
                        <TableCell>
                          {schedule.start_time} - {schedule.end_time}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteSchedule(schedule)
                                setIsDeleteScheduleDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขคอร์ส</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลหลักสูตร</DialogDescription>
          </DialogHeader>
          <form action={handleEditCourse}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">ชื่อคอร์ส</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editCourse?.name}
                  placeholder="เช่น คณิตศาสตร์ ม.3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">รายละเอียด</Label>
                <Input
                  id="edit-description"
                  name="description"
                  defaultValue={editCourse?.description || ""}
                  placeholder="รายละเอียดคอร์ส"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade_level">ระดับชั้น</Label>
                <Input
                  id="edit-grade_level"
                  name="grade_level"
                  defaultValue={editCourse?.grade_level || ""}
                  placeholder="เช่น m3, m6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-total_sessions">จำนวนครั้งเรียน</Label>
                <Input
                  id="edit-total_sessions"
                  name="total_sessions"
                  type="number"
                  defaultValue={editCourse?.total_sessions}
                  placeholder="30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">ราคา (บาท)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editCourse?.price}
                  placeholder="12000"
                  required
                />
              </div>
              {connectionMode === "offline" && (
                <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  💡 โหมดออฟไลน์: การแก้ไขจะเป็นการจำลองเท่านั้น
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึกการแก้ไข</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบคอร์ส</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบคอร์ส "{deleteCourse?.name}"?
              <br />
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
              {connectionMode === "offline" && (
                <span className="block mt-2 text-blue-600">💡 โหมดออฟไลน์: การลบจะเป็นการจำลองเท่านั้น</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              ลบคอร์ส
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Confirmation Dialog */}
      <Dialog open={isDeleteScheduleDialogOpen} onOpenChange={setIsDeleteScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบตารางเรียน</DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบตารางเรียนนี้?
              <br />
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
              {connectionMode === "offline" && (
                <span className="block mt-2 text-blue-600">💡 โหมดออฟไลน์: การลบจะเป็นการจำลองเท่านั้น</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteScheduleDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchedule}>
              ลบตารางเรียน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
