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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-900 to-black">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-emerald-700/30 glass-effect">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="hover:bg-emerald-900 text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Admin Panel</span>
          </div>
        </div>
        <Badge variant="outline" className="glass-effect border-emerald-700 text-emerald-300">
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
              <Card className="glass-effect border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-300">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{documents.length}</div>
                  <p className="text-xs text-emerald-300/70">
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
              <Card className="glass-effect border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-300">Total Permissions</CardTitle>
                  <Users className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{permissions.length}</div>
                  <p className="text-xs text-emerald-300/70">
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
              <Card className="glass-effect border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-300">Unique Users</CardTitle>
                  <Mail className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">
                    {new Set(permissions.map(p => p.email)).size}
                  </div>
                  <p className="text-xs text-emerald-300/70">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
            <Input
              placeholder="Search documents or permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-effect border-emerald-700/30 text-emerald-300 placeholder:text-emerald-300/50"
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="documents" className="space-y-6">
              <TabsList className="glass-effect border-emerald-700/30">
                <TabsTrigger value="documents" className="flex items-center space-x-2 text-emerald-300 data-[state=active]:bg-emerald-900">
                  <FileText className="w-4 h-4" />
                  <span>Document Management</span>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center space-x-2 text-emerald-300 data-[state=active]:bg-emerald-900">
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