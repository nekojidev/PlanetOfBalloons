"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { formatPrice } from "@/lib/utils"
import { Minus, Plus, Trash2 } from "lucide-react"

const CartPage = () => {
  const { items, removeItem, updateAmount, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpdateAmount = (id: string, amount: number) => {
    if (amount < 1) return
    updateAmount(id, amount)
  }

  const handleCheckout = () => {
    if (!user) {
      navigate("/login")
      return
    }

    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      navigate("/checkout")
      setIsProcessing(false)
    }, 1000)
  }

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Ваш кошик порожній</h1>
        <p className="text-muted-foreground mb-8">Додайте товари до кошика, щоб продовжити покупки</p>
        <Link to="/products">
          <Button>Переглянути товари</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Кошик</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={item.image || "/placeholder.svg?height=100&width=100"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium">
                      <h3>{item.name}</h3>
                      <p className="ml-4">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateAmount(item.id, item.amount - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 w-8 text-center">{item.amount}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateAmount(item.id, item.amount + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <div className="ml-auto">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearCart}>
              Очистити кошик
            </Button>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Підсумок замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Кількість товарів</span>
                <span>{items.reduce((acc, item) => acc + item.amount, 0)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg">
                <span>Загальна сума</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProcessing}>
                {isProcessing ? "Обробка..." : "Оформити замовлення"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CartPage

