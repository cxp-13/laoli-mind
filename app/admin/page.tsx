'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  FileText, 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentManager } from '@/components/DocumentManager';
import { PermissionManager } from '@/components/PermissionManager';

interface Document {
  id: string;
  title: string;
  introduction: string;
  thank_you_content: string;
  notification_link: string;
  created_at: string;
}

interface Permission {
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
      toast.error('获取数据失败');
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
          <p className="text-slate-600">正在加载管理面板...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-white/10 glass-effect">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="hover:glow-red"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-primary" />
            <span className="font-semibold text-gradient">管理后台</span>
          </div>
        </div>
        <Badge variant="outline" className="glass-effect">
          管理员
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
              <Card className="glass-effect border-white/20 hover:glow-red transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">文档总数</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{documents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    已创建的内容文档
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-effect border-white/20 hover:glow-purple transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">权限总数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{permissions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    已分配的访问权限
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-effect border-white/20 hover:glow-cyan transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">独立用户</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-500">
                    {new Set(permissions.map(p => p.email)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    拥有访问权限的用户
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜索文档或权限..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-effect border-white/30"
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="documents" className="space-y-6">
              <TabsList className="glass-effect">
                <TabsTrigger value="documents" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>文档管理</span>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>权限管理</span>
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