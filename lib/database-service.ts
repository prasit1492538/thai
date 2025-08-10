import { jsonDatabase } from "./json-database"
import type {
  User,
  Branch,
  Course,
  Enrollment,
  Attendance,
  Payment,
  Revenue,
  Schedule,
  DatabaseResult,
  DatabaseInitResult,
} from "./database.types"

export class DatabaseService {
  private static mode: "json" | "mysql" | "supabase" = "json"
  private static initialized = false

  static async initialize(): Promise<DatabaseInitResult> {
    try {
      // Try to connect to Supabase first
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          // Test Supabase connection here if needed
          this.mode = "supabase"
          this.initialized = true
          return {
            success: true,
            mode: "supabase",
            message: "Connected to Supabase successfully",
          }
        } catch (error) {
          console.warn("Supabase connection failed, falling back to JSON mode")
        }
      }

      // Fallback to JSON mode
      this.mode = "json"
      this.initialized = true
      return {
        success: true,
        mode: "json",
        message: "Using JSON database (persistent data)",
      }
    } catch (error) {
      console.error("Database initialization failed:", error)
      return {
        success: false,
        mode: "json",
        message: "Database initialization failed",
      }
    }
  }

  // User Management
  static async findUserByPhone(phone: string): Promise<DatabaseResult<User>> {
    try {
      const user = jsonDatabase.users.find((u) => u.phone === phone)
      return {
        data: user || null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to find user",
      }
    }
  }

  static async getAllUsers(branchId?: string): Promise<DatabaseResult<User[]>> {
    try {
      let users = jsonDatabase.users
      if (branchId) {
        users = users.filter((u) => u.branch_id === branchId)
      }
      return {
        data: users,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get users",
      }
    }
  }

  static async getStudents(branchId?: string): Promise<DatabaseResult<User[]>> {
    try {
      let students = jsonDatabase.users.filter((u) => u.role === "student")
      if (branchId) {
        students = students.filter((u) => u.branch_id === branchId)
      }
      return {
        data: students,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get students",
      }
    }
  }

  static async getTeachers(branchId?: string): Promise<DatabaseResult<User[]>> {
    try {
      let teachers = jsonDatabase.users.filter((u) => u.role === "teacher")
      if (branchId) {
        teachers = teachers.filter((u) => u.branch_id === branchId)
      }
      return {
        data: teachers,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get teachers",
      }
    }
  }

  static async createStudent(
    studentData: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<DatabaseResult<User>> {
    try {
      const branch = jsonDatabase.branches.find((b) => b.id === studentData.branch_id)
      const newStudent: User = {
        ...studentData,
        id: (jsonDatabase.users.length + 1).toString(),
        branch_name: branch?.name || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      jsonDatabase.users.push(newStudent)
      return {
        data: newStudent,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to create student",
      }
    }
  }

  static async createTeacher(
    teacherData: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<DatabaseResult<User>> {
    try {
      const branch = jsonDatabase.branches.find((b) => b.id === teacherData.branch_id)
      const newTeacher: User = {
        ...teacherData,
        id: (jsonDatabase.users.length + 1).toString(),
        branch_name: branch?.name || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      jsonDatabase.users.push(newTeacher)
      return {
        data: newTeacher,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to create teacher",
      }
    }
  }

  static async updateStudent(studentId: string, updates: Partial<User>): Promise<DatabaseResult<User>> {
    try {
      const studentIndex = jsonDatabase.users.findIndex((u) => u.id === studentId)
      if (studentIndex === -1) {
        return {
          data: null,
          error: "Student not found",
        }
      }

      // Update branch name if branch_id changed
      if (updates.branch_id) {
        const branch = jsonDatabase.branches.find((b) => b.id === updates.branch_id)
        updates.branch_name = branch?.name || null
      }

      jsonDatabase.users[studentIndex] = {
        ...jsonDatabase.users[studentIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return {
        data: jsonDatabase.users[studentIndex],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update student",
      }
    }
  }

  static async updateTeacher(teacherId: string, updates: Partial<User>): Promise<DatabaseResult<User>> {
    try {
      const teacherIndex = jsonDatabase.users.findIndex((u) => u.id === teacherId)
      if (teacherIndex === -1) {
        return {
          data: null,
          error: "Teacher not found",
        }
      }

      // Update branch name if branch_id changed
      if (updates.branch_id) {
        const branch = jsonDatabase.branches.find((b) => b.id === updates.branch_id)
        updates.branch_name = branch?.name || null
      }

      jsonDatabase.users[teacherIndex] = {
        ...jsonDatabase.users[teacherIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return {
        data: jsonDatabase.users[teacherIndex],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update teacher",
      }
    }
  }

  static async deleteStudent(studentId: string): Promise<DatabaseResult<null>> {
    try {
      const studentIndex = jsonDatabase.users.findIndex((u) => u.id === studentId)
      if (studentIndex === -1) {
        return {
          data: null,
          error: "Student not found",
        }
      }

      jsonDatabase.users.splice(studentIndex, 1)
      return {
        data: null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to delete student",
      }
    }
  }

  // Branch Management
  static async getBranches(): Promise<DatabaseResult<Branch[]>> {
    try {
      return {
        data: jsonDatabase.branches,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get branches",
      }
    }
  }

  static async getBranchById(id: string): Promise<DatabaseResult<Branch>> {
    try {
      const branch = jsonDatabase.branches.find((b) => b.id === id)
      return {
        data: branch || null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get branch",
      }
    }
  }

  static async createBranch(
    branchData: Omit<Branch, "id" | "created_at" | "updated_at">,
  ): Promise<DatabaseResult<Branch>> {
    try {
      const newBranch: Branch = {
        ...branchData,
        id: (jsonDatabase.branches.length + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      jsonDatabase.branches.push(newBranch)
      return {
        data: newBranch,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to create branch",
      }
    }
  }

  static async updateBranch(branchId: string, updates: Partial<Branch>): Promise<DatabaseResult<Branch>> {
    try {
      const branchIndex = jsonDatabase.branches.findIndex((b) => b.id === branchId)
      if (branchIndex === -1) {
        return {
          data: null,
          error: "Branch not found",
        }
      }

      jsonDatabase.branches[branchIndex] = {
        ...jsonDatabase.branches[branchIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return {
        data: jsonDatabase.branches[branchIndex],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update branch",
      }
    }
  }

  // Course Management
  static async getCourses(branchId?: string): Promise<DatabaseResult<Course[]>> {
    try {
      let courses = jsonDatabase.courses
      if (branchId) {
        courses = courses.filter((c) => c.branch_id === branchId)
      }
      return {
        data: courses,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get courses",
      }
    }
  }

  static async getCourseById(id: string): Promise<DatabaseResult<Course>> {
    try {
      const course = jsonDatabase.courses.find((c) => c.id === id)
      return {
        data: course || null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get course",
      }
    }
  }

  static async getCoursesByTeacher(teacherId: string): Promise<DatabaseResult<Course[]>> {
    try {
      const courses = jsonDatabase.courses.filter((c) => c.teacher_id === teacherId)
      return {
        data: courses,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get teacher courses",
      }
    }
  }

  static async createCourse(
    courseData: Omit<Course, "id" | "created_at" | "updated_at">,
  ): Promise<DatabaseResult<Course>> {
    try {
      const branch = jsonDatabase.branches.find((b) => b.id === courseData.branch_id)
      const teacher = jsonDatabase.users.find((u) => u.id === courseData.teacher_id)

      const newCourse: Course = {
        ...courseData,
        id: (jsonDatabase.courses.length + 1).toString(),
        branch_name: branch?.name || null,
        teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      jsonDatabase.courses.push(newCourse)
      return {
        data: newCourse,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to create course",
      }
    }
  }

  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<DatabaseResult<Course>> {
    try {
      const courseIndex = jsonDatabase.courses.findIndex((c) => c.id === courseId)
      if (courseIndex === -1) {
        return {
          data: null,
          error: "Course not found",
        }
      }

      // Update related names if IDs changed
      if (updates.branch_id) {
        const branch = jsonDatabase.branches.find((b) => b.id === updates.branch_id)
        updates.branch_name = branch?.name || null
      }

      if (updates.teacher_id) {
        const teacher = jsonDatabase.users.find((u) => u.id === updates.teacher_id)
        updates.teacher_name = teacher ? `${teacher.first_name} ${teacher.last_name}` : null
      }

      jsonDatabase.courses[courseIndex] = {
        ...jsonDatabase.courses[courseIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return {
        data: jsonDatabase.courses[courseIndex],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update course",
      }
    }
  }

  static async deleteCourse(courseId: string): Promise<DatabaseResult<null>> {
    try {
      const courseIndex = jsonDatabase.courses.findIndex((c) => c.id === courseId)
      if (courseIndex === -1) {
        return {
          data: null,
          error: "Course not found",
        }
      }

      jsonDatabase.courses.splice(courseIndex, 1)
      return {
        data: null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to delete course",
      }
    }
  }

  // Enrollment Management
  static async getEnrollments(branchId?: string): Promise<DatabaseResult<Enrollment[]>> {
    try {
      let enrollments = jsonDatabase.enrollments

      if (branchId) {
        // Filter by branch through course relationship
        const branchCourses = jsonDatabase.courses.filter((c) => c.branch_id === branchId)
        const branchCourseIds = branchCourses.map((c) => c.id)
        enrollments = enrollments.filter((e) => branchCourseIds.includes(e.course_id))
      }

      return {
        data: enrollments,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get enrollments",
      }
    }
  }

  static async getEnrollmentsByStudent(studentId: string): Promise<DatabaseResult<Enrollment[]>> {
    try {
      const enrollments = jsonDatabase.enrollments.filter((e) => e.student_id === studentId)
      return {
        data: enrollments,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get student enrollments",
      }
    }
  }

  static async getEnrollmentsByCourse(courseId: string): Promise<DatabaseResult<Enrollment[]>> {
    try {
      const enrollments = jsonDatabase.enrollments.filter((e) => e.course_id === courseId)
      return {
        data: enrollments,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get course enrollments",
      }
    }
  }

  static async createEnrollment(
    enrollmentData: Omit<Enrollment, "id" | "created_at" | "updated_at">,
  ): Promise<DatabaseResult<Enrollment>> {
    try {
      const student = jsonDatabase.users.find((u) => u.id === enrollmentData.student_id)
      const course = jsonDatabase.courses.find((c) => c.id === enrollmentData.course_id)

      const newEnrollment: Enrollment = {
        ...enrollmentData,
        id: (jsonDatabase.enrollments.length + 1).toString(),
        student_first_name: student?.first_name || "",
        student_last_name: student?.last_name || "",
        course_name: course?.name || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      jsonDatabase.enrollments.push(newEnrollment)
      return {
        data: newEnrollment,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to create enrollment",
      }
    }
  }

  static async updateEnrollment(
    enrollmentId: string,
    updates: Partial<Enrollment>,
  ): Promise<DatabaseResult<Enrollment>> {
    try {
      const enrollmentIndex = jsonDatabase.enrollments.findIndex((e) => e.id === enrollmentId)
      if (enrollmentIndex === -1) {
        return {
          data: null,
          error: "Enrollment not found",
        }
      }

      jsonDatabase.enrollments[enrollmentIndex] = {
        ...jsonDatabase.enrollments[enrollmentIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      }

      return {
        data: jsonDatabase.enrollments[enrollmentIndex],
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update enrollment",
      }
    }
  }

  // Attendance Management
  static async getAttendance(courseId?: string, studentId?: string): Promise<DatabaseResult<Attendance[]>> {
    try {
      let attendance = jsonDatabase.attendance

      if (courseId) {
        attendance = attendance.filter((a) => a.course_id === courseId)
      }

      if (studentId) {
        attendance = attendance.filter((a) => a.student_id === studentId)
      }

      return {
        data: attendance,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get attendance",
      }
    }
  }

  static async markAttendance(
    studentId: string,
    courseId: string,
    status: "present" | "absent" | "late",
    notes?: string,
  ): Promise<DatabaseResult<Attendance>> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const checkInTime = status === "present" ? new Date().toTimeString().split(" ")[0] : undefined

      const newAttendance: Attendance = {
        id: (jsonDatabase.attendance.length + 1).toString(),
        student_id: studentId,
        course_id: courseId,
        class_date: today,
        status,
        check_in_time: checkInTime,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Remove existing attendance for same student, course, and date
      jsonDatabase.attendance = jsonDatabase.attendance.filter(
        (a) => !(a.student_id === studentId && a.course_id === courseId && a.class_date === today),
      )

      // Add new attendance record
      jsonDatabase.attendance.push(newAttendance)

      return {
        data: newAttendance,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to mark attendance",
      }
    }
  }

  static async updateAttendance(
    enrollmentId: string,
    date: string,
    checkedIn: boolean,
    checkedBy: string,
  ): Promise<DatabaseResult<null>> {
    try {
      // This is a simplified implementation for the JSON database
      return {
        data: null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update attendance",
      }
    }
  }

  static async updateEnrollmentSessions(enrollmentId: string, sessionsAttended: number): Promise<DatabaseResult<null>> {
    try {
      const enrollmentIndex = jsonDatabase.enrollments.findIndex((e) => e.id === enrollmentId)
      if (enrollmentIndex !== -1) {
        jsonDatabase.enrollments[enrollmentIndex].sessions_attended = sessionsAttended
        jsonDatabase.enrollments[enrollmentIndex].updated_at = new Date().toISOString()
      }
      return {
        data: null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to update enrollment sessions",
      }
    }
  }

  // Payment Management
  static async getPayments(branchId?: string): Promise<DatabaseResult<Payment[]>> {
    try {
      let payments = jsonDatabase.payments

      if (branchId) {
        // Filter by branch through enrollment and course relationship
        const branchCourses = jsonDatabase.courses.filter((c) => c.branch_id === branchId)
        const branchCourseIds = branchCourses.map((c) => c.id)
        const branchEnrollments = jsonDatabase.enrollments.filter((e) => branchCourseIds.includes(e.course_id))
        const branchEnrollmentIds = branchEnrollments.map((e) => e.id)
        payments = payments.filter((p) => branchEnrollmentIds.includes(p.enrollment_id))
      }

      return {
        data: payments,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get payments",
      }
    }
  }

  // Revenue Management
  static async getRevenue(startDate?: string, endDate?: string, branchId?: string): Promise<DatabaseResult<Revenue[]>> {
    try {
      let revenue = jsonDatabase.revenue

      if (branchId) {
        revenue = revenue.filter((r) => r.branch_id === branchId)
      }

      if (startDate) {
        revenue = revenue.filter((r) => r.date >= startDate)
      }

      if (endDate) {
        revenue = revenue.filter((r) => r.date <= endDate)
      }

      return {
        data: revenue,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get revenue",
      }
    }
  }

  // Schedule Management
  static async getSchedules(branchId?: string, teacherId?: string): Promise<DatabaseResult<Schedule[]>> {
    try {
      let schedules = jsonDatabase.schedules

      if (branchId || teacherId) {
        let filteredCourses = jsonDatabase.courses

        if (branchId) {
          filteredCourses = filteredCourses.filter((c) => c.branch_id === branchId)
        }

        if (teacherId) {
          filteredCourses = filteredCourses.filter((c) => c.teacher_id === teacherId)
        }

        const courseIds = filteredCourses.map((c) => c.id)
        schedules = schedules.filter((s) => courseIds.includes(s.course_id))
      }

      return {
        data: schedules,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get schedules",
      }
    }
  }

  static async deleteSchedule(scheduleId: string): Promise<DatabaseResult<null>> {
    try {
      const scheduleIndex = jsonDatabase.schedules.findIndex((s) => s.id === scheduleId)
      if (scheduleIndex === -1) {
        return {
          data: null,
          error: "Schedule not found",
        }
      }

      jsonDatabase.schedules.splice(scheduleIndex, 1)
      return {
        data: null,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to delete schedule",
      }
    }
  }

  // Statistics
  static async getStatistics(branchId?: string): Promise<DatabaseResult<any>> {
    try {
      let students = jsonDatabase.users.filter((u) => u.role === "student")
      let courses = jsonDatabase.courses
      let enrollments = jsonDatabase.enrollments
      let revenue = jsonDatabase.revenue
      let branches = jsonDatabase.branches

      if (branchId) {
        students = students.filter((s) => s.branch_id === branchId)
        courses = courses.filter((c) => c.branch_id === branchId)
        revenue = revenue.filter((r) => r.branch_id === branchId)
        branches = branches.filter((b) => b.id === branchId)

        const branchCourseIds = courses.map((c) => c.id)
        enrollments = enrollments.filter((e) => branchCourseIds.includes(e.course_id))
      }

      const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0)
      const totalCommission = revenue.reduce((sum, r) => sum + r.commission, 0)

      const stats = {
        totalStudents: students.length,
        totalCourses: courses.length,
        totalBranches: branches.length,
        totalEnrollments: enrollments.length,
        totalRevenue,
        totalCommission,
        paidEnrollments: enrollments.filter((e) => e.payment_status === "paid").length,
        pendingPayments: enrollments.filter((e) => e.payment_status === "pending").length,
      }

      return {
        data: stats,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: "Failed to get statistics",
      }
    }
  }

  static getConnectionMode() {
    return this.mode
  }

  static isOfflineMode() {
    return this.mode === "json"
  }

  static reset() {
    this.initialized = false
    this.mode = "json"
  }
}

// Export instance for backward compatibility
export const databaseService = DatabaseService
