"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Fingerprint, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  login,
  initializeStorage,
  isBiometricAvailable,
  authenticateWithBiometric,
  isAnyUserBiometricEnrolled,
} from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const router = useRouter()

  // Initialize demo data
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeStorage()

      // Check if biometric authentication is available and enrolled
      const checkBiometricAvailability = async () => {
        try {
          const available = await isBiometricAvailable()
          const anyUserEnrolled = isAnyUserBiometricEnrolled()
          setBiometricAvailable(available && anyUserEnrolled)
        } catch (error) {
          console.error("Error checking biometric availability:", error)
          setBiometricAvailable(false)
        }
      }

      checkBiometricAvailability()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = login(username, password)

      if (user) {
        router.push("/")
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setError("")
    setBiometricLoading(true)

    try {
      const user = await authenticateWithBiometric()

      if (user) {
        router.push("/")
      } else {
        setError("Biometric authentication was canceled")
      }
    } catch (err: any) {
      setError(err.message || "Biometric authentication failed")
      console.error(err)
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-capitec-red" />
          </div>
          <CardTitle className="text-2xl text-center text-capitec-blue">Capitec Bank</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                disabled={loading || biometricLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                  disabled={loading || biometricLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || biometricLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
            {biometricAvailable && (
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-capitec-blue/30 text-capitec-blue hover:bg-capitec-blue/10"
                  onClick={handleBiometricLogin}
                  disabled={loading || biometricLoading}
                >
                  {biometricLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-capitec-blue border-t-transparent"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Biometric Login
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-capitec-red hover:bg-capitec-red/90"
              disabled={loading || biometricLoading}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-center text-sm">
              <Link href="/auth/register" className="text-capitec-blue hover:underline">
                Don't have an account? Register
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-capitec-blue hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

