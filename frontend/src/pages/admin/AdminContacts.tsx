"use client"

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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { Search, Eye, RefreshCw, Check, Trash2, Mail } from "lucide-react"

interface Contact {
  _id: string
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'read' | 'replied'
  createdAt: string
}

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      const response = await axios.get("/contact")
      setContacts(response.data.contacts)

      if (showRefreshToast) {
        toast({
          title: "Оновлено",
          description: "Список повідомлень успішно оновлено",
        })
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити повідомлення",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setIsViewDialogOpen(true)
  }

  const handleUpdateStatus = async (status: 'read' | 'replied') => {
    if (!selectedContact) return

    try {
      const response = await axios.patch(`/contact/${selectedContact._id}`, { status })
      
      // Update the contact in the local state
      setContacts((prev) => 
        prev.map((c) => (c._id === selectedContact._id ? { ...c, status } : c))
      )

      setSelectedContact({ ...selectedContact, status })
      
      toast({
        title: "Статус оновлено",
        description: `Повідомлення позначено як "${status === 'read' ? 'Прочитане' : 'Відповідь надіслана'}"`,
      })
    } catch (error) {
      console.error("Error updating contact status:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус повідомлення",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedContact) return

    try {
      await axios.delete(`/contact/${selectedContact._id}`)

      setContacts((prev) => prev.filter((c) => c._id !== selectedContact._id))
      setIsViewDialogOpen(false)

      toast({
        title: "Успішно",
        description: "Повідомлення видалено",
      })
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Помилка",
        description: "Не вдалося видалити повідомлення",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  // Filter contacts based on search term and status
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || contact.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Повідомлення з форми зворотного зв'язку</h1>
        <Button variant="outline" size="icon" onClick={() => fetchContacts(true)} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук повідомлень..."
            type="search"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Статус:</span>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Всі статуси" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="new">Нові</SelectItem>
              <SelectItem value="read">Прочитані</SelectItem>
              <SelectItem value="replied">З відповіддю</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Завантаження повідомлень...</p>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Немає повідомлень</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Немає повідомлень, що відповідають вашим фільтрам"
              : "Поки що немає повідомлень від користувачів"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ім'я</TableHead>
                <TableHead>Контактна інформація</TableHead>
                <TableHead>Повідомлення</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact._id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <a href={`mailto:${contact.email}`} className="hover:underline hover:text-primary">
                        {contact.email}
                      </a>
                      <a href={`tel:${contact.phone}`} className="text-sm text-muted-foreground hover:underline hover:text-primary">
                        {contact.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                  <TableCell>{formatDate(contact.createdAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        contact.status === "new" 
                          ? "default" 
                          : contact.status === "read" 
                            ? "outline" 
                            : "secondary"
                      }
                    >
                      {contact.status === "new" 
                        ? "Нове" 
                        : contact.status === "read" 
                          ? "Прочитано" 
                          : "Відповідь надіслано"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewContact(contact)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contact)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Повідомлення від {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Отримано {selectedContact && formatDate(selectedContact.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium">Контактна інформація:</h4>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${selectedContact?.email}`}
                  className="text-primary hover:underline"
                >
                  {selectedContact?.email}
                </a>
              </p>
              <p>
                Телефон:{" "}
                <a
                  href={`tel:${selectedContact?.phone}`}
                  className="text-primary hover:underline"
                >
                  {selectedContact?.phone}
                </a>
              </p>
            </div>
            
            <div>
              <h4 className="mb-1 text-sm font-medium">Повідомлення:</h4>
              <div className="rounded-md bg-secondary/50 p-3 whitespace-pre-wrap">
                {selectedContact?.message}
              </div>
            </div>
            
            <div>
              <h4 className="mb-2 text-sm font-medium">Статус:</h4>
              <div className="flex gap-2">
                <Button
                  variant={selectedContact?.status === "read" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleUpdateStatus("read")}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Позначити як прочитане
                </Button>
                
                <Button
                  variant={selectedContact?.status === "replied" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleUpdateStatus("replied")}
                >
                  <Check className="h-3.5 w-3.5" />
                  Позначити як відповідь надіслано
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрити
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(selectedContact!)}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити повідомлення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити це повідомлення від {selectedContact?.name}?
              Цю дію неможливо скасувати.
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

export default AdminContacts