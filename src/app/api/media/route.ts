import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const querySchema = z.object({
  folder: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'file_name', 'file_size']).default('created_at'),
})

// ─────────────────────────────────────────────
// GET /api/media
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const parsed = querySchema.safeParse({
    folder: searchParams.get('folder') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 20,
    sort: searchParams.get('sort') ?? 'created_at',
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { folder, search, page, limit, sort } = parsed.data
  const offset = (page - 1) * limit

  let query = supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order(sort, { ascending: sort === 'file_name' })
    .range(offset, offset + limit - 1)

  if (folder !== undefined && folder !== '') {
    query = query.eq('folder', folder)
  }

  if (search !== undefined && search !== '') {
    query = query.ilike('file_name', `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[GET /api/media] Supabase error:', error)
    return NextResponse.json({ error: 'Error al obtener medios' }, { status: 500 })
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({ data: data ?? [], total, page, totalPages })
}

// ─────────────────────────────────────────────
// POST /api/media — Upload
// ─────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'general'

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return NextResponse.json(
      {
        error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
      },
      { status: 400 },
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `El archivo supera el límite de 5 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
      { status: 400 },
    )
  }

  // Build unique file path
  const sanitized = sanitizeFilename(file.name)
  const uuid = crypto.randomUUID()
  const filePath = `${folder}/${uuid}-${sanitized}`

  // Upload to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('media')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (storageError) {
    console.error('[POST /api/media] Storage error:', storageError)
    return NextResponse.json({ error: 'Error al subir archivo al almacenamiento' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)

  // Insert record in DB
  const { data: record, error: dbError } = await supabase
    .from('media')
    .insert({
      file_name: file.name,
      file_path: filePath,
      public_url: urlData.publicUrl,
      mime_type: file.type,
      file_size: file.size,
      alt_text: {},
      folder,
      width: null,
      height: null,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (dbError) {
    console.error('[POST /api/media] DB insert error:', dbError)
    // Best-effort cleanup of uploaded file
    await supabase.storage.from('media').remove([filePath])
    return NextResponse.json({ error: 'Error al guardar registro en BD' }, { status: 500 })
  }

  return NextResponse.json({ data: record }, { status: 201 })
}
