"use client"

import type React from "react"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatPrice } from "@/lib/utils"
import { Edit, Trash2, Plus, ChevronUp, ChevronDown, Eye, Search, RefreshCw, Calendar, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
// Removed unused import

interface Product {
  _id: string
  name: string
  price: number
  image: string
  originalPrice?: number
}

interface Promotion {
  _id: string
  title: string
  description: string
  discount: number
  products: Product[]
  startDate: string
  endDate: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

type SortField = 'title' | 'discount' | 'startDate' | 'endDate' | 'isActive' | 'productsCount';
type SortDirection = 'asc' | 'desc';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('startDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    discount: "",
    products: [] as string[],
    startDate: "",
    endDate: "",
    isActive: true,
  })
  const { toast } = useToast()

  const [isAddProductsDialogOpen, setIsAddProductsDialogOpen] = useState(false)
  const [addProductsFormData, setAddProductsFormData] = useState({
    products: [] as string[],
  })
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [promotionsRes, productsRes] = await Promise.all([
          axios.get("/promotions"),
          axios.get("/products?limit=100"),
        ])

        setPromotions(promotionsRes.data.promotions)
        setProducts(productsRes.data.products)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити дані",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleCheckboxChange = (productId: string) => {
    setFormData((prev) => {
      const isSelected = prev.products.includes(productId);
      const updatedProducts = isSelected
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId];
      return { ...prev, products: updatedProducts };
    });
  };

  const handleAddCheckboxChange = (productId: string) => {
    setAddProductsFormData((prev) => {
      const isSelected = prev.products.includes(productId);
      const updatedProducts = isSelected
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId];
      return { ...prev, products: updatedProducts };
    });
  };

  const handleAddEdit = (promotion?: Promotion) => {
    if (promotion) {
      setSelectedPromotion(promotion)
      setFormData({
        id: promotion._id,
        title: promotion.title,
        description: promotion.description,
        discount: promotion.discount.toString(),
        products: promotion.products.map((p) => p._id),
        startDate: new Date(promotion.startDate).toISOString().split("T")[0],
        endDate: new Date(promotion.endDate).toISOString().split("T")[0],
        isActive: promotion.isActive,
      })
    } else {
      setSelectedPromotion(null)
      const today = new Date().toISOString().split("T")[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      setFormData({
        id: "",
        title: "",
        description: "",
        discount: "",
        products: [],
        startDate: today,
        endDate: nextMonth.toISOString().split("T")[0],
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleDelete = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPromotion) return

    try {
      await axios.delete(`/promotions/${selectedPromotion._id}`)

      setPromotions((prev) => prev.filter((p) => p._id !== selectedPromotion._id))

      toast({
        title: "Успішно",
        description: "Акцію видалено",
      })
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити акцію",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description,
        discount: Number.parseFloat(formData.discount),
        products: formData.products,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      }

      if (selectedPromotion) {
        // Update existing promotion
        const response = await axios.put(`/promotions/${selectedPromotion._id}`, promotionData)

        setPromotions((prev) => prev.map((p) => (p._id === response.data.promotion._id ? response.data.promotion : p)))

        toast({
          title: "Успішно",
          description: "Акцію оновлено",
        })
      } else {
        // Create new promotion
        const response = await axios.post("/promotions", promotionData)

        setPromotions((prev) => [...prev, response.data.promotion])

        toast({
          title: "Успішно",
          description: "Акцію створено",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving promotion:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти акцію",
        variant: "destructive",
      })
    }
  }

  const refreshData = async () => {
    try {
      setIsRefreshing(true)
      const [promotionsRes, productsRes] = await Promise.all([
        axios.get("/promotions"),
        axios.get("/products?limit=100"),
      ])

      setPromotions(promotionsRes.data.promotions)
      setProducts(productsRes.data.products)
      
      toast({
        title: "Успішно",
        description: "Дані оновлено",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити дані",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleViewDetails = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsDetailsDialogOpen(true)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const openAddProductsDialog = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setAddProductsFormData({
      products: [],
    })
    setIsAddProductsDialogOpen(true)
  }

  const handleAddProductsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPromotion) return
    
    try {
      // Filter out products that are already in the promotion
      const existingProductIds = selectedPromotion.products.map(p => p._id)
      const newProducts = addProductsFormData.products.filter(id => !existingProductIds.includes(id))
      
      if (newProducts.length === 0) {
        toast({
          title: "Увага",
          description: "Виберіть товари, які ще не додані до цієї акції",
          variant: "destructive",
        })
        return
      }
      
      const response = await axios.post(`/promotions/${selectedPromotion._id}/products`, {
        products: newProducts,
      })
      
      // Refresh the promotions list
      await refreshData()
      
      toast({
        title: "Успішно",
        description: `${newProducts.length} товарів додано до акції`,
      })
      
      setIsAddProductsDialogOpen(false)
    } catch (error) {
      console.error("Error adding products to promotion:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося додати товари до акції",
        variant: "destructive",
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setAddProductsFormData({ products: products.map((product) => product._id) });
    } else {
      setAddProductsFormData({ products: [] });
    }
  };

  const handleClearSelection = () => {
    setAddProductsFormData({ products: [] });
    setSelectAll(false);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting and filtering
  const filteredPromotions = promotions
    .filter((promotion) => {
      // Apply text search filter
      const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Apply status filter
      if (statusFilter === "all") return matchesSearch
      if (statusFilter === "active") return matchesSearch && promotion.isActive
      if (statusFilter === "inactive") return matchesSearch && !promotion.isActive
      if (statusFilter === "ending-soon") {
        const endDate = new Date(promotion.endDate)
        const today = new Date()
        const daysDifference = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return matchesSearch && promotion.isActive && daysDifference <= 7
      }
      
      return matchesSearch
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      }
      if (sortField === 'discount') {
        return sortDirection === 'asc' 
          ? a.discount - b.discount
          : b.discount - a.discount
      }
      if (sortField === 'startDate') {
        return sortDirection === 'asc' 
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      }
      if (sortField === 'endDate') {
        return sortDirection === 'asc' 
          ? new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
          : new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      }
      if (sortField === 'isActive') {
        return sortDirection === 'asc' 
          ? (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1)
          : (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1)
      }
      if (sortField === 'productsCount') {
        return sortDirection === 'asc' 
          ? a.products.length - b.products.length
          : b.products.length - a.products.length
      }
      return 0
    })
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPromotions = filteredPromotions.slice(startIndex, startIndex + itemsPerPage)

  // Function to format date with remaining days
  const formatDateWithRemaining = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const daysDifference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDifference < 0) {
      return `${formatDate(dateString)} (закінчилась)`
    } else if (daysDifference === 0) {
      return `${formatDate(dateString)} (сьогодні)`
    } else if (daysDifference === 1) {
      return `${formatDate(dateString)} (завтра)`
    } else {
      return `${formatDate(dateString)} (${daysDifference} днів)`
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Управління акціями</h1>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук акцій..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" /> Додати акцію
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label htmlFor="status-filter" className="whitespace-nowrap">Статус:</Label>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger id="status-filter" className="w-full sm:w-[180px]">
              <SelectValue placeholder="Всі акції" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі акції</SelectItem>
              <SelectItem value="active">Активні</SelectItem>
              <SelectItem value="inactive">Неактивні</SelectItem>
              <SelectItem value="ending-soon">Закінчуються скоро</SelectItem>
              </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Label htmlFor="items-per-page">Показати:</Label>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger id="items-per-page" className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">
                      Назва
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('discount')}>
                    <div className="flex items-center gap-1">
                      Знижка
                      {sortField === 'discount' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('endDate')}>
                    <div className="flex items-center gap-1">
                      Період дії
                      {sortField === 'endDate' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('productsCount')}>
                    <div className="flex items-center gap-1">
                      Товари
                      {sortField === 'productsCount' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('isActive')}>
                    <div className="flex items-center gap-1">
                      Статус
                      {sortField === 'isActive' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Акції не знайдено
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPromotions.map((promotion) => {
                    // Calculate if promo is ending soon (within a week)
                    const endDate = new Date(promotion.endDate)
                    const today = new Date()
                    const isEndingSoon = promotion.isActive && 
                      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 7 &&
                      endDate > today
                    
                    return (
                      <TableRow key={promotion._id} className={isEndingSoon ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                        <TableCell className="font-medium">
                          {promotion.title}
                          {isEndingSoon && (
                            <Badge variant="outline" className="ml-2 text-amber-600 border-amber-600">Закінчується скоро</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge>{promotion.discount}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>З: {formatDate(promotion.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>До: {formatDateWithRemaining(promotion.endDate)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{promotion.products.length} товарів</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 items-center">
                            <div className={`h-2 w-2 rounded-full ${promotion.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={promotion.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                              {promotion.isActive ? "Активна" : "Неактивна"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleViewDetails(promotion)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openAddProductsDialog(promotion)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleAddEdit(promotion)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(promotion)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {filteredPromotions.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Показано {Math.min(filteredPromotions.length, startIndex + 1)}-
                {Math.min(filteredPromotions.length, startIndex + itemsPerPage)} з {filteredPromotions.length} акцій
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Перша
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Назад
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  <span className="text-sm">Сторінка {currentPage} з {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Вперед
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Остання
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Promotion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPromotion ? "Редагувати акцію" : "Додати нову акцію"}</DialogTitle>
            <DialogDescription>
              {selectedPromotion
                ? "Внесіть зміни до акції та натисніть Зберегти"
                : "Заповніть форму, щоб додати нову акцію"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Назва</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Введіть назву акції"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Опишіть деталі акції"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Знижка (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="Введіть відсоток знижки"
                  required
                />
                {Number(formData.discount) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    При знижці {formData.discount}% товар вартістю 1000₴ буде коштувати {1000 - 1000 * Number(formData.discount) / 100}₴
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Товари</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {products.map((product) => (
                    <div key={product._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`product-${product._id}`}
                        checked={formData.products.includes(product._id)}
                        onChange={() => handleCheckboxChange(product._id)}
                      />
                      <label htmlFor={`product-${product._id}`} className="text-sm">
                        {product.name}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.products.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Вибрано {formData.products.length} товарів
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Дата початку</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Дата закінчення</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isActive">Активна</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit">Зберегти</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Підтвердження видалення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити акцію "{selectedPromotion?.title}"? Це також скасує знижки на всі товари в
              цій акції. Цю дію неможливо скасувати.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedPromotion && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Деталі акції</span>
                  <Badge variant={selectedPromotion.isActive ? "default" : "secondary"}>
                    {selectedPromotion.isActive ? "Активна" : "Неактивна"}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedPromotion.title}</h3>
                  <p className="text-muted-foreground mt-1">{selectedPromotion.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Розмір знижки</p>
                    <p className="text-2xl font-semibold text-primary">{selectedPromotion.discount}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Кількість товарів</p>
                    <p className="text-2xl font-semibold">{selectedPromotion.products.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Дата початку</p>
                    <p>{formatDate(selectedPromotion.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Дата закінчення</p>
                    <p>{formatDateWithRemaining(selectedPromotion.endDate)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Товари в акції</h4>
                  
                  {selectedPromotion.products.length === 0 ? (
                    <p className="text-muted-foreground">Немає товарів у цій акції</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPromotion.products.map((product) => {
                        const originalPrice = product.originalPrice || (product.price / (1 - selectedPromotion.discount / 100));
                        
                        return (
                          <div key={product._id} className="flex gap-3 border rounded-md p-3 items-center">
                            <div className="h-16 w-16 overflow-hidden rounded-md flex-shrink-0 bg-secondary/30">
                              {product.image && (
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <div className="flex gap-2 items-center mt-1">
                                <span className="text-primary font-semibold">{formatPrice(product.price)}</span>
                                <span className="text-muted-foreground line-through text-sm">{formatPrice(originalPrice)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6 gap-2">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Закрити
                </Button>
                <Button onClick={() => {
                  setIsDetailsDialogOpen(false)
                  handleAddEdit(selectedPromotion)
                }}>
                  Редагувати
                </Button>
                <Button onClick={() => {
                  setIsDetailsDialogOpen(false)
                  openAddProductsDialog(selectedPromotion)
                }}>
                  Додати товари
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Products to Promotion Dialog */}
      <Dialog open={isAddProductsDialogOpen} onOpenChange={setIsAddProductsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Додати товари до акції</DialogTitle>
            <DialogDescription>
              Виберіть товари, які ви хочете додати до акції "{selectedPromotion?.title}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProductsSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Пошук товарів</Label>
                <Input
                  type="text"
                  placeholder="Пошук за назвою..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Button variant="outline" onClick={handleSelectAll}>
                  {selectAll ? "Скасувати вибір всіх" : "Вибрати всі"}
                </Button>
                <Button variant="outline" onClick={handleClearSelection}>
                  Очистити вибір
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`add-product-${product._id}`}
                      checked={addProductsFormData.products.includes(product._id)}
                      onChange={() => handleAddCheckboxChange(product._id)}
                    />
                    <label htmlFor={`add-product-${product._id}`} className="text-sm">
                      {product.name}
                    </label>
                  </div>
                ))}
              </div>
              {addProductsFormData.products.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Вибрані товари</h4>
                  <ul className="list-disc pl-5">
                    {addProductsFormData.products.map((productId) => {
                      const product = products.find((p) => p._id === productId);
                      return product ? <li key={productId}>{product.name}</li> : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddProductsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit">Додати</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPromotions

