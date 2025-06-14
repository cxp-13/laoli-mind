import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: permissions, error } = await supabase
      .from('email_permissions')
      .select(`
        id,
        email,
        first_access,
        created_at,
        documents (
          title,
          introduction
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching testimonials:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Transform the data for testimonials
    const testimonials = permissions?.map(perm => ({
      id: perm.id,
      email: perm.email,
      document_title: perm.documents?.title || 'Untitled Document',
      document_introduction: perm.documents?.introduction || 'No description available',
      created_at: perm.created_at,
      first_access: perm.first_access,
    })) || [];

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error('Error in testimonials API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}