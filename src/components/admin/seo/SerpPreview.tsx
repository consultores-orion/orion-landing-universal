'use client'

interface SerpPreviewProps {
  title: string
  description: string
  url?: string
}

export function SerpPreview({ title, description, url }: SerpPreviewProps) {
  const displayUrl = url ?? 'yoursite.com'

  return (
    <div className="bg-card max-w-xl rounded-lg border p-4">
      <p className="text-muted-foreground mb-3 text-xs font-medium">Vista previa en Google</p>
      <p className="mb-0.5 text-sm text-green-700 dark:text-green-500">{displayUrl}</p>
      <p className="line-clamp-1 text-lg leading-tight font-medium text-blue-600 dark:text-blue-400">
        {title || 'Título de tu página'}
      </p>
      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
        {description || 'Descripción de tu página. Aquí aparecerá el resumen que configuraste.'}
      </p>
    </div>
  )
}
