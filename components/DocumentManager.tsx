'use client';

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Document } from '@/app/types';
import { Suspense } from 'react';

interface DocumentManagerProps {
  documents: Document[];
  onRefresh: () => void;
}

interface DocumentFormProps {
  formData: {
    title: string;
    introduction: string;
    link: string;
  };
  isLoading: boolean;
  isEdit: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: keyof DocumentFormProps['formData'], value: string) => void;
  onCancel: () => void;
}

const DocumentForm = ({ formData, isLoading, isEdit, onSubmit, onInputChange, onCancel }: DocumentFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor={`title-${isEdit ? 'edit' : 'create'}`} className="text-gray-300">Title *</Label>
      <Input
        id={`title-${isEdit ? 'edit' : 'create'}`}
        value={formData.title}
        onChange={(e) => onInputChange('title', e.target.value)}
        placeholder="Enter document title"
        required
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-gray-600"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor={`introduction-${isEdit ? 'edit' : 'create'}`} className="text-gray-300">Introduction *</Label>
      <Textarea
        id={`introduction-${isEdit ? 'edit' : 'create'}`}
        value={formData.introduction}
        onChange={(e) => onInputChange('introduction', e.target.value)}
        placeholder="Enter document introduction"
        rows={3}
        required
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-gray-600"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor={`link-${isEdit ? 'edit' : 'create'}`} className="text-gray-300">Document Link *</Label>
      <Input
        id={`link-${isEdit ? 'edit' : 'create'}`}
        type="url"
        value={formData.link}
        onChange={(e) => onInputChange('link', e.target.value)}
        placeholder="https://example.com/document"
        required
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-gray-600"
      />
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading} className="bg-gray-200 text-black hover:bg-gray-300">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
          </div>
        ) : (
          isEdit ? 'Update Document' : 'Create Document'
        )}
      </Button>
    </div>
  </form>
);

export function DocumentManager({ documents, onRefresh }: DocumentManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    introduction: '',
    link: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      introduction: '',
      link: '',
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.introduction || !formData.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Document created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        onRefresh();
      } else {
        toast.error(data.error || 'Creation failed');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Error creating document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      introduction: doc.introduction,
      link: doc.link,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !formData.title || !formData.introduction || !formData.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Document updated successfully');
        setIsEditDialogOpen(false);
        setEditingDoc(null);
        resetForm();
        onRefresh();
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Error updating document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Document deleted successfully');
        onRefresh();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document');
    }
  };

  const handleDialogClose = (isEdit: boolean) => {
    if (isEdit) {
      setIsEditDialogOpen(false);
      setEditingDoc(null);
    } else {
      setIsCreateDialogOpen(false);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Document Management</h2>
          <p className="text-gray-400">Manage your content documents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-200 text-black hover:bg-gray-300">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <DocumentForm
              formData={formData}
              isLoading={isLoading}
              isEdit={false}
              onSubmit={handleCreate}
              onInputChange={handleInputChange}
              onCancel={() => handleDialogClose(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length > 0 ? (
          documents.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white line-clamp-2">{doc.title}</CardTitle>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(doc.created_at), 'yyyy年M月d日', { locale: zhCN })}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-400 line-clamp-3">{doc.introduction}</p>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <div className="flex items-center justify-between space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.link, '_blank')}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(doc)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500/80 hover:text-red-500 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-400">No Documents Found</h3>
            <p className="mt-1 text-sm text-gray-500">Create a new document to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <DocumentForm
            formData={formData}
            isLoading={isLoading}
            isEdit={true}
            onSubmit={handleUpdate}
            onInputChange={handleInputChange}
            onCancel={() => handleDialogClose(true)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}