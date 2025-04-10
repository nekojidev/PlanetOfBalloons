"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus } from "lucide-react"

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

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`/products/${id}`)
        setProduct(response.data.product)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити товар",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, toast])

  const handleQuantityChange = (value: number) => {
    if (value < 1) return
    if (product && value > product.stock) return
    setQuantity(value)
  }

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        product: product._id,
      })
    }

    toast({
      title: "Товар додано до кошика",
      description: `${product.name} (${quantity} шт.) додано до вашого кошика`,
    })
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded"></div>
              <div className="h-6 w-1/4 bg-muted rounded"></div>
              <div className="h-24 w-full bg-muted rounded"></div>
              <div className="h-10 w-full bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Товар не знайдено</h1>
        <Button onClick={() => navigate("/products")}>Повернутися до товарів</Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="overflow-hidden rounded-lg border">
          <img
            src={product.image || "/placeholder.svg?height=600&width=600"}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.category?.name}</p>
          </div>

          <div className="text-2xl font-bold">{formatPrice(product.price)}</div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Наявність:</div>
                <div className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                  {product.stock > 0 ? `В наявності (${product.stock} шт.)` : "Немає в наявності"}
                </div>
              </div>
            </CardContent>
          </Card>

          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 text-center">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button className="w-full" size="lg" onClick={handleAddToCart}>
                Додати до кошика
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

