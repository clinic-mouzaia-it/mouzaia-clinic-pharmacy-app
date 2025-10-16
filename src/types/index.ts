import { z } from 'zod';

// Medicine schemas
export const MedicineSchema = z.object({
  id: z.string().uuid(),
  dci: z.string().min(1, 'DCI is required'),
  nomCommercial: z.string().min(1, 'Commercial name is required'),
  stock: z.number().int().min(0),
  ddp: z.string().nullable(),
  lot: z.string().nullable(),
  cout: z.number().positive('Cost must be positive'),
  prixDeVente: z.number().positive('Sale price must be positive'),
  deleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MedicineCreateSchema = z.object({
  dci: z.string().min(1, 'DCI is required'),
  nomCommercial: z.string().min(1, 'Commercial name is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  ddp: z.string().optional(),
  lot: z.string().optional(),
  cout: z.number().positive('Cost must be positive'),
  prixDeVente: z.number().positive('Sale price must be positive'),
});

// Partial update schema: all fields optional, but require at least one key present
export const MedicineUpdateSchema = z
  .object({
    dci: z.string().min(1, 'DCI is required').optional(),
    nomCommercial: z.string().min(1, 'Commercial name is required').optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
    ddp: z.string().optional(),
    lot: z.string().optional(),
    cout: z.number().positive('Cost must be positive').optional(),
    prixDeVente: z.number().positive('Sale price must be positive').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
    path: [],
  });

export type Medicine = z.infer<typeof MedicineSchema>;
export type MedicineCreate = z.infer<typeof MedicineCreateSchema>;
export type MedicineUpdate = z.infer<typeof MedicineUpdateSchema>;

// Staff User schema
export const StaffUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationalId: z.string(),
  roleMappings: z.any(),
});

export type StaffUser = z.infer<typeof StaffUserSchema>;

// Distribution schema
export const DistributionItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type DistributionItem = z.infer<typeof DistributionItemSchema>;

export const DistributeRequestSchema = z.object({
  staffUser: StaffUserSchema,
  medicines: z.array(DistributionItemSchema).min(1, 'At least one medicine is required'),
});

export type DistributeRequest = z.infer<typeof DistributeRequestSchema>;

// API Response types
export interface ApiError {
  error: string;
  message?: string;
}

export interface DistributeResponse {
  success: boolean;
  message: string;
  distributions: Array<{
    id: string;
    medicineId: string;
    quantity: number;
    staffUserId: string;
    staffUsername: string;
    staffNationalId: string;
    staffFullName: string | null;
    distributedBy: string;
    distributedAt: string;
  }>;
}

export interface RestoreResponse {
  success: boolean;
  message: string;
  medicine: Medicine;
}
