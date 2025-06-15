import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, documentId } = await request.json();

    if (!email || !documentId) {
      return NextResponse.json(
        { success: false, error: 'Email and documentId are required' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('email_permissions')
      .update({ first_access: false })
      .eq('email', email)
      .eq('document_id', documentId);

    if (updateError) {
      console.error('Error updating permission:', updateError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);

    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-accessed API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}