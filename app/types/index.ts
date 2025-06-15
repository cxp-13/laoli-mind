export interface Document {
    id: string;
    title: string;
    introduction: string;
    link: string;
    created_at: string;
    updated_at: string;
}



export interface Permission {
    id: string;
    email: string;
    document_id: string;
    document_title: string;
    first_access: boolean;
    created_at: string;
}