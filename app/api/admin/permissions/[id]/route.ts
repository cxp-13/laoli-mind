import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    // 获取 id 参数
    const id = request.nextUrl.pathname.split('/')[4]; // 假设你的路径是 /api/admin/documents/[id]

    const { error } = await supabase
      .from('email_permissions')
      .delete()
      .eq('document_id', id);  // 假设删除是通过 document_id 关联

    if (error) {
      console.error('Error deleting permission:', error);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin permissions API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
