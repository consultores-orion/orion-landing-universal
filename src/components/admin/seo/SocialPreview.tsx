'use client'

interface SocialPreviewProps {
  title: string
  description: string
  imageUrl?: string
}

export function SocialPreview({ title, description, imageUrl }: SocialPreviewProps) {
  return (
    <div className="bg-card max-w-md overflow-hidden rounded-lg border">
      <p className="text-muted-foreground border-b p-2 text-xs">Vista previa en redes sociales</p>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="OG Preview" className="h-40 w-full object-cover" />
      ) : (
        <div className="bg-muted flex h-40 w-full items-center justify-center">
          <span className="text-muted-foreground text-sm">Sin imagen OG</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">yoursite.com</p>
        <p className="mt-0.5 line-clamp-1 font-semibold">{title || 'Título de tu página'}</p>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {description || 'Descripción de tu página...'}
        </p>
      </div>
    </div>
  )
}
