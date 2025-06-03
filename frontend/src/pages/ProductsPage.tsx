"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Search, Tag, ArrowRight, Package, SortAsc, SortDesc } from "lucide-react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  _id: string
  name: string
  price: number
  image: string
  description: string
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

type SortOption = "recommended" | "price-low-high" | "price-high-low" | "name-a-z" | "name-z-a" | "newest"

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>("recommended")
  const { addItem } = useCartStore()
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      product: product._id,
    })

    toast({
      title: "Товар додано до кошика",
      description: `${product.name} додано до вашого кошика`,
    })
  }

  // Sort and filter the products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory ? product.category?._id === selectedCategory : true
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low-high":
          return a.price - b.price
        case "price-high-low":
          return b.price - a.price
        case "name-a-z":
          return a.name.localeCompare(b.name)
        case "name-z-a":
          return b.name.localeCompare(a.name)
        case "newest":
          // Assuming newer products have higher IDs, or you could add a createdAt field
          return b._id.localeCompare(a._id)
        default:
          // "recommended" or any other value - use default sorting
          return 0
      }
    })

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Наші товари</h1>
        <p className="text-muted-foreground max-w-2xl">
          Широкий вибір повітряних кульок та аксесуарів для будь-якого свята чи події
        </p>
      </div>

      <div className="bg-secondary/30 rounded-xl p-6 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-1/3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Пошук товарів..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10"
            />
          </div>

          <div className="w-full md:w-1/4">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-full z-10 " >
                <SelectValue placeholder="Сортування" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="bg-white" >
                  <SelectLabel>Сортування товарів</SelectLabel>
                  <SelectItem value="recommended">Рекомендовані</SelectItem>
                  <SelectItem value="price-low-high">Ціна: від низької до високої</SelectItem>
                  <SelectItem value="price-high-low">Ціна: від високої до низької</SelectItem>
                  <SelectItem value="name-a-z">Назва: А-Я</SelectItem>
                  <SelectItem value="name-z-a">Назва: Я-А</SelectItem>
                  <SelectItem value="newest">Спочатку новіші</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            <Tag className="h-4 w-4 mr-1" />
            Всі категорії
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={selectedCategory === category._id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category._id)}
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden border rounded-xl">
              <div className="aspect-square bg-muted"></div>
              <CardHeader>
                <div className="h-5 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                <div className="h-5 w-1/3 bg-muted rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded mt-2"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-muted rounded mt-2"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-xl">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Товари не знайдено</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Спробуйте змінити параметри пошуку або вибрати іншу категорію
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product._id}
              className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary"
            >
              <div className="aspect-square overflow-hidden relative">
                {product.stock <= 5 && product.stock > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-amber-500/80 text-white backdrop-blur-sm">
                      Залишилось {product.stock} шт.
                    </Badge>
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="destructive" className="backdrop-blur-sm">
                      Немає в наявності
                    </Badge>
                  </div>
                )}
                <img
                  src={product.image || "/placeholder.svg?height=300&width=300"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category?.name}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1 mt-2 group-hover:text-primary transition-colors">
                  {product.name}
                </CardTitle>
                <p className="font-bold text-lg text-primary">{formatPrice(product.price)}</p>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardContent>
              <CardFooter className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-1/2 group-hover:border-primary" asChild>
                  <Link to={`/products/${product._id}`}>
                    <span>Деталі</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  className="w-1/2" 
                  onClick={() => handleAddToCart(product)} 
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  <span>{product.stock > 0 ? "В кошик" : "Немає в наявності"}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsPage

