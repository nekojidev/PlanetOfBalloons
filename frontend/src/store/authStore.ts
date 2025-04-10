import { create } from "zustand"
import { persist } from "zustand/middleware"
import axios from "@/lib/axios"

interface User {
  userId: string
  name: string
  email: string
  phone: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (name: string, email: string, phone: string) => Promise<void>
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.post("/auth/login", { email, password })
          set({ user: response.data.user, isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Помилка входу",
            isLoading: false,
          })
        }
      },

      register: async (name, email, phone, password) => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.post("/auth/register", {
            name,
            email,
            phone,
            password,
          })
          set({ user: response.data.user, isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Помилка реєстрації",
            isLoading: false,
          })
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true })
          await axios.post("/auth/logout")
          set({ user: null, isLoading: false })
        } catch (error) {
          set({ user: null, isLoading: false })
        }
      },

      updateProfile: async (name, email, phone) => {
        try {
          set({ isLoading: true, error: null })
          const response = await axios.patch("/users/updateUser", {
            name,
            email,
            phone,
          })
          set({ user: response.data.user, isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Помилка оновлення профілю",
            isLoading: false,
          })
        }
      },

      updatePassword: async (oldPassword, newPassword) => {
        try {
          set({ isLoading: true, error: null })
          await axios.patch("/users/updateUserPassword", {
            oldPassword,
            newPassword,
          })
          set({ isLoading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Помилка зміни паролю",
            isLoading: false,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

