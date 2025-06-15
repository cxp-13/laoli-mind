import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Document } from '@/app/types';

type Permission = {
  document_id: number;
  first_access: boolean;
};

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

    // 1. 查询 email_permissions
    const { data: permissions, error: permError } = await supabase
      .from('email_permissions')
      .select('document_id, first_access')
      .eq('email', email);

    if (permError) {
      console.error('Error fetching permissions:', permError);
      return NextResponse.json(
        { success: false, error: 'Database error (permissions)' },
        { status: 500 }
      );
    }

    // 2. 提取所有 document_id
    const docIds = Array.from(new Set((permissions || []).map(p => p.document_id)));

    // 3. 查询 documents 表
    let documentsMap: Record<number, Document> = {};
    if (docIds.length > 0) {
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, title, introduction, link, created_at, updated_at') // 👈加上这两个字段
        .in('id', docIds);


      if (docError) {
        console.error('Error fetching documents:', docError);
        return NextResponse.json(
          { success: false, error: 'Database error (documents)' },
          { status: 500 }
        );
      }

      documentsMap = (documents || []).reduce((acc, doc) => {
        acc[doc.id] = doc;
        return acc;
      }, {} as Record<number, Document>);
    }

    // 4. 合并权限和文档信息
    const documentsWithAccess = (permissions || [])
      .map(p => {
        const doc = documentsMap[p.document_id];
        if (!doc) return null;
        return {
          ...doc,
          first_access: p.first_access,
        };
      })
      .filter(Boolean); // 去掉 null 的项

    // 5. 返回 JSON
    return NextResponse.json({
      success: true,
      documents: documentsWithAccess,
    });
  } catch (error) {
    console.error('Error in documents API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
