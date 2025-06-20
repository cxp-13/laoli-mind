import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('email_permissions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching permissions count:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch permissions count' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 