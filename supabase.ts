import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSession, COOKIE } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Missing email or code' }, { status: 400 })
    }

    const normalEmail = email.toLowerCase().trim()

    // Find valid OTP
    const { data: otpRow, error } = await supabaseAdmin
      .from('otp_sessions')
      .select('*')
      .eq('email', normalEmail)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !otpRow) {
      return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 401 })
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otp_sessions')
      .update({ used: true })
      .eq('id', otpRow.id)

    // Upsert voter record
    const { data: voter, error: voterError } = await supabaseAdmin
      .from('voters')
      .upsert({ email: normalEmail, last_login: new Date().toISOString() }, { onConflict: 'email' })
      .select()
      .single()

    if (voterError || !voter) throw voterError

    // Create JWT session
    const token = await createSession(normalEmail, voter.id)

    const res = NextResponse.json({ success: true, email: normalEmail })
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  } catch (err: any) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 })
  }
}
