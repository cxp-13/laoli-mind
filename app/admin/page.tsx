'use client';

import { DocumentManager } from '@/components/DocumentManager';
import { PermissionManager } from '@/components/PermissionManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Mail,
  Search,
  Settings,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Document } from '../types';

export interface Permission {
  id: string;
  email: string;
  document_id: string;
  document_title: string;
  first_access: boolean;
  created_at: string;
}



export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    document_id: '',
    deadline: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsResponse, permsResponse] = await Promise.all([
        fetch('/api/admin/documents'),
        fetch('/api/admin/permissions')
      ]);

      const docsData = await docsResponse.json();
      const permsData = await permsResponse.json();

      if (docsData.success) {
        setDocuments(docsData.documents);
      }

      if (permsData.success) {
        setPermissions(permsData.permissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.introduction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(perm =>
    perm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.document_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      email: '',
      document_id: '',
      deadline: '',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="hover:bg-gray-800 text-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-gray-400" />
            <span className="font-semibold text-gray-300">Admin Panel</span>
          </div>
        </div>
        <Badge variant="outline" className="border-gray-700 bg-gray-900 text-gray-300">
          Admin
        </Badge>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{documents.length}</div>
                  <p className="text-xs text-gray-500">
                    Content documents created
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Total Permissions</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{permissions.length}</div>
                  <p className="text-xs text-gray-500">
                    Access permissions assigned
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Unique Users</CardTitle>
                  <Mail className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {new Set(permissions.map(p => p.email)).size}
                  </div>
                  <p className="text-xs text-gray-500">
                    Users with access permissions
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-md"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search documents or permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500 focus:ring-gray-600"
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="documents" className="space-y-6">
              <TabsList className="bg-gray-900/50 border border-gray-800">
                <TabsTrigger value="documents" className="flex items-center space-x-2 text-gray-400 data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                  <FileText className="w-4 h-4" />
                  <span>Document Management</span>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center space-x-2 text-gray-400 data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                  <Users className="w-4 h-4" />
                  <span>Permission Management</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-6">
                <DocumentManager
                  documents={filteredDocuments}
                  onRefresh={fetchData}
                />
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <PermissionManager
                  permissions={filteredPermissions}
                  documents={documents}
                  onRefresh={fetchData}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}