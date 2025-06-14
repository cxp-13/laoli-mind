import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. 查询 email_permissions
    const { data: permissions, error: permError } = await supabase
      .from('email_permissions')
      .select('id, email, first_access, created_at, document_id')
      .order('created_at', { ascending: false })
      .limit(20);

    if (permError) {
      console.error('Error fetching permissions:', permError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // 2. 收集所有 document_id
    const docIds = Array.from(new Set((permissions || []).map(p => p.document_id)));

    // 3. 查询 documents 表
    let documentsMap: Record<string, { title: string }> = {};
    if (docIds.length > 0) {
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, title')
        .in('id', docIds);

      if (docError) {
        console.error('Error fetching documents:', docError);
      } else {
        documentsMap = (documents || []).reduce((acc, doc) => {
          acc[doc.id] = { title: doc.title };
          return acc;
        }, {} as Record<string, { title: string }>);
      }
    }

    // 4. 合并数据
    const testimonials = (permissions || []).map(perm => ({
      id: perm.id,
      email: perm.email,
      document_title: documentsMap[perm.document_id]?.title || 'Untitled Document',
      created_at: perm.created_at,
      first_access: perm.first_access,
    }));

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