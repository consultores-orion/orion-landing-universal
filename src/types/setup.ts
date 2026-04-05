export interface SetupState {
  hasEnvVars: boolean
  hasDatabase: boolean
  hasSeedData: boolean
  hasAdminUser: boolean
  isComplete: boolean
}

export type WizardStep = 'connect' | 'tables' | 'seed' | 'admin' | 'complete'

export interface WizardStepInfo {
  id: WizardStep
  number: number
  title: string
  description: string
  path: string
}

export const WIZARD_STEPS: WizardStepInfo[] = [
  {
    id: 'connect',
    number: 1,
    title: 'Conexión',
    description: 'Conecta tu proyecto Supabase',
    path: '/setup/connect',
  },
  {
    id: 'tables',
    number: 2,
    title: 'Base de Datos',
    description: 'Crear tablas necesarias',
    path: '/setup/tables',
  },
  {
    id: 'seed',
    number: 3,
    title: 'Datos Iniciales',
    description: 'Cargar contenido de ejemplo',
    path: '/setup/seed',
  },
  {
    id: 'admin',
    number: 4,
    title: 'Administrador',
    description: 'Crear cuenta de admin',
    path: '/setup/admin',
  },
  {
    id: 'complete',
    number: 5,
    title: 'Listo',
    description: 'Configuración completada',
    path: '/setup/complete',
  },
]
