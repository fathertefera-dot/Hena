// ============================================================
// IKU SWEET CAKE - Application Types
// ============================================================

export type UserRole = 'customer' | 'admin'
export type ProductStatus = 'draft' | 'active' | 'archived'
export type ProductAvailability = 'available' | 'pre-order'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'
export type PaymentMethod = 'cash_on_delivery' | 'telebirr' | 'bank_transfer'

// ============================================================
// DATABASE ENTITY TYPES
// ============================================================

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  price: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  availability: ProductAvailability
  is_featured: boolean
  status: ProductStatus
  created_at: string
  updated_at: string
  // Joined relations
  category?: Category | null
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface Cart {
  id: string
  session_id: string
  user_id: string | null
  created_at: string
  updated_at: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id: string
  quantity: number
  cake_message: string | null
  created_at: string
  updated_at: string
  // Joined relations
  product?: Product
  variant?: ProductVariant
  product_images?: ProductImage[]
}

export interface CartItemWithDetails extends CartItem {
  product: Product & { images: ProductImage[] }
  variant: ProductVariant
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  customer_phone: string
  delivery_address: string
  order_note: string | null
  payment_method: PaymentMethod
  status: OrderStatus
  cancel_reason: string | null
  total_amount: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string
  price: number
  quantity: number
  cake_message: string | null
  created_at: string
}

export interface Banner {
  id: string
  image_url: string
  title: string | null
  link: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string | null
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  business_name: string
  phone: string
  support_email: string
  address: string
  business_hours: string
  meta_title: string
  meta_description: string
  payment_cod: boolean
  payment_telebirr: boolean
  payment_bank_transfer: boolean
}

// ============================================================
// SERVER ACTION RESULT TYPE
// ============================================================

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ============================================================
// FORM INPUT TYPES
// ============================================================

export interface CheckoutFormData {
  full_name: string
  phone: string
  delivery_address: string
  order_note?: string
  payment_method: PaymentMethod
}

export interface TrackOrderFormData {
  order_number: string
  phone: string
}

export interface ProductFormData {
  name: string
  slug: string
  description: string
  category_id: string
  availability: ProductAvailability
  is_featured: boolean
  status: ProductStatus
  variants: Array<{
    id?: string
    name: string
    price: number
    sort_order: number
  }>
}

export interface CategoryFormData {
  name: string
  slug: string
  sort_order: number
  is_active: boolean
}

export interface BannerFormData {
  title: string
  link: string
  sort_order: number
  is_active: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  full_name: string
  email: string
  password: string
  confirm_password: string
}

// ============================================================
// CART CONTEXT TYPE
// ============================================================

export interface CartContextValue {
  items: CartItemWithDetails[]
  itemCount: number
  totalAmount: number
  isLoading: boolean
  addItem: (
    productId: string,
    variantId: string,
    quantity: number,
    cakeMessage?: string
  ) => Promise<ActionResult<void>>
  removeItem: (itemId: string) => Promise<ActionResult<void>>
  updateQuantity: (itemId: string, quantity: number) => Promise<ActionResult<void>>
  clearCart: () => Promise<ActionResult<void>>
  refresh: () => Promise<void>
}

// ============================================================
// PAGINATION TYPE
// ============================================================

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

// ============================================================
// PRODUCT FILTER TYPE
// ============================================================

export interface ProductFilters {
  search?: string
  category?: string
  page?: number
  perPage?: number
}

// ============================================================
// ORDER FILTER TYPE (admin)
// ============================================================

export interface OrderFilters {
  status?: OrderStatus
  search?: string
  page?: number
  perPage?: number
}

// ============================================================
// DASHBOARD STATS TYPE
// ============================================================

export interface DashboardStats {
  total_orders: number
  pending_orders: number
  delivered_orders: number
  total_products: number
}
