"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Order {
  _id: string
  orderItems: OrderItem[]
  totalPrice: number
  subtotal: number
  deliveryFee: number
  deliveryMethod: string
  paymentMethod: string
  status: string
  paymentStatus: string
  createdAt: string
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("/orders/user")
      setOrders(response.data)

      if (response.data.length === 0) {
        toast({
          title: "У вас ще немає замовлень",
          description: "Перегляньте наші товари та зробіть своє перше замовлення!",
          variant: 'default',
        })
      }

    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити замовлення",
        variant: "destructive",
        
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOrders = async () => {
    try {
      setIsRefreshing(true)
      const response = await axios.get("/orders/user")
      setOrders(response.data)
      
      toast({
        title: "Оновлено",
        description: "Список замовлень успішно оновлено",
      })
    } catch (error) {
      console.error("Error refreshing orders:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити замовлення",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [toast])

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
      case 'pickup':
        return 'Самовивіз';
      case 'courier':
        return 'Кур\'єр';
      case 'novaPoshta':
        return 'Нова Пошта';
      case 'ukrPoshta':
        return 'Укрпошта';
      default:
        return method;
    }
  }
  
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'liqpay':
        return 'LiqPay';
      case 'cashOnDelivery':
        return 'Оплата при отриманні';
      default:
        return method;
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Мої замовлення</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-1/3 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-1/4 bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Мої замовлення</h1>
        <p className="text-muted-foreground mb-8">У вас ще немає замовлень</p>
        <Link to="/products">
          <Button>Переглянути товари</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Мої замовлення</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshOrders} 
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Оновити
        </Button>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Замовлення #{order._id.slice(-6)}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(order.status)}>{translateStatus(order.status)}</Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {translatePaymentStatus(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Дата замовлення: {formatDate(order.createdAt)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 mb-1">
                  {order.deliveryMethod && (
                    <p className="text-sm">
                      <span className="font-medium">Доставка:</span> {getDeliveryMethodName(order.deliveryMethod)}
                    </p>
                  )}
                  {order.paymentMethod && (
                    <p className="text-sm">
                      <span className="font-medium">Оплата:</span> {getPaymentMethodName(order.paymentMethod)}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Кількість товарів:</span> {order.orderItems.reduce((acc, item) => acc + item.amount, 0)}
                  </p>
                  
                  <div className="space-y-1 mt-2 sm:mt-0 sm:text-right">
                    {order.subtotal !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">Товари:</span> {formatPrice(order.subtotal)}
                      </p>
                    )}
                    {order.deliveryFee !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">Доставка:</span> {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Безкоштовно'}
                      </p>
                    )}
                    <p className="font-medium">Загальна сума: {formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/orders/${order._id}`}>
                <Button variant="outline">Деталі замовлення</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default OrdersPage

