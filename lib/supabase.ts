import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          introduction: string;
          thank_you_content: string;
          notification_link: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          introduction: string;
          thank_you_content: string;
          notification_link: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          introduction?: string;
          thank_you_content?: string;
          notification_link?: string;
          updated_at?: string;
        };
      };
      email_permissions: {
        Row: {
          id: string;
          email: string;
          document_id: string;
          first_access: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          document_id: string;
          first_access?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          document_id?: string;
          first_access?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};