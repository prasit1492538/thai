"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export async function login(formData: FormData) {
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  console.log("Login attempt:", { phone, password: password ? "***" : "empty" })

  if (!phone || !password) {
    return { error: "กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน" }
  }

  const supabase = await createClient()

  try {
    // Find user by phone
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("phone", phone).single()

    console.log("User query result:", { user: user?.id, error: userError })

    if (userError || !user) {
      return { error: "ไม่พบผู้ใช้งานนี้" }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password || "")
    console.log("Password match:", passwordMatch)

    if (!passwordMatch) {
      return { error: "รหัสผ่านไม่ถูกต้อง" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(
      "user_session",
      JSON.stringify({
        id: user.id,
        phone: user.phone,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    console.log("Login successful, redirecting...")

    revalidatePath("/")
    redirect(user.role === "student" ? "/dashboard" : "/admin")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }
  }
}

export async function register(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const nickname = formData.get("nickname") as string
  const birthDate = formData.get("birthDate") as string
  const grade = formData.get("grade") as string
  const address = formData.get("address") as string
  const fatherName = formData.get("fatherName") as string
  const fatherOccupation = formData.get("fatherOccupation") as string
  const fatherWorkplace = formData.get("fatherWorkplace") as string
  const fatherPhone = formData.get("fatherPhone") as string
  const fatherLine = formData.get("fatherLine") as string
  const fatherEmail = formData.get("fatherEmail") as string
  const motherName = formData.get("motherName") as string
  const motherOccupation = formData.get("motherOccupation") as string
  const motherWorkplace = formData.get("motherWorkplace") as string
  const motherPhone = formData.get("motherPhone") as string
  const motherLine = formData.get("motherLine") as string
  const motherEmail = formData.get("motherEmail") as string
  const school1 = formData.get("school1") as string
  const school2 = formData.get("school2") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const branch = formData.get("branch") as string
  const pdpa = formData.get("pdpa") === "on"

  // Validate required fields
  if (!firstName || !lastName || !fatherPhone || !password) {
    return { error: "กรุณากรอกข้อมูลที่จำเป็น" }
  }

  // Validate password
  if (password.length < 10) {
    return { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 10 ตัวอักษร" }
  }

  if (password !== confirmPassword) {
    return { error: "รหัสผ่านไม่ตรงกัน" }
  }

  const supabase = await createClient()

  try {
    // Check if phone already exists
    const { data: existingUser } = await supabase.from("users").select("*").eq("phone", fatherPhone).single()

    if (existingUser) {
      return { error: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        nickname,
        birth_date: birthDate,
        current_grade: grade,
        address,
        phone: fatherPhone,
        email: fatherEmail,
        password: hashedPassword,
        role: "student",
      })
      .select()
      .single()

    if (userError || !user) {
      console.error("User creation error:", userError)
      return { error: "ไม่สามารถสร้างบัญชีผู้ใช้ได้" }
    }

    // Add father information
    const { error: fatherError } = await supabase.from("parents").insert({
      student_id: user.id,
      parent_type: "father",
      first_name: fatherName,
      last_name: "",
      occupation: fatherOccupation,
      workplace: fatherWorkplace,
      phone: fatherPhone,
      line_id: fatherLine,
      email: fatherEmail,
    })

    if (fatherError) {
      console.error("Father creation error:", fatherError)
      return { error: "ไม่สามารถบันทึกข้อมูลบิดาได้" }
    }

    // Add mother information
    const { error: motherError } = await supabase.from("parents").insert({
      student_id: user.id,
      parent_type: "mother",
      first_name: motherName,
      last_name: "",
      occupation: motherOccupation,
      workplace: motherWorkplace,
      phone: motherPhone,
      line_id: motherLine,
      email: motherEmail,
    })

    if (motherError) {
      console.error("Mother creation error:", motherError)
      return { error: "ไม่สามารถบันทึกข้อมูลมารดาได้" }
    }

    // Add student preferences
    const { error: preferencesError } = await supabase.from("student_preferences").insert({
      student_id: user.id,
      preferred_school_1: school1,
      preferred_school_2: school2,
      pdpa_consent: pdpa,
      branch_id: branch,
    })

    if (preferencesError) {
      console.error("Preferences creation error:", preferencesError)
      return { error: "ไม่สามารถบันทึกข้อมูลความต้องการได้" }
    }

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")
  revalidatePath("/")
  redirect("/")
}
