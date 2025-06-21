import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminAuth = request.cookies.get('admin-auth')?.value


  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !adminAuth) {
    const home = new URL('/', request.url)
    return NextResponse.redirect(home)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
