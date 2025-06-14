import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email has any permissions
    const { data: permissions, error } = await supabase
      .from('email_permissions')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error('Error checking permissions:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      hasAccess: permissions && permissions.length > 0,
    });
  } catch (error) {
    console.error('Error in check-access API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}