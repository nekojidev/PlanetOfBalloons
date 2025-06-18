"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatPrice } from "@/lib/utils"
import { Eye, Search } from "lucide-react"
import { Link } from "react-router-dom"

interface OrderItem {
  product: {
    _id: string
    name: string
    price: number
    image?: string
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
  user: {
    _id: string
    name: string
    email: string
  }
  orderItems: OrderItem[]
  shippingAddress: ShippingAddress
  totalPrice: number
  subtotal: number
  deliveryFee: number
  status: string
  paymentStatus: string
  deliveryMethod: string
  paymentMethod: string
  notes?: string
  createdAt: string
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isPaymentUpdateDialogOpen, setIsPaymentUpdateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [newPaymentStatus, setNewPaymentStatus] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/orders")
        setOrders(response.data)
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

    fetchOrders()
  }, [toast])

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setIsUpdateDialogOpen(true)
  }

  const handleUpdatePaymentStatus = (order: Order) => {
    setSelectedOrder(order)
    setNewPaymentStatus(order.paymentStatus)
    setIsPaymentUpdateDialogOpen(true)
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const confirmUpdateStatus = async () => {
    if (!selectedOrder) return

    try {
      const response = await axios.patch(`/orders/${selectedOrder._id}`, {
        status: newStatus,
      })

      setOrders((prev) =>
        prev.map((o) => (o._id === selectedOrder._id ? { ...o, status: response.data.order.status } : o)),
      )

      toast({
        title: "Успішно",
        description: "Статус замовлення оновлено",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус замовлення",
        variant: "destructive",
      })
    } finally {
      setIsUpdateDialogOpen(false)
    }
  }

  const confirmUpdatePaymentStatus = async () => {
    if (!selectedOrder) return

    try {
      const response = await axios.patch(`/orders/${selectedOrder._id}`, {
        paymentStatus: newPaymentStatus,
      })

      setOrders((prev) =>
        prev.map((o) => (o._id === selectedOrder._id ? { ...o, paymentStatus: response.data.order.paymentStatus } : o)),
      )

      toast({
        title: "Успішно",
        description: "Статус оплати оновлено",
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус оплати",
        variant: "destructive",
      })
    } finally {
      setIsPaymentUpdateDialogOpen(false)
    }
  }

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Управління замовленнями</h1>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук замовлень..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Фільтр за статусом" />
            </SelectTrigger>
            <SelectContent className="bg-white" >
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="Pending">Очікує</SelectItem>
              <SelectItem value="Processing">Обробляється</SelectItem>
              <SelectItem value="Shipped">Відправлено</SelectItem>
              <SelectItem value="Delivered">Доставлено</SelectItem>
              <SelectItem value="Cancelled">Скасовано</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded mb-2"></div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Клієнт</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Сума</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Замовлення не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order._id.slice(-6)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.user?.name || 'user'}</p>
                        <p className="text-sm text-muted-foreground">{order.user?.email || 'test@gmail.com' }</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatPrice(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>{translateStatus(order.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {translatePaymentStatus(order.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => handleUpdateStatus(order)}>
                          Змінити статус
                        </Button>
                        <Button variant="outline" onClick={() => handleUpdatePaymentStatus(order)}>
                          Статус оплати
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Оновити статус замовлення</DialogTitle>
            <DialogDescription>Змініть статус замовлення #{selectedOrder?._id.slice(-6)}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Виберіть статус" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white " >
                <SelectItem value="Pending">Очікує</SelectItem>
                <SelectItem value="Processing">Обробляється</SelectItem>
                <SelectItem value="Shipped">Відправлено</SelectItem>
                <SelectItem value="Delivered">Доставлено</SelectItem>
                <SelectItem value="Cancelled">Скасовано</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={confirmUpdateStatus}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі замовлення #{selectedOrder?._id.slice(-6)}</DialogTitle>
            <DialogDescription>Створено: {selectedOrder && formatDate(selectedOrder.createdAt)}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Інформація про клієнта</h3>
                {selectedOrder && (
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Ім'я:</span> {selectedOrder.user.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedOrder.user.email}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Статус замовлення</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder && (
                    <>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {translateStatus(selectedOrder.status)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {translatePaymentStatus(selectedOrder.paymentStatus)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedOrder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Спосіб доставки</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Метод:</span> {getDeliveryMethodName(selectedOrder.deliveryMethod)}
                    </p>
                    <p>
                      <span className="font-medium">Адреса:</span> {selectedOrder.shippingAddress.address}
                    </p>
                    <p>
                      <span className="font-medium">Місто:</span> {selectedOrder.shippingAddress.city}
                    </p>
                    <p>
                      <span className="font-medium">Індекс:</span> {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>
                      <span className="font-medium">Телефон:</span> {selectedOrder.shippingAddress.phone}
                    </p>
                    {selectedOrder.shippingAddress.novaPoshtaOffice && (
                      <p>
                        <span className="font-medium">Відділення Нової Пошти:</span> {selectedOrder.shippingAddress.novaPoshtaOffice}
                      </p>
                    )}
                    {selectedOrder.shippingAddress.ukrPoshtaOffice && (
                      <p>
                        <span className="font-medium">Відділення Укрпошти:</span> {selectedOrder.shippingAddress.ukrPoshtaOffice}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Оплата</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Метод оплати:</span> {getPaymentMethodName(selectedOrder.paymentMethod)}
                    </p>
                    <p>
                      <span className="font-medium">Статус оплати:</span> {translatePaymentStatus(selectedOrder.paymentStatus)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedOrder?.notes && (
              <div>
                <h3 className="text-lg font-medium mb-2">Примітки до замовлення</h3>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedOrder.notes}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-2">Товари</h3>
              <div className="space-y-2 border rounded-md p-3">
                {selectedOrder?.orderItems && selectedOrder.orderItems.length > 0 ? (
                  selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-0">
                      <div className="flex gap-3">
                        {item && item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item ? item.name : "Невідомий товар"}</p>
                          <p className="text-sm text-muted-foreground">Кількість: {item.amount}</p>
                          <p className="text-xs text-muted-foreground">ID продукту: {item && typeof item === 'object' ? item._id.slice(-6) : String(item).slice(-6)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>{item ? formatPrice(item.price) : "-"}</p>
                        <p className="font-medium">{item ? formatPrice(item.price * item.amount) : "-"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Немає товарів у замовленні</p>
                )}
              </div>
              
              {selectedOrder && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <p>Вартість товарів:</p>
                    <p>{formatPrice(selectedOrder.subtotal)}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p>Доставка:</p>
                    <p>{selectedOrder.deliveryFee > 0 ? formatPrice(selectedOrder.deliveryFee) : 'Безкоштовно'}</p>
                  </div>
                  <div className="flex justify-between font-medium mt-2">
                    <p>Загальна сума:</p>
                    <p>{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Закрити
            </Button>
            <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrder!)}>
              Змінити статус
            </Button>
            <Button variant="outline" onClick={() => handleUpdatePaymentStatus(selectedOrder!)}>
              Статус оплати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payment Status Dialog */}
      <Dialog open={isPaymentUpdateDialogOpen} onOpenChange={setIsPaymentUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Оновити статус оплати</DialogTitle>
            <DialogDescription>Змініть статус оплати для замовлення #{selectedOrder?._id.slice(-6)}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Виберіть статус оплати" />
              </SelectTrigger>
              <SelectContent className="bg-white" >
                <SelectItem value="Pending">Очікує оплати</SelectItem>
                <SelectItem value="Paid">Оплачено</SelectItem>
                <SelectItem value="Failed">Помилка оплати</SelectItem>
                <SelectItem value="Refunded">Повернуто</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentUpdateDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={confirmUpdatePaymentStatus}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminOrders

