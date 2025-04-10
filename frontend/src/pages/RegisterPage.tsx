"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "confirmPassword" || name === "password") {
      if (name === "password" && formData.confirmPassword && value !== formData.confirmPassword) {
        setPasswordError("Паролі не співпадають")
      } else if (name === "confirmPassword" && value !== formData.password) {
        setPasswordError("Паролі не співпадають")
      } else {
        setPasswordError("")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Паролі не співпадають")
      return
    }

    try {
      await register(formData.name, formData.email, formData.phone, formData.password)
      toast({
        title: "Успішна реєстрація",
        description: "Ви успішно зареєструвалися",
      })
      navigate("/")
    } catch (err) {
      // Error is handled in the store
    }
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Реєстрація</CardTitle>
            <CardDescription className="text-center">Створіть обліковий запис для здійснення покупок</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-white bg-destructive rounded-md">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ім'я</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Електронна пошта</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Підтвердження паролю</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !!passwordError}>
                {isLoading ? "Реєстрація..." : "Зареєструватися"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Вже маєте обліковий запис?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Увійти
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage

