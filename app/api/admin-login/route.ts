import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
}
