"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
import { Edit, Trash2, Plus, Upload, X } from "lucide-react"

interface Announcement {
  _id: string
  title: string
  content: string
  image?: string
  startDate: string
  endDate: string
  isActive: boolean
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    image: "",
    startDate: "",
    endDate: "",
    isActive: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/announcements")
        setAnnouncements(response.data.announcements)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: "Помилка",
          description: "Розмір зображення не повинен перевищувати 2MB",
          variant: "destructive",
        })
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Помилка",
          description: "Будь ласка, завантажте зображення",
          variant: "destructive",
        })
        return
      }
      
      setImageFile(file)
      
      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    
    // Only clear the image URL if we're not editing an existing announcement
    // or if explicitly removing the image from an existing announcement
    if (!selectedAnnouncement) {
      setFormData((prev) => ({ ...prev, image: "" }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleAddEdit = (announcement?: Announcement) => {
    if (announcement) {
      setSelectedAnnouncement(announcement)
      setFormData({
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        image: announcement.image || "",
        startDate: new Date(announcement.startDate).toISOString().split("T")[0],
        endDate: new Date(announcement.endDate).toISOString().split("T")[0],
        isActive: announcement.isActive,
      })
      
      // Set image preview if there's an existing image
      if (announcement.image) {
        setImagePreview(announcement.image)
      } else {
        setImagePreview(null)
      }
      
      setImageFile(null)
    } else {
      setSelectedAnnouncement(null)
      const today = new Date().toISOString().split("T")[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      setFormData({
        id: "",
        title: "",
        content: "",
        image: "",
        startDate: today,
        endDate: nextMonth.toISOString().split("T")[0],
        isActive: true,
      })
      
      setImagePreview(null)
      setImageFile(null)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedAnnouncement) return

    try {
      await axios.delete(`/announcements/${selectedAnnouncement._id}`)

      setAnnouncements((prev) => prev.filter((a) => a._id !== selectedAnnouncement._id))

      toast({
        title: "Успішно",
        description: "Оголошення видалено",
      })
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити оголошення",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("startDate", formData.startDate)
      formDataToSend.append("endDate", formData.endDate)
      formDataToSend.append("isActive", formData.isActive.toString())
      
      // If no new image file but there's existing image URL, keep it
      if (!imageFile && formData.image) {
        formDataToSend.append("image", formData.image)
      }
      
      // If there's a new image file, append it
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      let response
      if (selectedAnnouncement) {
        // Update existing announcement
        response = await axios.put(
          `/announcements/${selectedAnnouncement._id}`, 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        setAnnouncements((prev) =>
          prev.map((a) => (a._id === response.data.announcement._id ? response.data.announcement : a)),
        )

        toast({
          title: "Успішно",
          description: "Оголошення оновлено",
        })
      } else {
        // Create new announcement
        response = await axios.post(
          "/announcements", 
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        setAnnouncements((prev) => [...prev, response.data.announcement])

        toast({
          title: "Успішно",
          description: "Оголошення створено",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving announcement:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти оголошення",
        variant: "destructive",
      })
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Управління оголошеннями</h1>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Пошук оголошень..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" /> Додати оголошення
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
                <TableHead>Заголовок</TableHead>
                <TableHead>Період дії</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Оголошення не знайдено
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement._id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      {formatDate(announcement.startDate)} - {formatDate(announcement.endDate)}
                    </TableCell>
                    <TableCell>
                      <span className={announcement.isActive ? "text-green-600" : "text-red-600"}>
                        {announcement.isActive ? "Активне" : "Неактивне"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleAddEdit(announcement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(announcement)}
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

      {/* Add/Edit Announcement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement ? "Редагувати оголошення" : "Додати нове оголошення"}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement
                ? "Внесіть зміни до оголошення та натисніть Зберегти"
                : "Заповніть форму, щоб додати нове оголошення"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Зміст</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Зображення (необов'язково)</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      name="imageUpload"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Завантажити зображення
                    </Button>
                    {(imagePreview || imageFile) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Попередній перегляд" 
                        className="max-h-48 rounded-md object-cover"
                      />
                    </div>
                  )}
                  
                  {imageFile && (
                    <div className="text-sm text-muted-foreground">
                      Файл: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
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
                <Label htmlFor="isActive">Активне</Label>
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
              Ви впевнені, що хочете видалити оголошення "{selectedAnnouncement?.title}"? Цю дію неможливо скасувати.
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

export default AdminAnnouncements

