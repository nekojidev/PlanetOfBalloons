"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Bell, ArrowRight } from "lucide-react"

interface Announcement {
  _id: string
  title: string
  content: string
  image?: string
  startDate: string
  endDate: string
  isActive: boolean
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/announcements")

        // Filter active announcements
        const now = new Date()
        const activeAnnouncements = response.data.announcements.filter((announcement: Announcement) => {
          const startDate = new Date(announcement.startDate)
          const endDate = new Date(announcement.endDate)
          return announcement.isActive 
        })

        setAnnouncements(activeAnnouncements)
      } catch (error) {
        console.error("Error fetching announcements:", error)
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити оголошення",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [toast])

  // Function to check if announcement is new (within last 7 days)
  const isNewAnnouncement = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = now.getTime() - start.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }
  
  // Function to check if announcement is ending soon (within next 7 days)
  const isEndingSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 7 && diffDays > 0
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Оголошення та Новини</h1>
          <p className="text-muted-foreground max-w-2xl">
            Слідкуйте за нашими останніми оголошеннями, подіями та спеціальними пропозиціями
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="h-56 bg-muted"></div>
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-2/3 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Оголошення та Новини</h1>
          <p className="text-muted-foreground max-w-2xl">
            Слідкуйте за нашими останніми оголошеннями, подіями та спеціальними пропозиціями
          </p>
        </div>
        <Card className="max-w-md mx-auto p-8 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Немає активних оголошень</h3>
            <p className="text-muted-foreground">
              На даний момент немає активних оголошень. Заходьте пізніше для отримання останніх новин та акцій.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Оголошення та Новини</h1>
        <p className="text-muted-foreground max-w-2xl">
          Слідкуйте за нашими останніми оголошеннями, подіями та спеціальними пропозиціями
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {announcements.map((announcement, index) => (
          <Card 
            key={announcement._id} 
            className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-shadow duration-300"
          >
            {announcement.image && (
              <div className="relative h-56 overflow-hidden">
                {isNewAnnouncement(announcement.startDate) && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary/90 backdrop-blur-sm px-3 py-1">
                      НОВЕ
                    </Badge>
                  </div>
                )}
                {isEndingSoon(announcement.endDate) && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="destructive" className="px-3 py-1">
                      Закінчується скоро
                    </Badge>
                  </div>
                )}
                <img
                  src={announcement.image || "/placeholder.svg"}
                  alt={announcement.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                </span>
              </div>
              <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                {announcement.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="prose prose-sm max-w-none line-clamp-4">
                <p>{announcement.content}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button size="sm" className="ml-auto gap-1">
                <span>Детальніше</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AnnouncementsPage

