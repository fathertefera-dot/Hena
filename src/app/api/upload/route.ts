import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const bucket = formData.get('bucket') as string | null
  const key = formData.get('key') as string | null

  if (!file || !bucket || !key) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const ALLOWED_BUCKETS = ['branding', 'about', 'products', 'banners']
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const fileName = `${key}-${Date.now()}.${ext}`

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('[Upload API] Error:', uploadError)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from(bucket).getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl })
}
