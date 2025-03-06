"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, X, Check, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser, updateUserProfile } from "@/lib/auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { User as UserType } from "@/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    setUser(currentUser)
    setProfileImage(currentUser.profileImage || null)
    setFormData({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
    })

    setLoading(false)
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user) {
        const updatedUser = await updateUserProfile(user.id, {
          ...formData,
          profileImage: profileImage,
        })

        setUser(updatedUser)
        setSuccess("Profile updated successfully")
        setIsEditing(false)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-capitec-red border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-capitec-red px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="ml-4 text-xl font-bold text-white">My Profile</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-md space-y-6">
          <Card className="rounded-xl overflow-hidden">
            <div className="bg-capitec-blue h-32 relative"></div>

            <div className="px-6 pb-6">
              <div className="flex justify-center">
                <div className="relative -mt-16">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white">
                      {profileImage ? (
                        <AvatarImage src={profileImage} alt={user?.firstName} />
                      ) : (
                        <AvatarFallback className="bg-capitec-red text-white text-4xl">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="absolute bottom-0 right-0">
                      <input
                        type="file"
                        id="profile-image"
                        ref={fileInputRef}
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="profile-image"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-capitec-red text-white shadow-md hover:bg-capitec-red/90"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Upload profile picture</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {profileImage && (
                <div className="mt-2 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleRemoveImage}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove Photo
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4 bg-red-50 text-red-600 border-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 bg-green-50 text-green-600 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-capitec-blue"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="border-capitec-blue/30 focus-visible:ring-capitec-red"
                      />
                    </div>

                    <Button
                      className="w-full bg-capitec-red hover:bg-capitec-red/90"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">ID Number</p>
                      <p className="font-medium">{user?.idNumber}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{user?.phoneNumber}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium">{user?.username}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button variant="outline" className="text-capitec-blue">
                  Change
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" className="text-capitec-blue">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

