import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  amount: number
  product: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "amount">) => void
  removeItem: (id: string) => void
  updateAmount: (id: string, amount: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, amount: i.amount + 1 } : i)),
          })
        } else {
          set({ items: [...items, { ...item, amount: 1 }] })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        set({ items: items.filter((i) => i.id !== id) })
      },

      updateAmount: (id, amount) => {
        const { items } = get()
        if (amount < 1) return

        set({
          items: items.map((i) => (i.id === id ? { ...i, amount } : i)),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.amount, 0)
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.amount, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

