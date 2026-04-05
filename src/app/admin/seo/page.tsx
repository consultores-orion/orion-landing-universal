import Link from 'next/link'
import { Search, CheckCircle, AlertCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { BreadcrumbSetter } from '@/components/admin/seo/BreadcrumbSetter'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ActiveLanguage {
  code: string
  name: string
  native_name: string
  flag_emoji: string
}

interface SeoConfigRow {
  meta_title: Record<string, string>
  meta_description: Record<string, string>
}

// ─────────────────────────────────────────────
// Language card sub-component (Server Component)
// ─────────────────────────────────────────────

interface SeoLanguageCardProps {
  language: ActiveLanguage
  seoRow: SeoConfigRow | null
}

function SeoLanguageCard({ language, seoRow }: SeoLanguageCardProps) {
  const title = seoRow?.meta_title?.[language.code] ?? ''
  const description = seoRow?.meta_description?.[language.code] ?? ''

  const hasTitle = title.trim().length > 0
  const hasDescription = description.trim().length > 0
  const isComplete = hasTitle && hasDescription

  const displayTitle = hasTitle
    ? title.length > 60
      ? `${title.slice(0, 60)}…`
      : title
    : 'Sin configurar'

  const displayDescription = hasDescription
    ? description.length > 90
      ? `${description.slice(0, 90)}…`
      : description
    : 'Sin configurar'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={language.name}>
              {language.flag_emoji}
            </span>
            <div>
              <CardTitle className="text-base">{language.native_name}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {language.name} · {language.code.toUpperCase()}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isComplete ? 'default' : 'outline'}
            className={
              isComplete
                ? 'shrink-0 border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'shrink-0 border-yellow-400 text-yellow-700 dark:text-yellow-400'
            }
          >
            {isComplete ? (
              <>
                <CheckCircle className="mr-1 size-3" />
                Completo
              </>
            ) : (
              <>
                <AlertCircle className="mr-1 size-3" />
                Pendiente
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">Meta Título</p>
          <p className={hasTitle ? 'line-clamp-1 text-sm' : 'text-muted-foreground text-sm italic'}>
            {displayTitle}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium">Meta Descripción</p>
          <p
            className={
              hasDescription ? 'line-clamp-2 text-sm' : 'text-muted-foreground text-sm italic'
            }
          >
            {displayDescription}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          render={<Link href={`/admin/seo/${language.code}`} />}
        >
          Editar
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default async function SeoPage() {
  const supabase = await createServerClient()

  const [langsResult, seoResult] = await Promise.all([
    supabase
      .from('languages')
      .select('code, name, native_name, flag_emoji')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('seo_config').select('*').eq('page_key', 'home').maybeSingle(),
  ])

  const languages = (langsResult.data ?? []) as ActiveLanguage[]
  const seoRow = seoResult.data as SeoConfigRow | null

  return (
    <>
      <BreadcrumbSetter items={[{ label: 'SEO', href: '/admin/seo' }]} />

      {/* Page header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Search className="text-muted-foreground size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">SEO Manager</h1>
        </div>
        <p className="text-muted-foreground max-w-xl text-sm">
          Configura el posicionamiento en buscadores de tu landing page
        </p>
      </div>

      {/* Language cards grid */}
      {languages.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Search className="text-muted-foreground mb-4 size-10" />
          <p className="text-muted-foreground text-sm">
            No hay idiomas activos. Activa al menos un idioma desde el panel de idiomas primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {languages.map((lang) => (
            <SeoLanguageCard key={lang.code} language={lang} seoRow={seoRow} />
          ))}
        </div>
      )}
    </>
  )
}
