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
import { formatDate } from "@/lib/utils"
import { Edit, Trash2, Plus } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"

interface Product {
  _id: string
  name: string
  price: number
  image: string
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
}

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
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

  const handleProductsChange = (selectedProducts: string[]) => {
    setFormData((prev) => ({ ...prev, products: selectedProducts }))
  }

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

  const filteredPromotions = promotions.filter((promotion) =>
    promotion.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Управління акціями</h1>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Пошук акцій..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" /> Додати акцію
          </Button>
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
                <TableHead>Назва</TableHead>
                <TableHead>Знижка</TableHead>
                <TableHead>Період дії</TableHead>
                <TableHead>Товари</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Акції не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredPromotions.map((promotion) => (
                  <TableRow key={promotion._id}>
                    <TableCell className="font-medium">{promotion.title}</TableCell>
                    <TableCell>{promotion.discount}%</TableCell>
                    <TableCell>
                      {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                    </TableCell>
                    <TableCell>{promotion.products.length} товарів</TableCell>
                    <TableCell>
                      <span className={promotion.isActive ? "text-green-600" : "text-red-600"}>
                        {promotion.isActive ? "Активна" : "Неактивна"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleAddEdit(promotion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(promotion)}
                        >
                          <Trash2 className="h-4 w-4" />
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
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
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
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="products">Товари</Label>
                <MultiSelect
                  options={products.map((p) => ({ value: p._id, label: p.name }))}
                  selected={formData.products}
                  onChange={handleProductsChange}
                  placeholder="Виберіть товари"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
}

export default AdminPromotions

