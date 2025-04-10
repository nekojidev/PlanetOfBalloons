"use client"

import type React from "react"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

const ProfilePage = () => {
  const { user, updateProfile, updatePassword, isLoading, error, clearError } = useAuthStore()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordError, setPasswordError] = useState("")

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    if (name === "confirmPassword" || name === "newPassword") {
      if (name === "newPassword" && passwordData.confirmPassword && value !== passwordData.confirmPassword) {
        setPasswordError("Паролі не співпадають")
      } else if (name === "confirmPassword" && value !== passwordData.newPassword) {
        setPasswordError("Паролі не співпадають")
      } else {
        setPasswordError("")
      }
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await updateProfile(profileData.name, profileData.email, profileData.phone)
      toast({
        title: "Профіль оновлено",
        description: "Ваш профіль успішно оновлено",
      })
    } catch (err) {
      // Error is handled in the store
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Паролі не співпадають")
      return
    }

    try {
      await updatePassword(passwordData.oldPassword, passwordData.newPassword)
      toast({
        title: "Пароль змінено",
        description: "Ваш пароль успішно змінено",
      })
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      // Error is handled in the store
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Мій профіль</h1>

      <Tabs defaultValue="profile" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Особисті дані</TabsTrigger>
          <TabsTrigger value="password">Зміна паролю</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Особисті дані</CardTitle>
              <CardDescription>Оновіть свої особисті дані</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="p-3 mb-4 text-sm text-white bg-destructive rounded-md">{error}</div>}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ім'я</Label>
                  <Input id="name" name="name" value={profileData.name} onChange={handleProfileChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Електронна пошта</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleProfileSubmit} disabled={isLoading}>
                {isLoading ? "Збереження..." : "Зберегти зміни"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Зміна паролю</CardTitle>
              <CardDescription>Змініть свій пароль для входу</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="p-3 mb-4 text-sm text-white bg-destructive rounded-md">{error}</div>}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Поточний пароль</Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новий пароль</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Підтвердження нового паролю</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePasswordSubmit} disabled={isLoading || !!passwordError}>
                {isLoading ? "Збереження..." : "Змінити пароль"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfilePage

