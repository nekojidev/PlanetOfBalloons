"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowLeft, Clock, Share2 } from "lucide-react"

interface Announcement {
  _id: string
  title: string
  content: string
  image?: string
  startDate: string
  endDate: string
  isActive: boolean
}

const AnnouncementsDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!id) {
          throw new Error("Announcement ID is missing")
        }

        const response = await axios.get(`/announcements/${id}`)
        setAnnouncement(response.data.announcement)
      } catch (err) {
        console.error("Error fetching announcement details:", err)
        setError("Не вдалося завантажити інформацію про оголошення")
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити інформацію про оголошення",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncementDetails()
  }, [id, toast])

  // Function to check if announcement is active
  const isActive = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
  }

  // Function to check if announcement is new (within last 7 days)
  const isNewAnnouncement = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = now.getTime() - start.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }
  
  // Function to calculate days remaining until end date
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Share announcement function
  const shareAnnouncement = () => {
    if (navigator.share) {
      navigator.share({
        title: announcement?.title || "Оголошення з Планета Кульок",
        text: announcement?.content || "Перегляньте це оголошення на сайті Планета Кульок",
        url: window.location.href,
      })
      .catch((error) => {
        console.error("Error sharing:", error)
      })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Посилання скопійовано",
          description: "Посилання на оголошення скопійовано в буфер обміну",
          duration: 3000,
        })
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link to="/announcements">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> До оголошень
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-4 mb-2">
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-[300px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link to="/announcements">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> До оголошень
            </Button>
          </Link>
        </div>
        
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Оголошення не знайдено</h2>
            <p className="text-muted-foreground mb-6">
              {error || "Не вдалося знайти оголошення. Воно могло бути видалено або термін його дії закінчився."}
            </p>
            <Button asChild>
              <Link to="/announcements">
                Переглянути всі оголошення
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining(announcement.endDate)
  const isCurrentlyActive = isActive(announcement.startDate, announcement.endDate)

  return (
    <div className="container max-w-4xl py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/announcements">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> До оголошень
          </Button>
        </Link>
      </div>
      
      <Card className="overflow-hidden border shadow-lg">
        {/* Header with title and date */}
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <CardDescription className="text-sm">
                  {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                </CardDescription>
              </div>
              <CardTitle className="text-3xl font-bold">{announcement.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              {isNewAnnouncement(announcement.startDate) && (
                <Badge className="bg-primary">НОВЕ</Badge>
              )}
              {!isCurrentlyActive && (
                <Badge variant="outline" className="border-muted-foreground">
                  Неактивне
                </Badge>
              )}
              {isCurrentlyActive && daysRemaining <= 7 && (
                <Badge variant="destructive">
                  Закінчується через {daysRemaining} {daysRemaining === 1 ? 'день' : 'днів'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Image */}
        {announcement.image && (
          <div className="relative">
            <img 
              src={announcement.image} 
              alt={announcement.title} 
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <CardContent className="pt-6">
          <div className="prose prose-lg max-w-none">
            {/* Split content by paragraphs for better formatting */}
            {announcement.content.split('\n').map((paragraph, index) => (
              <p key={index} className={index === 0 ? "text-lg" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {isCurrentlyActive ? (
                <span className="text-sm text-muted-foreground">
                  {daysRemaining > 0 
                    ? `Актуально ще ${daysRemaining} ${daysRemaining === 1 ? 'день' : 'днів'}`
                    : 'Закінчується сьогодні'}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Оголошення неактивне</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={shareAnnouncement}>
              <Share2 className="h-4 w-4" />
              Поділитися
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Related announcements could be added here in the future */}
    </div>
  )
}

export default AnnouncementsDetailPage