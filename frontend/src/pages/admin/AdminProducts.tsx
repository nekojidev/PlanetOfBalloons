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
  popular: boolean
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
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
    popular: false
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
        popular: product.popular
      })
      // Set image preview for existing product
      setImagePreview(product.image || null);
      // Reset image file when editing an existing product
      setImageFile(null);
    } else {
      setSelectedProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        stock: "",
        popular: false
      })
      // Clear image preview and file when creating a new product
      setImagePreview(null);
      setImageFile(null);
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
      await axios.delete(`/products/${selectedProduct._id}`)

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
    e.preventDefault();

    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category); // Ensure category ID is correctly sent
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('popular', formData.popular.toString());
      
      // If editing an existing product, append the ID
      if (formData.id) {
        formDataToSend.append('id', formData.id);
      }
      
      // If there's an image file selected, append it to the form data
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image) {
        // If using URL, just include it as a text field
        formDataToSend.append('image', formData.image);
      }

      // Log the form data to verify all fields are included (for debugging)
      console.log("Form data being sent:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      let response;
      
      if (selectedProduct) {
        // Update existing product
        response = await axios.patch(`/products/${selectedProduct._id}`, formDataToSend, config);
        const updatedProduct = response.data.product;
        
        // Ensure we update the complete product object with category information
        setProducts((prev) => prev.map((p) => 
          p._id === updatedProduct._id ? {
            ...updatedProduct,
            category: updatedProduct.category || p.category
          } : p
        ));

        toast({
          title: "Успішно",
          description: "Товар оновлено",
        });
      } else {
        // Create new product
        response = await axios.post("/products", formDataToSend, config);
        const newProduct = response.data.product;
        
        setProducts((prev) => [...prev, newProduct]);

        toast({
          title: "Успішно",
          description: "Товар створено",
        });
      }

      // Reset form and close dialog
      setIsDialogOpen(false);
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        stock: "",
        popular: false
      });
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти товар",
        variant: "destructive",
      });
    }
  }

  const handleTogglePopularity = async (product: Product) => {
    try {
      const response = await axios.patch(`/products/toggle-popular/${product._id}`);
      
      // Update the product in the local state
      setProducts((prev) => 
        prev.map((p) => 
          p._id === product._id ? { ...p, popular: response.data.popular } : p
        )
      );

      toast({
        title: "Успішно",
        description: response.data.popular 
          ? "Товар позначено як популярний" 
          : "Товар вилучено з популярних",
      });
    } catch (error) {
      console.error("Error toggling product popularity:", error);
      toast({
        title: "Помилка",
        description: "Не вдалося змінити статус популярності товару",
        variant: "destructive",
      });
    }
  };

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
                <TableHead>Популярний</TableHead>
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
                    <TableCell>
                      <span className={product.popular ? "text-green-600 font-medium" : "text-gray-500"}>
                        {product.popular ? "Так" : "Ні"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={product.popular ? "bg-green-50" : "bg-gray-50"}
                          onClick={() => handleTogglePopularity(product)}
                        >
                          {product.popular ? "Не популярний" : "Популярний"}
                        </Button>
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
                    <SelectContent className="bg-white" >
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
                <Label htmlFor="image">Зображення</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }} 
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Або вкажіть URL зображення
                    </p>
                    <Input 
                      id="image" 
                      name="image" 
                      value={formData.image} 
                      onChange={handleChange}
                      className="mt-2"
                      placeholder="https://example.com/image.jpg" 
                    />
                  </div>
                  <div className="flex items-center justify-center border rounded-md h-32">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : formData.image ? (
                      <img 
                        src={formData.image} 
                        alt="Current image" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Передперегляд зображення</p>
                    )}
                  </div>
                </div>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="popular">Популярний товар</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={formData.popular}
                      onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Популярні товари відображаються на головній сторінці
                </p>
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

