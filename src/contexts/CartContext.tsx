'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from '@/actions/cart'
import type { CartContextValue, CartItemWithDetails, ActionResult } from '@/types'

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const cartItems = await getCart()
      setItems(cartItems)
    } catch (error) {
      console.error('[Cart] Refresh failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(
    async (
      productId: string,
      variantId: string,
      quantity: number,
      cakeMessage?: string
    ): Promise<ActionResult<void>> => {
      const result = await addToCart(productId, variantId, quantity, cakeMessage)
      if (result.success) {
        // Call refresh() directly — without startTransition.
        // Previously, wrapping this in startTransition made setIsLoading(true)
        // a deferred (low-priority) update. React could render the cart page
        // before that update applied, briefly showing isLoading=false + items=[]
        // (the empty state with "Browse Cakes → /products"). If the user tapped
        // anywhere in that window they'd be sent to /products. Calling refresh()
        // directly makes setIsLoading(true) a normal high-priority update, so
        // the spinner always shows immediately on navigation.
        refresh()
      }
      return result
    },
    [refresh]
  )

  const removeItem = useCallback(
    async (itemId: string): Promise<ActionResult<void>> => {
      const result = await removeFromCart(itemId)
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId))
      }
      return result
    },
    []
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<ActionResult<void>> => {
      if (quantity < 1) {
        return removeItem(itemId)
      }

      const result = await updateCartItemQuantity(itemId, quantity)
      if (result.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        )
      }
      return result
    },
    [removeItem]
  )

  const handleClearCart = useCallback(async (): Promise<ActionResult<void>> => {
    const result = await clearCart()
    if (result.success) {
      setItems([])
    }
    return result
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: handleClearCart,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
