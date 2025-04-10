"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/store/cartStore"
import { ShoppingCart, Clock, Tag, ArrowRight } from "lucide-react"

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
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { addItem } = useCartStore()

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/promotions")

        // Filter active promotions
        const now = new Date()
        const activePromotions = Array.isArray(response.data.promotions)
          ? response.data.promotions.filter((promotion: Promotion) => {
              const startDate = new Date(promotion.startDate)
              const endDate = new Date(promotion.endDate)
              return promotion.isActive 
            })
          : []

        setPromotions(activePromotions)
      } catch (error) {
        console.error("Error fetching promotions:", error)
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити акції",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotions()
  }, [toast])

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

  // Calculate time remaining until promotion ends

  // Calculate original price based on discount
  const getOriginalPrice = (discountedPrice: number, discountPercentage: number) => {
    return Math.round(discountedPrice / (1 - discountPercentage / 100))
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Акційні пропозиції</h1>
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-1/3 bg-muted rounded mb-4"></div>
              <div className="h-6 w-1/2 bg-muted rounded mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-64 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (promotions.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Акційні пропозиції</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">На даний момент немає активних акцій</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Акційні пропозиції</h1>
        <p className="text-muted-foreground max-w-2xl">
          Скористайтеся нашими спеціальними пропозиціями на повітряні кульки та аксесуари.
          Обмежена пропозиція — не пропустіть свою можливість заощадити!
        </p>
      </div>

      <div className="space-y-16">
        {promotions.map((promotion) => (
          <div key={promotion._id} className="bg-secondary/30 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-sm">-{promotion.discount}%</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Закінчується {formatDate(promotion.endDate)}
                  </Badge>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">{promotion.title}</h2>
                <p className="text-muted-foreground mt-2">{promotion.description}</p>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="text-lg px-3 py-1.5">
                  Економія до {promotion.discount}%
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {promotion.products.map((product) => {
                // Calculate the original price if not provided
                const originalPrice = product.originalPrice || getOriginalPrice(product.price, promotion.discount)
                
                return (
                  <Card key={product._id} className="group overflow-hidden border-2 hover:border-primary transition-all">
                    <div className="relative aspect-square overflow-hidden">
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-primary/90 backdrop-blur-sm">-{promotion.discount}%</Badge>
                      </div>
                      <img
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-lg text-primary">{formatPrice(product.price)}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="w-1/2 group-hover:border-primary" asChild>
                        <Link to={`/products/${product._id}`}>
                          <span>Деталі</span>
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button className="w-1/2" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        <span>В кошик</span>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromotionsPage