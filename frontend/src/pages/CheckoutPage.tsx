"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    phone: user?.phone || "",
    notes: "",
    novaPoshtaOffice: "",
    ukrPoshtaOffice: "",
    deliveryMethod: "courier",
    paymentMethod: "liqpay"
  })

  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate delivery fee based on selected method and cart total
  useEffect(() => {
    const subtotal = getTotalPrice()
    
    let fee = 0
    switch (formData.deliveryMethod) {
      case 'pickup':
        fee = 0 // Self-pickup is free
        break
      case 'courier':
        fee = (subtotal >= 1000) ? 0 : 100 // Free for orders over 1000 UAH
        break
      case 'novaPoshta':
        fee = 70 // Set a default Nova Poshta fee
        break
      case 'ukrPoshta':
        fee = 50 // Set a default UkrPoshta fee
        break
      default:
        fee = 0
    }
    
    setDeliveryFee(fee)
  }, [formData.deliveryMethod, getTotalPrice])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast({
        title: "Кошик порожній",
        description: "Додайте товари до кошика, щоб оформити замовлення",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const orderItems = items.map((item) => ({
        product: item.product,
        amount: item.amount,
      }))

      // Prepare shipping address based on delivery method
      const shippingAddress = {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
      }

      // Add Nova Poshta or UkrPoshta specific fields if selected
      if (formData.deliveryMethod === 'novaPoshta' && formData.novaPoshtaOffice) {
        shippingAddress.novaPoshtaOffice = formData.novaPoshtaOffice
        shippingAddress.novaPoshtaFee = deliveryFee
      } else if (formData.deliveryMethod === 'ukrPoshta' && formData.ukrPoshtaOffice) {
        shippingAddress.ukrPoshtaOffice = formData.ukrPoshtaOffice
        shippingAddress.ukrPoshtaFee = deliveryFee
      }

      const response = await axios.post("/orders", {
        orderItems,
        shippingAddress,
        notes: formData.notes,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod
      })

      // Redirect to payment page if payment link is provided
      if (response.data.paymentLink) {
        window.location.href = response.data.paymentLink
      } else {
        clearCart()
        toast({
          title: "Замовлення оформлено",
          description: "Ваше замовлення успішно оформлено",
        })
        navigate("/orders")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оформити замовлення. Спробуйте ще раз.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Спосіб доставки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={formData.deliveryMethod} 
                  onValueChange={(value) => handleRadioChange("deliveryMethod", value)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="pickup" className="font-medium">Самовивіз зі складу</Label>
                      <p className="text-sm text-muted-foreground">Безкоштовно</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="courier" id="courier" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="courier" className="font-medium">Доставка кур'єром</Label>
                      <p className="text-sm text-muted-foreground">
                        {getTotalPrice() >= 1000 ? 'Безкоштовно при замовленні від 1000 грн' : `${formatPrice(100)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="novaPoshta" id="novaPoshta" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="novaPoshta" className="font-medium">Нова Пошта</Label>
                      <p className="text-sm text-muted-foreground">Згідно з тарифами перевізника</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="ukrPoshta" id="ukrPoshta" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="ukrPoshta" className="font-medium">Укрпошта</Label>
                      <p className="text-sm text-muted-foreground">Згідно з тарифами перевізника</p>
                    </div>
                  </div>
                </RadioGroup>

                {/* Conditional fields based on delivery method */}
                {formData.deliveryMethod === 'novaPoshta' && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="novaPoshtaOffice">Відділення Нової Пошти</Label>
                    <Input 
                      id="novaPoshtaOffice" 
                      name="novaPoshtaOffice" 
                      value={formData.novaPoshtaOffice} 
                      onChange={handleChange} 
                      placeholder="Номер відділення або поштомату"
                      required
                    />
                  </div>
                )}

                {formData.deliveryMethod === 'ukrPoshta' && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="ukrPoshtaOffice">Відділення Укрпошти</Label>
                    <Input 
                      id="ukrPoshtaOffice" 
                      name="ukrPoshtaOffice" 
                      value={formData.ukrPoshtaOffice} 
                      onChange={handleChange} 
                      placeholder="Адреса відділення"
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Спосіб оплати</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleRadioChange("paymentMethod", value)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="liqpay" id="liqpay" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="liqpay" className="font-medium">Оплата картою онлайн (LiqPay)</Label>
                      <p className="text-sm text-muted-foreground">Безпечна оплата через LiqPay</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="cashOnDelivery" id="cashOnDelivery" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="cashOnDelivery" className="font-medium">Оплата при отриманні</Label>
                      <p className="text-sm text-muted-foreground">Оплата готівкою або карткою при отриманні</p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Інформація про доставку</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Адреса</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Місто</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Поштовий індекс</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Примітки до замовлення (необов'язково)</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Обробка..." : "Підтвердити замовлення"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ваше замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground ml-2">x{item.amount}</span>
                  </div>
                  <span>{formatPrice(item.price * item.amount)}</span>
                </div>
              ))}

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Вартість товарів:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Вартість доставки:</span>
                  <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Безкоштовно'}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Загальна сума</span>
                  <span>{formatPrice(getTotalPrice() + deliveryFee)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

