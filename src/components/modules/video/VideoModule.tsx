'use client'

import { useState } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { VideoContent, VideoType, AspectRatio } from './video.types'

type VideoModuleProps = ModuleProps<VideoContent>

const ASPECT_RATIO_MAP: Record<AspectRatio, string> = {
  '16/9': '56.25%',
  '4/3': '75%',
  '1/1': '100%',
}

function getEmbedUrl(url: string, type: VideoType, autoplay = false): string {
  const ap = autoplay ? '1' : '0'
  if (type === 'youtube') {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/,
    )
    const id = match?.[1] ?? ''
    return `https://www.youtube.com/embed/${id}?autoplay=${ap}&rel=0`
  }
  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/)
    const id = match?.[1] ?? ''
    return `https://player.vimeo.com/video/${id}?autoplay=${ap}`
  }
  return url
}

export default function VideoModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: VideoModuleProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const aspectRatio = content.aspect_ratio ?? '16/9'
  const paddingBottom = ASPECT_RATIO_MAP[aspectRatio]
  const poster = content.poster_image_url
  const videoType = content.video_type ?? 'youtube'
  const embedUrl = getEmbedUrl(content.video_url ?? '', videoType, content.autoplay)
  const showPoster = !isLoaded && !!poster

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="video" styles={styles}>
      {/* Header */}
      {(content.title ?? content.subtitle) ? (
        <div className="mb-8 text-center">
          {content.title && (
            <h2
              className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl"
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

      {/* Video player */}
      <div
        className="w-full overflow-hidden rounded-xl"
        style={{ position: 'relative', paddingBottom }}
      >
        {videoType === 'file' ? (
          /* Native video element for self-hosted files */
          <video
            src={content.video_url}
            controls
            poster={poster || undefined}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            className="object-cover"
          />
        ) : showPoster ? (
          /* Poster with play button overlay */
          <>
            <img
              src={poster}
              alt={t(content.title) || 'Video thumbnail'}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setIsLoaded(true)}
              aria-label="Play video"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-lg transition-transform hover:scale-110 focus:ring-4 focus:outline-none"
            >
              {/* Play triangle SVG */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8 translate-x-0.5"
                style={{ color: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </>
        ) : (
          /* Embed iframe (YouTube / Vimeo) */
          <iframe
            src={embedUrl}
            title={t(content.title) || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            className="border-0"
          />
        )}
      </div>

      {/* Caption */}
      {content.caption && (
        <p className="mt-4 text-center text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {t(content.caption)}
        </p>
      )}
    </ModuleWrapper>
  )
}
