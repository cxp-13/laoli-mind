import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true })

    response.cookies.set('admin-auth', 'true', {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
