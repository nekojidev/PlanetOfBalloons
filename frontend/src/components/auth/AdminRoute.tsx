import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

const AdminRoute = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="container py-8 text-center">Завантаження...</div>
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute

