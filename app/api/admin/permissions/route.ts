import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: permissions, error } = await supabase
      .from('email_permissions')
      .select(`
        *,
        documents (
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching permissions:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Transform the data to include document title
    const transformedPermissions = permissions?.map(perm => ({
      ...perm,
      document_title: perm.documents?.title || 'Unknown Document',
    })) || [];

    return NextResponse.json({
      success: true,
      permissions: transformedPermissions,
    });
  } catch (error) {
    console.error('Error in admin permissions API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, document_id } = await request.json();

    if (!email || !document_id) {
      return NextResponse.json(
        { success: false, error: 'Email and document_id are required' },
        { status: 400 }
      );
    }

    // Check if permission already exists
    const { data: existingPermission } = await supabase
      .from('email_permissions')
      .select('*')
      .eq('email', email)
      .eq('document_id', document_id)
      .single();

    if (existingPermission) {
      return NextResponse.json(
        { success: false, error: 'Permission already exists for this email and document' },
        { status: 400 }
      );
    }

    const { data: permission, error } = await supabase
      .from('email_permissions')
      .insert({
        email,
        document_id,
        first_access: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating permission:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      permission,
    });
  } catch (error) {
    console.error('Error in admin permissions API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}