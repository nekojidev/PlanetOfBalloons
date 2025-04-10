"use client"

import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Star, Truck, Package, HeadphonesIcon, ThumbsUp } from "lucide-react"

interface Product {
  _id: string
  name: string
  price: number
  image: string
  description: string
  popular?: boolean
}

interface Announcement {
  _id: string
  title: string
  content: string
  image?: string
  startDate: string
  endDate: string
}

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [productsRes, announcementsRes] = await Promise.all([
          axios.get("/products/popular?limit=8"),
          axios.get("/announcements"),
        ])

        setPopularProducts(productsRes.data.products)
        setAnnouncements(announcementsRes.data.announcements)
      } catch (error) {
        console.error("Error fetching data:", error)
        try {
          const regularProductsRes = await axios.get("/products?limit=8")
          setPopularProducts(regularProductsRes.data.products)
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const nextSlide = () => {
    if (!sliderRef.current) return
    const maxSlides = Math.ceil(popularProducts.length / 4) - 1
    setActiveSlide(prev => prev < maxSlides ? prev + 1 : 0)
    sliderRef.current.scrollTo({
      left: sliderRef.current.offsetWidth * (activeSlide + 1),
      behavior: 'smooth'
    })
  }

  const prevSlide = () => {
    if (!sliderRef.current) return
    const maxSlides = Math.ceil(popularProducts.length / 4) - 1
    setActiveSlide(prev => prev > 0 ? prev - 1 : maxSlides)
    sliderRef.current.scrollTo({
      left: sliderRef.current.offsetWidth * (activeSlide - 1),
      behavior: 'smooth'
    })
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-secondary/30 py-24">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="/balloon-background.jpg" 
            alt="Balloons" 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="container relative z-10 flex flex-col items-center text-center">
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
            Створюємо святковий настрій з 2010 року
          </span>
          <h1 className="text-5xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl">
            Планета Кульок
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-secondary-foreground">
            Ваш надійний постачальник повітряних кульок та святкових аксесуарів для будь-якого свята.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <Link to="/products">
              <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                Каталог товарів
              </Button>
            </Link>
            <Link to="/promotions">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-white/80 backdrop-blur-sm">
                Акційні пропозиції
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Популярні товари</h2>
            <p className="text-muted-foreground mt-2">Найпопулярніші товари серед наших клієнтів</p>
          </div>
          <Link to="/products">
            <Button variant="link" className="text-lg">Переглянути всі</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <CardHeader>
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardFooter>
                  <div className="h-10 w-full bg-muted rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularProducts.length > 0 ? (
              popularProducts.slice(0, 8).map((product) => (
                <Link 
                  to={`/products/${product._id}`} 
                  key={product._id} 
                  className="group block"
                >
                  <Card className="h-full overflow-hidden border border-muted hover:border-primary transition-all duration-300 hover:shadow-md">
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 bg-primary text-white px-2 py-1 text-xs font-medium m-2 rounded-full">
                        Популярне
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-medium line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">{product.name}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-primary mt-1">
                        {formatPrice(product.price)}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4">
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Детальніше
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Наразі популярні товари не знайдено</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link to="/products">
            <Button variant="outline" size="lg" className="text-lg px-8 hover:bg-primary hover:text-white transition-colors">
              Переглянути весь каталог
            </Button>
          </Link>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="bg-gradient-to-b from-secondary/50 to-secondary/10 py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Оголошення та новини</h2>
            <p className="text-muted-foreground mb-8">Останні новини та спеціальні пропозиції нашого магазину</p>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {announcements.slice(0, 2).map((announcement) => (
                <Card key={announcement._id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all">
                  <div className="flex flex-col h-full">
                    {announcement.image && (
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={announcement.image || "/placeholder.svg"}
                          alt={announcement.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardHeader>
                        <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                        <CardDescription>
                          {new Date(announcement.startDate).toLocaleDateString('uk-UA')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3">{announcement.content}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline">Детальніше</Button>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {announcements.length > 2 && (
              <div className="mt-10 text-center">
                <Link to="/announcements">
                  <Button variant="outline" size="lg" className="px-8">
                    Всі оголошення та новини
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-2">Відгуки клієнтів</h2>
        <p className="text-muted-foreground text-center mb-12">Що кажуть наші клієнти про нас</p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              name: "Олена К.",
              text: "Чудовий магазин з великим вибором кульок. Замовляла оформлення на день народження доньки - все було ідеально!",
              rating: 5
            },
            {
              name: "Микола Т.",
              text: "Дуже швидка доставка і хороша якість. Кульки протрималися більше тижня, не лопнули і не здулися.",
              rating: 5
            },
            {
              name: "Ірина В.",
              text: "Замовляю тут вже втретє. Подобається обслуговування та асортимент. Рекомендую всім, хто шукає гарні кульки на свято.",
              rating: 4
            }
          ].map((review, i) => (
            <Card key={i} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 italic">"{review.text}"</p>
                <p className="font-semibold">{review.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-2">Чому обирають нас</h2>
        <p className="text-muted-foreground text-center mb-12">Переваги нашого магазину повітряних кульок</p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <ThumbsUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Якість</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ми пропонуємо тільки найякісніші повітряні кульки та аксесуари від перевірених виробників.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Асортимент</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Широкий вибір кульок різних форм, розмірів та кольорів для будь-якого свята чи події.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Доставка</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Швидка доставка по всій Україні. Замовлення в Києві доставляємо в день замовлення.</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <HeadphonesIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Підтримка</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Наші консультанти завжди готові допомогти з вибором та відповісти на всі ваші запитання.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Готові зробити ваше свято незабутнім?</h2>
          <p className="max-w-2xl text-xl mb-8">
            Замовляйте кульки та аксесуари для вашого свята вже зараз і отримайте незабутні враження!
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Перейти до каталогу
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage

