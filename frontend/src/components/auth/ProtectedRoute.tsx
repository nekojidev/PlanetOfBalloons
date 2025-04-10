import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

const ProtectedRoute = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="container py-8 text-center">Завантаження...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

