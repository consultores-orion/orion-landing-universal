'use client'

import { useState, useRef, useCallback } from 'react'
import type { ModuleProps } from '@/lib/modules/types'
import { ModuleWrapper } from '@/components/shared/ModuleWrapper'
import { getContentForLang } from '@/lib/i18n/utils'
import type { SocialProofContent, Testimonial } from './social-proof.types'

export default function SocialProofModule({
  content,
  styles,
  moduleId,
  language,
  defaultLanguage,
}: ModuleProps<SocialProofContent>) {
  const t = (field: Record<string, string> | string | null | undefined): string =>
    getContentForLang(field, language, defaultLanguage)

  const layout = content.layout ?? 'carousel'
  const testimonials: Testimonial[] = Array.isArray(content.testimonials)
    ? content.testimonials
    : []

  return (
    <ModuleWrapper moduleId={moduleId} sectionKey="social_proof" styles={styles}>
      {/* Section header */}
      <div className="mb-12 text-center">
        <h2
          className="text-3xl font-bold tracking-tight md:text-4xl"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t(content.title)}
        </h2>
        {content.subtitle && (
          <p className="mt-4 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {t(content.subtitle)}
          </p>
        )}
      </div>

      {/* Layout renderer */}
      {layout === 'carousel' && <TestimonialsCarousel testimonials={testimonials} t={t} />}
      {layout === 'grid' && <TestimonialsGrid testimonials={testimonials} t={t} />}
      {layout === 'masonry' && <TestimonialsMasonry testimonials={testimonials} t={t} />}
    </ModuleWrapper>
  )
}

type TFn = (field: Record<string, string> | string | null | undefined) => string

function StarRating({ rating }: { rating: number }) {
  const clampedRating = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <div className="flex gap-0.5" aria-label={`${clampedRating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="text-lg leading-none"
          style={{
            color: i < clampedRating ? '#f59e0b' : 'var(--color-border)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function AuthorAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="h-12 w-12 rounded-full object-cover" />
  }

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
      }}
    >
      {initials}
    </div>
  )
}

function TestimonialCard({ testimonial, t }: { testimonial: Testimonial; t: TFn }) {
  return (
    <div
      className="flex h-full flex-col gap-4 rounded-xl p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Stars */}
      {testimonial.rating !== undefined && <StarRating rating={testimonial.rating} />}

      {/* Quote */}
      <blockquote
        className="flex-1 text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        &ldquo;{t(testimonial.quote)}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <AuthorAvatar
          name={testimonial.authorName}
          avatarUrl={testimonial.authorAvatar?.url || undefined}
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {testimonial.authorName}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {testimonial.authorRole ? t(testimonial.authorRole) : ''}
            {testimonial.company && testimonial.authorRole
              ? ` · ${testimonial.company}`
              : (testimonial.company ?? '')}
          </span>
        </div>
      </div>
    </div>
  )
}

function TestimonialsCarousel({ testimonials, t }: { testimonials: Testimonial[]; t: TFn }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current
    if (!container) return
    const cards = container.querySelectorAll<HTMLDivElement>('[data-card]')
    const card = cards[index]
    if (!card) return
    container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: 'smooth' })
    setActiveIndex(index)
  }, [])

  const handlePrev = () => {
    const newIndex = Math.max(0, activeIndex - 1)
    scrollToIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = Math.min(testimonials.length - 1, activeIndex + 1)
    scrollToIndex(newIndex)
  }

  if (testimonials.length === 0) return null

  return (
    <div className="relative">
      {/* Carousel track */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            data-card
            className="w-full shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <TestimonialCard testimonial={testimonial} t={t} />
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      {testimonials.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            aria-label="Previous testimonial"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: index === activeIndex ? '24px' : '8px',
                  backgroundColor:
                    index === activeIndex ? 'var(--color-primary)' : 'var(--color-border)',
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={activeIndex === testimonials.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            aria-label="Next testimonial"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 12l4-4-4-4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function TestimonialsGrid({ testimonials, t }: { testimonials: Testimonial[]; t: TFn }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} t={t} />
      ))}
    </div>
  )
}

function TestimonialsMasonry({ testimonials, t }: { testimonials: Testimonial[]; t: TFn }) {
  // Split into two columns for masonry
  const col1 = testimonials.filter((_, i) => i % 2 === 0)
  const col2 = testimonials.filter((_, i) => i % 2 !== 0)

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-6">
        {col1.map((t_item) => (
          <TestimonialCard key={t_item.id} testimonial={t_item} t={t} />
        ))}
      </div>
      <div className="flex flex-col gap-6 sm:mt-8">
        {col2.map((t_item) => (
          <TestimonialCard key={t_item.id} testimonial={t_item} t={t} />
        ))}
      </div>
    </div>
  )
}
