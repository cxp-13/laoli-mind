import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user's document permissions with document details
    const { data: permissions, error } = await supabase
      .from('email_permissions')
      .select(`
        *,
        documents (
          id,
          title,
          introduction,
          notification_link,
          thank_you_content
        )
      `)
      .eq('email', email);

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Transform the data to include first_access info
    const documents = permissions?.map(perm => ({
      ...perm.documents,
      first_access: perm.first_access,
    })) || [];

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error('Error in documents API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}