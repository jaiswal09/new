import { z } from 'zod';

// User schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'teacher', 'staff', 'student']),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Resource schemas
export const resourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category_id: z.string().uuid('Invalid category ID'),
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
  unit_cost: z.number().min(0).optional(),
  location: z.string().optional(),
  min_quantity: z.number().int().min(0).optional(),
  expiry_date: z.string().optional(),
  image_url: z.string().url().optional(),
  barcode: z.string().optional(),
  rfid: z.string().optional(),
});

// Transaction schemas
export const transactionSchema = z.object({
  resource_id: z.string().uuid('Invalid resource ID'),
  transaction_type: z.enum(['check_out', 'check_in', 'maintenance', 'addition', 'removal']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  scheduled_return_date: z.string().optional(),
  notes: z.string().optional(),
});

// Reservation schemas
export const reservationSchema = z.object({
  resource_id: z.string().uuid('Invalid resource ID'),
  start_time: z.string(),
  end_time: z.string(),
  purpose: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
});

// Maintenance schemas
export const maintenanceSchema = z.object({
  resource_id: z.string().uuid('Invalid resource ID'),
  issue_description: z.string().min(5, 'Description must be at least 5 characters'),
  assigned_to: z.string().uuid('Invalid user ID').optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  start_date: z.string().optional(),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

// Vendor schemas
export const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url('Invalid URL format').optional(),
  notes: z.string().optional(),
});

// Purchase Order schemas
export const purchaseOrderSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor ID'),
  expected_delivery_date: z.string().optional(),
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled']).default('draft'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      resource_id: z.string().uuid('Invalid resource ID').optional(),
      item_name: z.string().min(2, 'Item name must be at least 2 characters'),
      description: z.string().optional(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      unit_price: z.number().min(0, 'Unit price must be at least 0'),
    })
  ).min(1, 'At least one item is required'),
});

// Notification schemas
export const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  type: z.string().min(2, 'Type must be at least 2 characters'),
  related_entity_type: z.string().optional(),
  related_entity_id: z.string().uuid('Invalid entity ID').optional(),
});
