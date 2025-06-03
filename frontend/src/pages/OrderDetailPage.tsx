"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

interface OrderItem {
  product: {
    _id: string
    name: string
    price: number
    image: string
  }
  amount: number
}

interface ShippingAddress {
  address: string
  city: string
  postalCode: string
  phone: string
  novaPoshtaOffice?: string
  ukrPoshtaOffice?: string
}

interface Order {
  _id: string
  orderItems: OrderItem[]
  shippingAddress: ShippingAddress
  totalPrice: number
  subtotal: number
  deliveryFee: number
  deliveryMethod: string
  paymentMethod: string
  status: string
  paymentStatus: string
  notes?: string
  createdAt: string
  updatedAt: string
  paymentDetails?: any
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchOrder = async () => {
    if (!id) return

    try {
      setIsLoading(true)
      const response = await axios.get(`/orders/${id}`)
      setOrder(response.data)
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити деталі замовлення",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOrder = async () => {
    if (!id) return

    try {
      setIsRefreshing(true)
      const response = await axios.get(`/orders/${id}`)
      setOrder(response.data)

      toast({
        title: "Оновлено",
        description: "Інформацію про замовлення успішно оновлено",
      })
    } catch (error) {
      console.error("Error refreshing order:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити інформацію про замовлення",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchOrder()
    }
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500"
      case "Processing":
        return "bg-blue-500"
      case "Shipped":
        return "bg-purple-500"
      case "Delivered":
        return "bg-green-500"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "Pending":
        return "Очікує"
      case "Processing":
        return "Обробляється"
      case "Shipped":
        return "Відправлено"
      case "Delivered":
        return "Доставлено"
      case "Cancelled":
        return "Скасовано"
      default:
        return status
    }
  }

  const translatePaymentStatus = (status: string) => {
    switch (status) {
      case "Paid":
        return "Оплачено"
      case "Pending":
        return "Очікує оплати"
      case "Failed":
        return "Помилка оплати"
      default:
        return status
    }
  }

  const getDeliveryMethodName = (method: string) => {
    switch (method) {
      case "pickup":
        return "Самовивіз"
      case "courier":
        return "Кур'єр"
      case "novaPoshta":
        return "Нова Пошта"
      case "ukrPoshta":
        return "Укрпошта"
      default:
        return method
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "liqpay":
        return "LiqPay"
      case "cashOnDelivery":
        return "Оплата при отриманні"
      default:
        return method
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-64 bg-muted rounded mb-6"></div>
            </div>
            <div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Замовлення не знайдено</h1>
        <Button onClick={() => navigate("/orders")}>Повернутися до замовлень</Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Замовлення #{order._id.slice(-6)}</h1>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(order.status)}>{translateStatus(order.status)}</Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              {translatePaymentStatus(order.paymentStatus)}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrder}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Оновити
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Товари</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex gap-4 py-2 border-b last:border-0">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.product.image || "/placeholder.svg?height=80&width=80"}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium">
                        <h3>{item.product.name}</h3>
                        <p className="ml-4">{formatPrice(item.product.price)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Кількість: {item.amount}</p>
                      <p className="mt-1 text-sm font-medium">Сума: {formatPrice(item.product.price * item.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4 space-y-2">
                {order.subtotal !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span>Вартість товарів:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                )}
                {order.deliveryFee !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span>Вартість доставки:</span>
                    <span>{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "Безкоштовно"}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Загальна сума</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Інформація про доставку</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.deliveryMethod && (
                  <p>
                    <span className="font-medium">Спосіб доставки:</span> {getDeliveryMethodName(order.deliveryMethod)}
                  </p>
                )}

                {order.deliveryMethod === "pickup" ? (
                  // For pickup delivery method, show dashes instead of address details
                  <>
                    <p>
                      <span className="font-medium">Адреса:</span> -
                    </p>
                    <p>
                      <span className="font-medium">Місто:</span> -
                    </p>
                    <p>
                      <span className="font-medium">Поштовий індекс:</span> -
                    </p>
                  </>
                ) : (
                  // For all other delivery methods, show the address details
                  <>
                    <p>
                      <span className="font-medium">Адреса:</span> {order.shippingAddress.address}
                    </p>
                    <p>
                      <span className="font-medium">Місто:</span> {order.shippingAddress.city}
                    </p>
                    <p>
                      <span className="font-medium">Поштовий індекс:</span> {order.shippingAddress.postalCode}
                    </p>
                  </>
                )}

                <p>
                  <span className="font-medium">Телефон:</span> {order.shippingAddress.phone}
                </p>

                {/* Show Nova Poshta office only if delivery method is novaPoshta */}
                {order.deliveryMethod === "novaPoshta" && order.shippingAddress.novaPoshtaOffice && (
                  <p>
                    <span className="font-medium">Відділення Нової Пошти:</span> {order.shippingAddress.novaPoshtaOffice}
                  </p>
                )}

                {/* Show Ukr Poshta office only if delivery method is ukrPoshta */}
                {order.deliveryMethod === "ukrPoshta" && order.shippingAddress.ukrPoshtaOffice && (
                  <p>
                    <span className="font-medium">Відділення Укрпошти:</span> {order.shippingAddress.ukrPoshtaOffice}
                  </p>
                )}

                {order.notes && (
                  <p>
                    <span className="font-medium">Примітки:</span> {order.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Інформація про замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Номер замовлення:</span> #{order._id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Дата замовлення:</span> {formatDate(order.createdAt)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Останнє оновлення:</span> {formatDate(order.updatedAt)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Статус замовлення:</span>{" "}
                  <Badge className={getStatusColor(order.status)}>{translateStatus(order.status)}</Badge>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Спосіб оплати:</span>{" "}
                  {order.paymentMethod && getPaymentMethodName(order.paymentMethod)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Статус оплати:</span>{" "}
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {translatePaymentStatus(order.paymentStatus)}
                  </Badge>
                </p>
              </div>

              <div className="pt-4">
                <Link to="/orders">
                  <Button variant="outline" className="w-full">
                    Повернутися до замовлень
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage

