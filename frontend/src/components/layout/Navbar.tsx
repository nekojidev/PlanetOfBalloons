"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const navigate = useNavigate()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
    closeMenu()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-xl font-bold text-primary">Планета Кульок</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Головна
            </Link>
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Товари
            </Link>
            <Link to="/promotions" className="text-sm font-medium transition-colors hover:text-primary">
              Акції
            </Link>
            <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
              Про нас
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative" onClick={closeMenu}>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {items.length}
                </span>
              )}
            </Button>
          </Link>
          

          <ThemeToggle />

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/orders" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start">
                    Замовлення
                  </Button>
                </Link>
              <Button variant="outline" onClick={handleLogout}>
                Вийти
              </Button>
              {user.role === "admin" && (
                <Link to="/admin">
                  <Button variant="secondary">Адмін</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">Увійти</Button>
              </Link>
              <Link to="/register">
                <Button>Реєстрація</Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className="container py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link to="/" className="text-sm font-medium" onClick={closeMenu}>
              Головна
            </Link>
            <Link to="/products" className="text-sm font-medium" onClick={closeMenu}>
              Товари
            </Link>
            <Link to="/promotions" className="text-sm font-medium" onClick={closeMenu}>
              Акції
            </Link>
            <Link to="/announcements" className="text-sm font-medium" onClick={closeMenu}>
              Оголошення
            </Link>
          </nav>

          <div className="border-t pt-4">
            {user ? (
              <div className="flex flex-col space-y-3">
                <Link to="/profile" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Профіль
                  </Button>
                </Link>
                <Link to="/orders" onClick={closeMenu}>
                  <Button variant="outline" className="w-full justify-start">
                    Мої замовлення
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={closeMenu}>
                    <Button variant="secondary" className="w-full justify-start">
                      Адмін панель
                    </Button>
                  </Link>
                )}
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  Вийти
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">
                    Увійти
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full">Реєстрація</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

