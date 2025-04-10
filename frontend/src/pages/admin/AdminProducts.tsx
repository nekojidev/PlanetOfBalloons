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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"
import { Edit, Trash2, Plus } from "lucide-react"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: {
    _id: string
    name: string
  }
  stock: number
}

interface Category {
  _id: string
  name: string
  description: string
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get("/products?limit=100"),
          axios.get("/categories"),
        ])

        setProducts(productsRes.data.products)
        setCategories(categoriesRes.data.categories)
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddEdit = (product?: Product) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image || "",
        category: product.category?._id || "",
        stock: product.stock.toString(),
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        id: "",
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        stock: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    try {
      await axios.delete("/products", { data: { id: selectedProduct._id } })

      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id))

      toast({
        title: "Успішно",
        description: "Товар видалено",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити товар",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const productData = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        stock: Number.parseInt(formData.stock),
      }

      if (selectedProduct) {
        // Update existing product
        const response = await axios.put("/products", productData)

        setProducts((prev) => prev.map((p) => (p._id === response.data.product._id ? response.data.product : p)))

        toast({
          title: "Успішно",
          description: "Товар оновлено",
        })
      } else {
        // Create new product
        const response = await axios.post("/products", productData)

        setProducts((prev) => [...prev, response.data.product])

        toast({
          title: "Успішно",
          description: "Товар створено",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти товар",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Управління товарами</h1>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Пошук товарів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" /> Додати товар
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
                <TableHead>Зображення</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>Ціна</TableHead>
                <TableHead>Наявність</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Товари не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img
                          src={product.image || "/placeholder.svg?height=48&width=48"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || "Без категорії"}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                        {product.stock > 0 ? `${product.stock} шт.` : "Немає в наявності"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleAddEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Редагувати товар" : "Додати новий товар"}</DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? "Внесіть зміни до товару та натисніть Зберегти"
                : "Заповніть форму, щоб додати новий товар"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категорія</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть категорію" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Ціна</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Наявність (шт.)</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL зображення</Label>
                <Input id="image" name="image" value={formData.image} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
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
              Ви впевнені, що хочете видалити товар "{selectedProduct?.name}"? Цю дію неможливо скасувати.
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

export default AdminProducts

