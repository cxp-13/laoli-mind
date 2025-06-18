import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Document } from '@/app/types';

export const dynamic = 'force-dynamic';

type Permission = {
  document_id: number;
  first_access: boolean;
  deadline: string | null;
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
      .select('document_id, first_access, deadline')
      .eq('email', email);

    if (permError) {
      console.error('Error fetching permissions:', permError);
      return NextResponse.json(
        { success: false, error: 'Database error (permissions)' },
        { status: 500 }
      );
    }

    // 2. 过滤掉已过期的权限
    const now = new Date();
    const validPermissions = (permissions || []).filter(p => {
      // 如果 deadline 为 null，表示永久权限
      if (p.deadline === null) return true;
      // 否则检查是否过期
      return new Date(p.deadline) > now;
    });

    // 3. 提取所有有效的 document_id
    const docIds = Array.from(new Set(validPermissions.map(p => p.document_id)));

    // 4. 查询 documents 表
    let documentsMap: Record<number, Document> = {};
    if (docIds.length > 0) {
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, title, introduction, link, created_at, updated_at')
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

    // 5. 合并权限和文档信息
    const documentsWithAccess = validPermissions
      .map(p => {
        const doc = documentsMap[p.document_id];
        if (!doc) return null;
        return {
          ...doc,
          first_access: p.first_access,
          deadline: p.deadline,
        };
      })
      .filter(Boolean); // 去掉 null 的项

    // 6. 返回 JSON
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