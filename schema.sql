import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('nominations')
    .select('*')
    .eq('voter_id', session.voterId)
    .single()

  return NextResponse.json({ nomination: data || null })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { submit, ...fields } = body

  // If already submitted, block changes
  const { data: existing } = await supabaseAdmin
    .from('nominations')
    .select('id, submitted')
    .eq('voter_id', session.voterId)
    .single()

  if (existing?.submitted) {
    return NextResponse.json({ error: 'Nomination already submitted and cannot be changed.' }, { status: 400 })
  }

  if (submit) {
    if (!fields.nominee_name?.trim() || !fields.q_why?.trim() || !fields.q_contributions?.trim() || !fields.q_values?.trim()) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
    }
  }

  const payload = {
    voter_id: session.voterId,
    email: session.email,
    nominee_name: fields.nominee_name || '',
    nominee_dept: fields.nominee_dept || '',
    nominee_years: fields.nominee_years || '',
    q_why: fields.q_why || '',
    q_contributions: fields.q_contributions || '',
    q_values: fields.q_values || '',
    pillars: fields.pillars || [],
    submitted: submit || false,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await supabaseAdmin.from('nominations').update(payload).eq('id', existing.id)
  } else {
    await supabaseAdmin.from('nominations').insert(payload)
  }

  return NextResponse.json({ success: true, submitted: submit || false })
}
