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
import { formatDate } from "@/lib/utils"
import { Users, Search, Plus, Edit, BookOpen, ArrowLeft, AlertCircle } from "lucide-react"
import type { User, Branch, Course } from "@/lib/database.types"

export default function TeachersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [teachers, setTeachers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null)
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
      const filtered = teachers.filter(
        (teacher) =>
          teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.phone.includes(searchTerm) ||
          (teacher.nickname && teacher.nickname.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredTeachers(filtered)
    } else {
      setFilteredTeachers(teachers)
    }
  }, [searchTerm, teachers])

  const loadData = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const [teachersResult, branchesResult, coursesResult] = await Promise.all([
        DatabaseService.getTeachers(branchId),
        DatabaseService.getBranches(),
        DatabaseService.getCourses(branchId),
      ])

      if (teachersResult.error) {
        console.error("Error loading teachers:", teachersResult.error)
      } else {
        setTeachers(teachersResult.data)
        setFilteredTeachers(teachersResult.data)
      }

      if (branchesResult.error) {
        console.error("Error loading branches:", branchesResult.error)
      } else {
        setBranches(branchesResult.data)
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

  const handleAddTeacher = async (teacherData: Omit<User, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await DatabaseService.createTeacher(teacherData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการเพิ่มครู")
      } else {
        alert("เพิ่มครูสำเร็จ")
        setIsAddDialogOpen(false)
        loadData()
      }
    } catch (error) {
      console.error("Error adding teacher:", error)
      alert("เกิดข้อผิดพลาดในการเพิ่มครู")
    }
  }

  const handleEditTeacher = async (teacherData: Partial<User>) => {
    if (!selectedTeacher) return

    try {
      const { data, error } = await DatabaseService.updateTeacher(selectedTeacher.id, teacherData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไขครู")
      } else {
        alert("แก้ไขครูสำเร็จ")
        setIsEditDialogOpen(false)
        setSelectedTeacher(null)
        loadData()
      }
    } catch (error) {
      console.error("Error editing teacher:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขครู")
    }
  }

  const getTeacherCourses = (teacherId: string) => {
    return courses.filter((course) => course.teacher_id === teacherId)
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
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">จัดการครู</h1>
                  <p className="text-sm text-gray-500">
                    ดูและจัดการข้อมูลครู{user.role === "admin" ? ` - ${user.branch_name}` : "ทั้งหมด"}
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
              <span>ค้นหาครู</span>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มครูใหม่
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อ นามสกุล ชื่อเล่น หรือเบอร์โทร"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อครู ({filteredTeachers.length} คน)</CardTitle>
            <CardDescription>รายการครูในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTeachers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchTerm ? "ไม่พบครูที่ตรงกับการค้นหา" : "ยังไม่มีครูในระบบ"}</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>ชื่อเล่น</TableHead>
                      <TableHead>เบอร์โทร</TableHead>
                      <TableHead>สาขา</TableHead>
                      <TableHead>วิชาที่สอน</TableHead>
                      <TableHead>วันที่เข้าร่วม</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => {
                      const teacherCourses = getTeacherCourses(teacher.id)
                      return (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">
                            {teacher.first_name} {teacher.last_name}
                          </TableCell>
                          <TableCell>{teacher.nickname || "-"}</TableCell>
                          <TableCell>{teacher.phone}</TableCell>
                          <TableCell>{teacher.branch_name || "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {teacherCourses.length > 0 ? (
                                teacherCourses.map((course) => (
                                  <Badge key={course.id} variant="secondary" className="text-xs">
                                    {course.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">ยังไม่มีวิชา</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(teacher.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTeacher(teacher)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTeacher(teacher)
                                  setIsAssignDialogOpen(true)
                                }}
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Add Teacher Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มครูใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลครูใหม่</DialogDescription>
          </DialogHeader>
          <TeacherForm
            branches={user.role === "admin" ? branches.filter((b) => b.id === user.branch_id) : branches}
            onSubmit={handleAddTeacher}
            onCancel={() => setIsAddDialogOpen(false)}
            defaultBranchId={user.role === "admin" ? user.branch_id : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลครู</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของ {selectedTeacher?.first_name} {selectedTeacher?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <TeacherForm
              teacher={selectedTeacher}
              branches={user.role === "admin" ? branches.filter((b) => b.id === user.branch_id) : branches}
              onSubmit={handleEditTeacher}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedTeacher(null)
              }}
              defaultBranchId={user.role === "admin" ? user.branch_id : undefined}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Course Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>มอบหมายวิชา</DialogTitle>
            <DialogDescription>
              มอบหมายวิชาให้ {selectedTeacher?.first_name} {selectedTeacher?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <AssignCourseForm
              teacher={selectedTeacher}
              courses={courses}
              onClose={() => {
                setIsAssignDialogOpen(false)
                setSelectedTeacher(null)
                loadData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeacherForm({
  teacher,
  branches,
  onSubmit,
  onCancel,
  defaultBranchId,
}: {
  teacher?: User
  branches: Branch[]
  onSubmit: (data: any) => void
  onCancel: () => void
  defaultBranchId?: string
}) {
  const [formData, setFormData] = useState({
    first_name: teacher?.first_name || "",
    last_name: teacher?.last_name || "",
    nickname: teacher?.nickname || "",
    phone: teacher?.phone || "",
    email: teacher?.email || "",
    branch_id: teacher?.branch_id || defaultBranchId || "",
    role: "teacher" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">ชื่อ</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">นามสกุล</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="nickname">ชื่อเล่น</Label>
        <Input
          id="nickname"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">เบอร์โทร</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="branch">สาขา</Label>
        <Select
          value={formData.branch_id}
          onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
          disabled={branches.length === 1}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกสาขา" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

function AssignCourseForm({
  teacher,
  courses,
  onClose,
}: {
  teacher: User
  courses: Course[]
  onClose: () => void
}) {
  const [selectedCourseId, setSelectedCourseId] = useState("")

  const availableCourses = courses.filter((course) => course.branch_id === teacher.branch_id && !course.teacher_id)
  const teacherCourses = courses.filter((course) => course.teacher_id === teacher.id)

  const handleAssignCourse = async () => {
    if (!selectedCourseId) return

    try {
      const { error } = await DatabaseService.updateCourse(selectedCourseId, {
        teacher_id: teacher.id,
        teacher_name: `${teacher.first_name} ${teacher.last_name}`,
      })

      if (error) {
        alert("เกิดข้อผิดพลาดในการมอบหมายวิชา")
      } else {
        alert("มอบหมายวิชาสำเร็จ")
        onClose()
      }
    } catch (error) {
      console.error("Error assigning course:", error)
      alert("เกิดข้อผิดพลาดในการมอบหมายวิชา")
    }
  }

  const handleUnassignCourse = async (courseId: string) => {
    try {
      const { error } = await DatabaseService.updateCourse(courseId, {
        teacher_id: null,
        teacher_name: null,
      })

      if (error) {
        alert("เกิดข้อผิดพลาดในการยกเลิกการมอบหมาย")
      } else {
        alert("ยกเลิกการมอบหมายสำเร็จ")
        onClose()
      }
    } catch (error) {
      console.error("Error unassigning course:", error)
      alert("เกิดข้อผิดพลาดในการยกเลิกการมอบหมาย")
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Courses */}
      <div>
        <h4 className="font-medium mb-2">วิชาที่สอนอยู่</h4>
        {teacherCourses.length > 0 ? (
          <div className="space-y-2">
            {teacherCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{course.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({course.grade_level})</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnassignCourse(course.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  ยกเลิก
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">ยังไม่มีวิชาที่สอน</p>
        )}
      </div>

      {/* Assign New Course */}
      <div>
        <h4 className="font-medium mb-2">มอบหมายวิชาใหม่</h4>
        {availableCourses.length > 0 ? (
          <div className="space-y-2">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกวิชาที่จะมอบหมาย" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.grade_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignCourse} disabled={!selectedCourseId} className="w-full">
              มอบหมายวิชา
            </Button>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">ไม่มีวิชาที่ว่างให้มอบหมาย</p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          ปิด
        </Button>
      </DialogFooter>
    </div>
  )
}
