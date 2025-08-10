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
import { Textarea } from "@/components/ui/textarea"
import { getSession, logout } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { BookOpen, Search, Plus, Edit, Trash2, ArrowLeft, AlertCircle } from "lucide-react"
import type { User, Course, Branch } from "@/lib/database.types"

export default function CoursesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
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
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.grade_level.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCourses(filtered)
    } else {
      setFilteredCourses(courses)
    }
  }, [searchTerm, courses])

  const loadData = async () => {
    try {
      const session = getSession()
      const branchId = session?.user.role === "admin" ? session.user.branch_id : undefined

      const [coursesResult, branchesResult, teachersResult] = await Promise.all([
        DatabaseService.getCourses(branchId),
        DatabaseService.getBranches(),
        DatabaseService.getTeachers(branchId),
      ])

      if (coursesResult.error) {
        console.error("Error loading courses:", coursesResult.error)
      } else {
        setCourses(coursesResult.data || [])
        setFilteredCourses(coursesResult.data || [])
      }

      if (branchesResult.error) {
        console.error("Error loading branches:", branchesResult.error)
      } else {
        setBranches(branchesResult.data || [])
      }

      if (teachersResult.error) {
        console.error("Error loading teachers:", teachersResult.error)
      } else {
        setTeachers(teachersResult.data || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (courseData: Omit<Course, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await DatabaseService.createCourse(courseData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการเพิ่มคอร์ส")
      } else {
        alert("เพิ่มคอร์สสำเร็จ")
        setIsAddDialogOpen(false)
        loadData()
      }
    } catch (error) {
      console.error("Error adding course:", error)
      alert("เกิดข้อผิดพลาดในการเพิ่มคอร์ส")
    }
  }

  const handleEditCourse = async (courseData: Partial<Course>) => {
    if (!selectedCourse) return

    try {
      const { data, error } = await DatabaseService.updateCourse(selectedCourse.id, courseData)
      if (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไขคอร์ส")
      } else {
        alert("แก้ไขคอร์สสำเร็จ")
        setIsEditDialogOpen(false)
        setSelectedCourse(null)
        loadData()
      }
    } catch (error) {
      console.error("Error editing course:", error)
      alert("เกิดข้อผิดพลาดในการแก้ไขคอร์ส")
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?")) {
      return
    }

    try {
      const { error } = await DatabaseService.deleteCourse(courseId)
      if (error) {
        alert("เกิดข้อผิดพลาดในการลบคอร์ส")
      } else {
        alert("ลบคอร์สสำเร็จ")
        loadData()
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("เกิดข้อผิดพลาดในการลบคอร์ส")
    }
  }

  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId)
    return branch?.name || "ไม่ระบุ"
  }

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "ไม่ระบุ"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH")
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
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">จัดการคอร์สเรียน</h1>
                  <p className="text-sm text-gray-500">ดูและจัดการคอร์สเรียนทั้งหมด</p>
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
              <span>ค้นหาคอร์ส</span>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มคอร์สใหม่
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยชื่อคอร์ส คำอธิบาย หรือระดับชั้น"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการคอร์สเรียน ({filteredCourses.length} คอร์ส)</CardTitle>
            <CardDescription>คอร์สเรียนทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCourses.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchTerm ? "ไม่พบคอร์สที่ตรงกับการค้นหา" : "ยังไม่มีคอร์สในระบบ"}</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อคอร์ส</TableHead>
                      <TableHead>ระดับชั้น</TableHead>
                      <TableHead>ครูผู้สอน</TableHead>
                      <TableHead>จำนวนชั่วโมง</TableHead>
                      <TableHead>ราคา</TableHead>
                      <TableHead>สาขา</TableHead>
                      <TableHead>วันที่สร้าง</TableHead>
                      <TableHead>การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.grade_level}</Badge>
                        </TableCell>
                        <TableCell>{getTeacherName(course.teacher_id)}</TableCell>
                        <TableCell>{course.total_sessions} ชั่วโมง</TableCell>
                        <TableCell className="font-medium">{formatCurrency(course.price)}</TableCell>
                        <TableCell>{getBranchName(course.branch_id)}</TableCell>
                        <TableCell>{formatDate(course.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCourse(course)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มคอร์สใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลคอร์สใหม่</DialogDescription>
          </DialogHeader>
          <CourseForm
            branches={branches}
            teachers={teachers}
            userBranchId={user.role === "admin" ? user.branch_id : undefined}
            onSubmit={handleAddCourse}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขคอร์ส</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลคอร์ส {selectedCourse?.name}</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <CourseForm
              course={selectedCourse}
              branches={branches}
              teachers={teachers}
              userBranchId={user.role === "admin" ? user.branch_id : undefined}
              onSubmit={handleEditCourse}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedCourse(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CourseForm({
  course,
  branches,
  teachers,
  userBranchId,
  onSubmit,
  onCancel,
}: {
  course?: Course
  branches: Branch[]
  teachers: User[]
  userBranchId?: string
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: course?.name || "",
    description: course?.description || "",
    grade_level: course?.grade_level || "",
    total_sessions: course?.total_sessions || 0,
    price: course?.price || 0,
    branch_id: course?.branch_id || userBranchId || "",
    teacher_id: course?.teacher_id || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Filter branches and teachers based on user role
  const availableBranches = userBranchId ? branches.filter((b) => b.id === userBranchId) : branches
  const availableTeachers = userBranchId ? teachers.filter((t) => t.branch_id === userBranchId) : teachers

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">ชื่อคอร์ส</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">คำอธิบาย</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grade_level">ระดับชั้น</Label>
          <Select
            value={formData.grade_level}
            onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกระดับชั้น" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ม.1">ม.1</SelectItem>
              <SelectItem value="ม.2">ม.2</SelectItem>
              <SelectItem value="ม.3">ม.3</SelectItem>
              <SelectItem value="ม.4">ม.4</SelectItem>
              <SelectItem value="ม.5">ม.5</SelectItem>
              <SelectItem value="ม.6">ม.6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="total_sessions">จำนวนชั่วโมง</Label>
          <Input
            id="total_sessions"
            type="number"
            value={formData.total_sessions}
            onChange={(e) => setFormData({ ...formData, total_sessions: Number.parseInt(e.target.value) })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="price">ราคา (บาท)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="branch">สาขา</Label>
        <Select
          value={formData.branch_id}
          onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
          disabled={!!userBranchId}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกสาขา" />
          </SelectTrigger>
          <SelectContent>
            {availableBranches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="teacher">ครูผู้สอน</Label>
        <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกครูผู้สอน" />
          </SelectTrigger>
          <SelectContent>
            {availableTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
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
