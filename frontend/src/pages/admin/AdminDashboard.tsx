"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatPrice, formatDate } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { 
  Users, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  RefreshCw, 
  Settings,
  LayoutDashboard, 
  Tags,
  ShoppingCart 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  paidOrders: number
  pendingOrders: number
  cancelledOrders: number
  ordersByStatus: {
    status: string
    count: number
    color: string
  }[]
  ordersByPayment: {
    method: string
    count: number
    color: string
  }[]
  ordersByDelivery: {
    method: string
    count: number
    color: string
  }[]
  recentOrders: {
    _id: string
    totalPrice: number
    status: string
    paymentStatus: string
    paymentMethod: string
    deliveryMethod: string
    createdAt: string
  }[]
  salesData: {
    name: string
    total: number
  }[]
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get("/users"),
        axios.get("/products"),
        axios.get("/orders"),
      ])

      const orders = ordersRes.data;

      const totalRevenue = orders.reduce((sum: number, order: any) => 
        order.paymentStatus === "Paid" ? sum + order.totalPrice : sum, 0);
      
      const orderStatuses: Record<string, number> = {};
      const paymentMethods: Record<string, number> = {};
      const deliveryMethods: Record<string, number> = {};
      
      let paidOrders = 0;
      let pendingOrders = 0;
      let cancelledOrders = 0;
      
      orders.forEach((order: any) => {
        orderStatuses[order.status] = (orderStatuses[order.status] || 0) + 1;
        
        if (order.paymentMethod) {
          paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
        }
        
        if (order.deliveryMethod) {
          deliveryMethods[order.deliveryMethod] = (deliveryMethods[order.deliveryMethod] || 0) + 1;
        }
        
        if (order.paymentStatus === "Paid") {
          paidOrders++;
        } else if (order.paymentStatus === "Pending") {
          pendingOrders++;
        }
        
        if (order.status === "Cancelled") {
          cancelledOrders++;
        }
      });
      
      const statusColors = {
        "Pending": "#FBBF24",
        "Processing": "#3B82F6",
        "Shipped": "#8B5CF6",
        "Delivered": "#10B981",
        "Cancelled": "#EF4444",
      };
      
      const paymentMethodColors = {
        "liqpay": "#1AAC18",
        "cashOnDelivery": "#6366F1",
      };
      
      const deliveryMethodColors = {
        "pickup": "#F59E0B",
        "courier": "#3B82F6",
        "novaPoshta": "#EC4899",
        "ukrPoshta": "#8B5CF6",
      };
      
      const ordersByStatus = Object.entries(orderStatuses).map(([status, count]) => ({
        status: getStatusName(status),
        count,
        color: statusColors[status as keyof typeof statusColors] || "#CBD5E1",
      }));
      
      const ordersByPayment = Object.entries(paymentMethods).map(([method, count]) => ({
        method: getPaymentMethodName(method),
        count,
        color: paymentMethodColors[method as keyof typeof paymentMethodColors] || "#CBD5E1",
      }));
      
      const ordersByDelivery = Object.entries(deliveryMethods).map(([method, count]) => ({
        method: getDeliveryMethodName(method),
        count,
        color: deliveryMethodColors[method as keyof typeof deliveryMethodColors] || "#CBD5E1",
      }));

      const monthlySales: Record<string, number> = {};
      const monthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
      
      orders.forEach((order: any) => {
        if (order.paymentStatus === "Paid") {
          const date = new Date(order.createdAt);
          const monthKey = date.getMonth();
          monthlySales[monthKey] = (monthlySales[monthKey] || 0) + order.totalPrice;
        }
      });
      
      const salesData = monthNames.map((name, index) => ({
        name,
        total: monthlySales[index] || 0
      }));

      setStats({
        totalUsers: usersRes.data.users.length,
        totalProducts: productsRes.data.products.length,
        totalOrders: orders.length,
        totalRevenue,
        paidOrders,
        pendingOrders,
        cancelledOrders,
        ordersByStatus,
        ordersByPayment,
        ordersByDelivery,
        recentOrders: orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
        salesData,
      })
      
      if (showRefreshToast) {
        toast({
          title: "Оновлено",
          description: "Дані панелі адміністратора успішно оновлено"
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити дані панелі адміністратора",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getStatusName = (status: string) => {
    switch (status) {
      case "Pending": return "Очікує";
      case "Processing": return "Обробляється";
      case "Shipped": return "Відправлено";
      case "Delivered": return "Доставлено";
      case "Cancelled": return "Скасовано";
      default: return status;
    }
  }
  
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "liqpay": return "LiqPay";
      case "cashOnDelivery": return "При отриманні";
      default: return method;
    }
  }
  
  const getDeliveryMethodName = (method: string) => {
    switch (method) {
      case "pickup": return "Самовивіз";
      case "courier": return "Кур'єр";
      case "novaPoshta": return "Нова Пошта";
      case "ukrPoshta": return "Укрпошта";
      default: return method;
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-500";
      case "Processing": return "bg-blue-500";
      case "Shipped": return "bg-purple-500";
      case "Delivered": return "bg-green-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  }
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      case "Failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  }
  
  const getPaymentStatusName = (status: string) => {
    switch (status) {
      case "Paid": return "Оплачено";
      case "Pending": return "Очікує оплати";
      case "Failed": return "Помилка оплати";
      default: return status;
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Панель адміністратора</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-1/3 bg-muted rounded"></div>
                <div className="h-8 w-8 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Помилка завантаження даних</h1>
        <p className="text-muted-foreground">Не вдалося завантажити дані панелі адміністратора</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Панель адміністратора</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Оновити дані
        </Button>
      </div>

      {/* Admin Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <Link to="/admin">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <LayoutDashboard className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium text-center">Головна</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/orders">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium text-center">Замовлення</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/products">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Package className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium text-center">Продукти</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Users className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium text-center">Користувачі</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/categories">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Tags className="h-8 w-8 mb-2 text-primary" />
              <p className="text-sm font-medium text-center">Категорії</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Користувачі</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Загальна кількість користувачів</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Товари</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Загальна кількість товарів</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Замовлення</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-600">{stats.paidOrders} оплачено</span>
              <span className="text-yellow-600">{stats.pendingOrders} очікують</span>
              <span className="text-red-600">{stats.cancelledOrders} скасовано</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Дохід</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Загальний дохід від оплачених замовлень</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Огляд продажів по місяцях</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₴${value}`}
                />
                <Tooltip formatter={(value) => [`₴${value}`, "Дохід"]} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Останні замовлення</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="pb-4 border-b last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium leading-none">Замовлення #{order._id.slice(-6)}</p>
                    <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusName(order.status)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {getPaymentStatusName(order.paymentStatus)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>
                      {order.deliveryMethod && getDeliveryMethodName(order.deliveryMethod)}{" / "}
                      {order.paymentMethod && getPaymentMethodName(order.paymentMethod)}
                    </div>
                    <div>{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Замовлення за статусом</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={stats.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {stats.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip formatter={(value, name) => [`${value} замовлень`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Замовлення за способом оплати</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={stats.ordersByPayment}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="method"
                  label={({ method, count }) => `${method}: ${count}`}
                >
                  {stats.ordersByPayment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip formatter={(value, name) => [`${value} замовлень`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Замовлення за способом доставки</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={stats.ordersByDelivery}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="method"
                  label={({ method, count }) => `${method}: ${count}`}
                >
                  {stats.ordersByDelivery.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                <Tooltip formatter={(value, name) => [`${value} замовлень`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard

