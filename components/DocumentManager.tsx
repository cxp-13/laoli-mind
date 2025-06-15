'use client';

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
      <Label htmlFor={`title-${isEdit ? 'edit' : 'create'}`} className="text-emerald-300">Title *</Label>
      <Input
        id={`title-${isEdit ? 'edit' : 'create'}`}
        value={formData.title}
        onChange={(e) => onInputChange('title', e.target.value)}
        placeholder="Enter document title"
        required
        className="glass-effect border-emerald-700/30 text-emerald-300 placeholder:text-emerald-300/50"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor={`introduction-${isEdit ? 'edit' : 'create'}`} className="text-emerald-300">Introduction *</Label>
      <Textarea
        id={`introduction-${isEdit ? 'edit' : 'create'}`}
        value={formData.introduction}
        onChange={(e) => onInputChange('introduction', e.target.value)}
        placeholder="Enter document introduction"
        rows={3}
        required
        className="glass-effect border-emerald-700/30 text-emerald-300 placeholder:text-emerald-300/50"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor={`link-${isEdit ? 'edit' : 'create'}`} className="text-emerald-300">Document Link *</Label>
      <Input
        id={`link-${isEdit ? 'edit' : 'create'}`}
        type="url"
        value={formData.link}
        onChange={(e) => onInputChange('link', e.target.value)}
        placeholder="https://example.com/document"
        required
        className="glass-effect border-emerald-700/30 text-emerald-300 placeholder:text-emerald-300/50"
      />
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-emerald-700 text-emerald-300 hover:bg-emerald-900"
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-emerald-500 to-lime-400 text-black hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">Document Management</h2>
          <p className="text-emerald-300/70">Manage your content documents</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-lime-400 text-black hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-emerald-700/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Create New Document</DialogTitle>
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

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card className="glass-effect border-emerald-700/30 text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-300">No documents</h3>
              <p className="text-emerald-300/70 max-w-md mx-auto">
                No documents have been created yet. Click the &quot;New Document&quot; button above to create your first document.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 flex-1 text-emerald-300">
                        {doc.title}
                      </CardTitle>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(doc)}
                          className="hover:bg-emerald-900 text-emerald-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(doc.id)}
                          className="hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-emerald-300/70 line-clamp-3">
                      {doc.introduction}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-emerald-300/70">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(doc.created_at), 'PPP', { locale: zhCN })}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.link, '_blank')}
                      className="w-full glass-effect border-emerald-700/30 text-emerald-300 hover:bg-emerald-900"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-effect border-emerald-700/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">Edit Document</DialogTitle>
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