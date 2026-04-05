import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error !== null || !user) {
    redirect('/login')
  }

  // At this point user is guaranteed non-null — redirect() throws and never returns
  return <AdminLayout user={user!}>{children}</AdminLayout>
}
