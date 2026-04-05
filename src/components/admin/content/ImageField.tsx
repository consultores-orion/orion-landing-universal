'use client'

import Image from 'next/image'
import { ImageOff } from 'lucide-react'
import { MediaPicker } from '@/components/admin/media/MediaPicker'

interface ImageFieldProps {
  value: string
  onChange: (url: string) => void
  label: string
}

export function ImageField({ value, onChange, label }: ImageFieldProps) {
  const hasImage = value !== ''

  return (
    <div className="space-y-2">
      {/* Preview */}
      {hasImage ? (
        <div className="border-border bg-muted relative h-36 w-full overflow-hidden rounded-md border">
          <Image
            src={value}
            alt={label}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      ) : (
        <div className="border-border bg-muted flex h-24 w-full items-center justify-center rounded-md border border-dashed">
          <div className="text-muted-foreground flex flex-col items-center gap-1.5">
            <ImageOff className="size-6" />
            <span className="text-xs">Sin imagen</span>
          </div>
        </div>
      )}

      {/* MediaPicker — manages its own dialog + clear button */}
      <MediaPicker value={value} onChange={onChange} placeholder={`URL de ${label}`} />
    </div>
  )
}
