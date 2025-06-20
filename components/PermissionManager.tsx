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

const typingSpeed = 60; // ms per character
const pauseDuration = 400; // ms for pronounced pauses

export function PermissionManager({ permissions, documents, onRefresh }: PermissionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    document_id: '',
    deadline: '',
  });

  const [selectDoc, setSelectDoc] = useState<Document>();


  useEffect(() => {
    setSelectDoc(documents.find(doc => String(doc.id) === String(formData.document_id)));
  }, [formData, documents]);

  const resetForm = () => {
    setFormData({
      email: '',
      document_id: '',
      deadline: '',
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
          <h2 className="text-2xl font-bold text-white">Permission Management</h2>
          <p className="text-gray-400">Manage user document access permissions</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-200 text-black hover:bg-gray-300">
              <Plus className="w-4 h-4 mr-2" />
              Assign Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Assign Access Permission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">User Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document" className="text-gray-300">Select Document *</Label>
                <Select
                  value={formData.document_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, document_id: value })
                  }
                >
                  <SelectTrigger id="document" className="bg-gray-800 border-gray-700 text-white focus:ring-gray-600">
                    <SelectValue placeholder="Select a document to assign" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800 text-white">
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-gray-300 hover:bg-gray-800 focus:bg-gray-700">
                        {doc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-gray-300">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-gray-600"
                />
                <div className="text-xs text-gray-500">Leave empty for permanent access</div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-gray-200 text-black hover:bg-gray-300">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
        <Card className="bg-gray-900/50 border-gray-800 text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300">No permissions</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                No access permissions have been assigned yet. Click the &quot;Assign Permission&quot; button above to assign document access to users.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(groupedPermissions).map(([email, perms], index) => {
              const notAccessedCount = perms.filter(p => p.first_access).length;
              return (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <CardTitle className="text-base font-semibold text-white">{email}</CardTitle>
                          <p className="text-sm text-gray-500">{perms.length} document permission(s)</p>
                        </div>
                      </div>
                      <Badge
                        variant={notAccessedCount > 0 ? 'destructive' : 'secondary'}
                        className={notAccessedCount > 0 ? 'bg-red-900/50 text-red-300 border border-red-500/30' : 'bg-gray-800 text-gray-400'}
                      >
                        {notAccessedCount} Not Accessed
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-800/50">
                          <div>
                            <p className="font-medium text-sm text-gray-300">{perm.document_title}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(perm.created_at), 'yyyy年M月d日', { locale: zhCN })}</span>
                              </span>
                              {perm.first_access ? (
                                <Badge variant="outline" className="border-yellow-500/30 text-yellow-300 bg-yellow-900/30 text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Not Accessed
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accessed
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(perm.id)}
                            className="text-red-500/80 hover:text-red-500 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}