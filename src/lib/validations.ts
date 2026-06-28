import { z } from 'zod'

// ============================================================
// AUTH
// ============================================================

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

// ============================================================
// CHECKOUT
// ============================================================

export const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z
    .string()
    .min(9, 'Phone number must be at least 9 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[+\d\s\-()]+$/, 'Invalid phone number format'),
  delivery_address: z
    .string()
    .min(10, 'Please provide a complete delivery address')
    .max(500),
  order_note: z.string().max(500, 'Note is too long').optional(),
  payment_method: z.enum(['cash_on_delivery', 'telebirr', 'bank_transfer'], {
    required_error: 'Please select a payment method',
  }),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

// ============================================================
// TRACK ORDER
// ============================================================

export const trackOrderSchema = z.object({
  order_number: z
    .string()
    .min(1, 'Order number is required')
    .regex(/^IKU-\d+$/, 'Invalid order number format (e.g., IKU-1001)'),
  phone: z
    .string()
    .min(9, 'Phone number must be at least 9 digits')
    .regex(/^[+\d\s\-()]+$/, 'Invalid phone number format'),
})

export type TrackOrderFormValues = z.infer<typeof trackOrderSchema>

// ============================================================
// PRODUCTS
// ============================================================

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required').max(100),
  price: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be positive')
    .max(1000000, 'Price is too high'),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(5000, 'Description is too long').optional().default(''),
  category_id: z.string().optional().default(''),
  availability: z.enum(['available', 'pre-order']).default('available'),
  is_featured: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  variants: z
    .array(productVariantSchema)
    .min(1, 'At least one variant is required')
    .max(20, 'Maximum 20 variants allowed'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

// ============================================================
// CATEGORIES
// ============================================================

export const categoryFormSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

// ============================================================
// BANNERS
// ============================================================

export const bannerFormSchema = z.object({
  title: z.string().max(200, 'Title is too long').optional().default(''),
  link: z.string().max(500, 'Link is too long').optional().default(''),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export type BannerFormValues = z.infer<typeof bannerFormSchema>

// ============================================================
// ORDERS (Admin)
// ============================================================

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']),
  cancel_reason: z.string().max(500).optional(),
})

export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>

// ============================================================
// SETTINGS (አዲስ ንጹህ ስኬማ)
// ============================================================

export const settingsSchema = z.object({
  business_name: z.string().min(1, 'Business name is required').max(200),
  phone: z.string().min(9, 'Phone number is required').max(20),
  support_email: z.string().email('Invalid email').max(200).or(z.literal('')),
  address: z.string().max(500).optional().default(''),
  business_hours: z.string().max(200).optional().default(''),
  meta_title: z.string().max(200).optional().default(''),
  meta_description: z.string().max(500).optional().default(''),
  payment_cod: z.boolean().default(true),
  payment_telebirr: z.boolean().default(true),
  payment_bank_transfer: z.boolean().default(true),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
