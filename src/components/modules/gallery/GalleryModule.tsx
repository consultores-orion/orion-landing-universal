'use client'

import { useState, useEffect } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { GalleryContent, GalleryImage } from './gallery.types'

type GalleryModuleProps = ModuleProps<GalleryContent>

function getGridClass(cols: number): string {
  if (cols === 2) return 'grid-cols-2'
  if (cols === 4) return 'grid-cols-2 md:grid-cols-4'
  return 'grid-cols-2 md:grid-cols-3'
}

function getMasonryClass(cols: number): string {
  if (cols === 2) return 'columns-2'
  if (cols === 4) return 'columns-2 md:columns-4'
  return 'columns-2 md:columns-3'
}

export default function GalleryModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: GalleryModuleProps) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const images: GalleryImage[] = Array.isArray(content.images) ? content.images : []
  const layout = content.layout ?? 'grid'
  const columns = content.columns ?? 3
  const show_captions = content.show_captions ?? true

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i !== null ? Math.min(i + 1, images.length - 1) : null))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i !== null ? Math.max(i - 1, 0) : null))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, images.length])

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="gallery" styles={styles}>
      {/* Section header */}
      {(content.title ?? content.subtitle) ? (
        <div className="mb-10 text-center">
          {content.title && (
            <h2
              className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: 'var(--color-foreground)' }}
            >
              {t(content.title)}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-base sm:text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
              {t(content.subtitle)}
            </p>
          )}
        </div>
      ) : null}

      {/* Grid layout */}
      {layout === 'grid' && (
        <div className={`grid gap-4 ${getGridClass(columns)}`}>
          {images.map((img, index) => (
            <div key={img.id} className="overflow-hidden rounded-lg">
              <img
                src={img.url}
                alt={t(img.alt)}
                className="w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
                onClick={() => setLightboxIndex(index)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Masonry layout */}
      {layout === 'masonry' && (
        <div className={`gap-4 ${getMasonryClass(columns)}`} style={{ columnFill: 'balance' }}>
          {images.map((img, index) => (
            <div key={img.id} className="mb-4 break-inside-avoid">
              <img
                src={img.url}
                alt={t(img.alt)}
                className="w-full cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                onClick={() => setLightboxIndex(index)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && currentImage !== undefined && currentImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(null)
            }}
            className="absolute top-4 right-4 text-2xl font-bold text-white"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i !== null ? Math.max(i - 1, 0) : null))
            }}
            className="absolute left-4 text-3xl text-white"
            aria-label="Previous image"
            disabled={lightboxIndex === 0}
          >
            ‹
          </button>

          {/* Image */}
          <img
            src={currentImage.url}
            alt={t(currentImage.alt)}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => (i !== null ? Math.min(i + 1, images.length - 1) : null))
            }}
            className="absolute right-4 text-3xl text-white"
            aria-label="Next image"
            disabled={lightboxIndex === images.length - 1}
          >
            ›
          </button>

          {/* Caption */}
          {show_captions && currentImage.caption && (
            <p className="absolute bottom-4 px-4 text-center text-sm text-white">
              {t(currentImage.caption)}
            </p>
          )}

          {/* Counter */}
          <p className="absolute right-4 bottom-4 text-xs text-white opacity-60">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </ModuleWrapper>
  )
}
