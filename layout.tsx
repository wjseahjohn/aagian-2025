import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, isAdmin } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || !isAdmin(session.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: nominations } = await supabaseAdmin
    .from('nominations')
    .select('*')
    .eq('submitted', true)
    .order('created_at', { ascending: false })

  const { data: votes } = await supabaseAdmin
    .from('votes')
    .select('*')
    .eq('submitted', true)
    .order('created_at', { ascending: false })

  // Aggregate votes by nominee
  const aggregated: Record<string, any> = {}
  for (const v of votes || []) {
    if (!aggregated[v.nominee_name]) {
      aggregated[v.nominee_name] = {
        nominee_name: v.nominee_name,
        count: 0,
        total_character: 0,
        total_contribution: 0,
        total_leadership: 0,
        total_legacy: 0,
        by_group: { firm: 0, advisory: 0, support: 0, chairman: 0 },
      }
    }
    const a = aggregated[v.nominee_name]
    a.count++
    a.total_character += v.score_character || 0
    a.total_contribution += v.score_contribution || 0
    a.total_leadership += v.score_leadership || 0
    a.total_legacy += v.score_legacy || 0
    if (v.voter_group in a.by_group) a.by_group[v.voter_group]++
  }

  const voteResults = Object.values(aggregated)
    .map((a: any) => ({
      ...a,
      avg_character: +(a.total_character / a.count).toFixed(1),
      avg_contribution: +(a.total_contribution / a.count).toFixed(1),
      avg_leadership: +(a.total_leadership / a.count).toFixed(1),
      avg_legacy: +(a.total_legacy / a.count).toFixed(1),
      avg_total: +((a.total_character + a.total_contribution + a.total_leadership + a.total_legacy) / a.count).toFixed(1),
    }))
    .sort((a, b) => b.avg_total - a.avg_total)

  return NextResponse.json({
    nominations,
    voteResults,
    totalVoters: votes?.length || 0,
    totalNominations: nominations?.length || 0,
  })
}
