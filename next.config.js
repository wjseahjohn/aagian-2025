import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('votes')
    .select('*')
    .eq('voter_id', session.voterId)
    .single()

  return NextResponse.json({ vote: data || null })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { submit, ...fields } = body

  const { data: existing } = await supabaseAdmin
    .from('votes')
    .select('id, submitted')
    .eq('voter_id', session.voterId)
    .single()

  if (existing?.submitted) {
    return NextResponse.json({ error: 'Vote already submitted and cannot be changed.' }, { status: 400 })
  }

  if (submit) {
    if (!fields.nominee_name?.trim() || !fields.voter_group) {
      return NextResponse.json({ error: 'Please fill in nominee name and voting group.' }, { status: 400 })
    }
    if (!fields.score_character || !fields.score_contribution || !fields.score_leadership || !fields.score_legacy) {
      return NextResponse.json({ error: 'Please score all four pillars.' }, { status: 400 })
    }
  }

  const payload = {
    voter_id: session.voterId,
    email: session.email,
    voter_group: fields.voter_group || '',
    nominee_name: fields.nominee_name || '',
    score_character: fields.score_character || null,
    score_contribution: fields.score_contribution || null,
    score_leadership: fields.score_leadership || null,
    score_legacy: fields.score_legacy || null,
    comment: fields.comment || '',
    submitted: submit || false,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await supabaseAdmin.from('votes').update(payload).eq('id', existing.id)
  } else {
    await supabaseAdmin.from('votes').insert(payload)
  }

  return NextResponse.json({ success: true, submitted: submit || false })
}
