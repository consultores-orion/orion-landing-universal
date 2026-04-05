import { z } from 'zod'

export const connectSchema = z.object({
  supabaseUrl: z
    .string()
    .url()
    .regex(/^https:\/\/[a-z0-9]+\.supabase\.co$/, 'Must be a valid Supabase URL'),
  anonKey: z.string().min(1).regex(/^eyJ/, 'Must be a valid JWT token'),
  serviceRoleKey: z.string().min(1).regex(/^eyJ/, 'Must be a valid JWT token'),
  databaseUrl: z
    .string()
    .min(1)
    .regex(/^postgresql:\/\//, 'Must be a valid PostgreSQL URI'),
})

export const adminSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ConnectInput = z.infer<typeof connectSchema>
export type AdminInput = z.infer<typeof adminSchema>
