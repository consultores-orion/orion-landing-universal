import type { SupabaseClient } from '@supabase/supabase-js'

export interface BucketResult {
  bucket: string
  status: 'success' | 'error' | 'exists'
  error?: string
}

interface BucketDefinition {
  id: string
  options: {
    public: boolean
    fileSizeLimit: number
    allowedMimeTypes: string[]
  }
}

const BUCKETS: BucketDefinition[] = [
  {
    id: 'media',
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/gif',
        'image/x-icon',
      ],
    },
  },
  {
    id: 'page_images',
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    },
  },
  {
    id: 'avatars',
    options: {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
  },
]

export async function seedStorageBuckets(supabaseAdmin: SupabaseClient): Promise<BucketResult[]> {
  const results: BucketResult[] = []

  for (const bucket of BUCKETS) {
    try {
      const { error } = await supabaseAdmin.storage.createBucket(bucket.id, bucket.options)

      if (error) {
        // Supabase returns 'Bucket already exists' when duplicate
        if (error.message?.includes('already exists')) {
          results.push({ bucket: bucket.id, status: 'exists' })
        } else {
          results.push({ bucket: bucket.id, status: 'error', error: error.message })
        }
      } else {
        results.push({ bucket: bucket.id, status: 'success' })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      results.push({ bucket: bucket.id, status: 'error', error: message })
    }
  }

  return results
}
