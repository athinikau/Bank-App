"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="ml-4 text-xl font-bold text-capitec-red">Reset Password</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-md">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-capitec-blue">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {submitted ? (
                  <Alert className="bg-green-50 text-green-600 border-green-200">
                    <AlertDescription>
                      If an account exists with this email, you will receive password reset instructions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                      disabled={loading}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {submitted ? (
                  <Button type="button" className="w-full bg-capitec-blue hover:bg-capitec-blue/90" asChild>
                    <Link href="/auth/login">Return to Login</Link>
                  </Button>
                ) : (
                  <Button type="submit" className="w-full bg-capitec-red hover:bg-capitec-red/90" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Sending...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}

