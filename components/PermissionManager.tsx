'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Document } from '@/app/types';



interface Permission {
  id: string;
  email: string;
  document_id: string;
  document_title: string;
  first_access: boolean;
  created_at: string;
}

interface PermissionManagerProps {
  permissions: Permission[];
  documents: Document[];
  onRefresh: () => void;
}

export function PermissionManager({ permissions, documents, onRefresh }: PermissionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    document_id: '',
  });

  const [selectDoc, setSelectDoc] = useState<Document>();


  useEffect(() => {
    setSelectDoc(documents.find(doc => String(doc.id) === String(formData.document_id)));
    console.log('selectDoc:', selectDoc)
  }, [formData, documents]);

  const resetForm = () => {
    setFormData({
      email: '',
      document_id: '',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.document_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Permission assigned successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        onRefresh();
      } else {
        toast.error(data.error || 'Assignment failed');
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Error assigning permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission? The user will no longer be able to access the related document.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/permissions/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Permission deleted successfully');
        onRefresh();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Error deleting permission');
    }
  };

  // Group permissions by email
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.email]) {
      acc[perm.email] = [];
    }
    acc[perm.email].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">Permission Management</h2>
          <p className="text-emerald-300/70">Manage user document access permissions</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-lime-400 text-black hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Assign Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-emerald-700/30">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Assign Access Permission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-emerald-300">User Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  className="glass-effect border-emerald-700/30 text-emerald-300 placeholder:text-emerald-300/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document" className="text-emerald-300">Select Document *</Label>
                <Select
                  value={formData.document_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, document_id: value })
                  }
                >
                  <SelectTrigger id="document" className="glass-effect border-emerald-700/30 text-emerald-300">
                    <SelectValue placeholder="Select a document to assign" >{selectDoc?.title}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-emerald-700/30">
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-emerald-300 hover:bg-emerald-900">
                        {doc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  className="border-emerald-700 text-emerald-300 hover:bg-emerald-900"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-emerald-500 to-lime-400 text-black hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Assigning...</span>
                    </div>
                  ) : (
                    'Assign Permission'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Permissions Display */}
      {Object.keys(groupedPermissions).length === 0 ? (
        <Card className="glass-effect border-emerald-700/30 text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-300">No permissions</h3>
              <p className="text-emerald-300/70 max-w-md mx-auto">
                No access permissions have been assigned yet. Click the "Assign Permission" button above to assign document access to users.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {Object.entries(groupedPermissions).map(([email, userPermissions], index) => (
              <motion.div
                key={email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-effect border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-emerald-300">{email}</CardTitle>
                          <p className="text-sm text-emerald-300/70">
                            {userPermissions.length} document permissions
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-900/50 text-emerald-300">
                        {userPermissions.filter(p => p.first_access).length} Not Accessed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userPermissions.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-3 rounded-lg glass-effect border border-emerald-700/30"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-emerald-300">{perm.document_title}</h4>
                              {perm.first_access ? (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Not Accessed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-300">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accessed
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-emerald-300/70 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {format(new Date(perm.created_at), 'PPP', { locale: zhCN })}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(perm.id)}
                            className="hover:bg-red-500/20 text-red-500 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}