"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { login, getSession } from "@/lib/auth"
import { DatabaseService } from "@/lib/database-service"
import { BookOpen, Phone, AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean
    mode: string
    message: string
  }>({
    connected: false,
    mode: "json",
    message: "กำลังเชื่อมต่อ...",
  })
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const session = getSession()
    if (session) {
      redirectToRolePage(session.user.role)
      return
    }

    // Initialize database
    initializeDatabase()
  }, [])

  const initializeDatabase = async () => {
    try {
      const result = await DatabaseService.initialize()
      setDbStatus({
        connected: result.success,
        mode: result.mode,
        message: result.message,
      })
    } catch (error) {
      setDbStatus({
        connected: false,
        mode: "json",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
      })
    }
  }

  const redirectToRolePage = (role: string) => {
    switch (role) {
      case "superadmin":
      case "admin":
        router.push("/admin")
        break
      case "teacher":
        router.push("/teacher")
        break
      case "student":
        router.push("/dashboard")
        break
      default:
        router.push("/dashboard")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(phone)

      if (result.success && result.user) {
        redirectToRolePage(result.user.role)
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ระบบติวเตอร์ไทย</h1>
          <p className="text-gray-600 mt-2">เข้าสู่ระบบด้วยเบอร์โทรศัพท์</p>
        </div>

        {/* Database Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {dbStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">สถานะฐานข้อมูล:</span>
                  <Badge variant={dbStatus.connected ? "default" : "secondary"}>{dbStatus.mode.toUpperCase()}</Badge>
                  {dbStatus.mode === "json" ? (
                    <WifiOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Wifi className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{dbStatus.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>กรอกเบอร์โทรศัพท์เพื่อเข้าสู่ระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || !dbStatus.connected}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">บัญชีทดสอบ</CardTitle>
            <CardDescription>เบอร์โทรศัพท์สำหรับทดสอบระบบ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">Super Admin:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">0845678901</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">Admin กรุงเทพ:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">0812345678</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">Admin เชียงใหม่:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">0853456789</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">Admin ขอนแก่น:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">0864567890</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">ครู:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">0834567890</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">นักเรียน:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">0823456789</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 ระบบติวเตอร์ไทย. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </div>
  )
}
