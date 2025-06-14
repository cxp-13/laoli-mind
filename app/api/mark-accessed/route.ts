import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendThankYouEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, documentId } = await request.json();

    if (!email || !documentId) {
      return NextResponse.json(
        { success: false, error: 'Email and documentId are required' },
        { status: 400 }
      );
    }

    // Update the permission to mark as accessed
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

    // Get document details for thank you email
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      // Don't fail the request if we can't send email
    } else if (document && document.thank_you_content) {
      // Send thank you email if content is provided
      try {

        console.log('Sending thank you email...', document.thank_you_content);
        await sendThankYouEmail(
          email,
          document.title,
          document.introduction,
          document.notification_link
        );
      } catch (emailError) {
        console.error('Error sending thank you email:', emailError);
        // Don't fail the request if email fails
      }
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