'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ExternalLink, ArrowLeft, Sparkles, CheckCircle, Gift, SettingsIcon as Confetti, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  introduction: string;
  notification_link: string;
  thank_you_content: string;
}

interface AccessDocument extends Document {
  first_access: boolean;
}

export default function AccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [documents, setDocuments] = useState<AccessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [firstAccessDoc, setFirstAccessDoc] = useState<AccessDocument | null>(null);

  useEffect(() => {
    if (email) {
      fetchDocuments();
    }
  }, [email]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?email=${encodeURIComponent(email!)}`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
        
        // Check if there's a first-time access document
        const firstAccess = data.documents.find((doc: AccessDocument) => doc.first_access);
        if (firstAccess) {
          setFirstAccessDoc(firstAccess);
          setShowCelebration(true);
          
          // Send thank you email and mark as accessed
          await markAsAccessed(firstAccess.id);
        }
      } else {
        toast.error(data.error || '获取文档失败');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('获取文档时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsAccessed = async (documentId: string) => {
    try {
      await fetch('/api/mark-accessed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, documentId }),
      });
    } catch (error) {
      console.error('Error marking as accessed:', error);
    }
  };

  const handleDocumentAccess = (doc: AccessDocument) => {
    window.open(doc.notification_link, '_blank');
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setFirstAccessDoc(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Loading your exclusive content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-black via-emerald-900 to-black">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-white/10 glass-effect">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="hover:glow-red"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        
        </div>
        <Badge variant="outline" className="glass-effect">
          {email}
        </Badge>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {documents.length === 0 ? (
            <Card className="glass-effect border-emerald-700 text-center py-12 bg-black/70">
              <CardContent>
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gradient-to-br from-emerald-400 to-lime-400">
                    <Brain className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-300">No accessible content</h3>
                  <p className="text-white/80">
                    You currently have no accessible documents. Please contact the administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-extrabold text-emerald-400 drop-shadow-lg">Your Exclusive Content</h1>
                <p className="text-lg text-white/80">
                  You have <span className="font-bold text-emerald-300">{documents.length}</span> accessible documents
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-emerald-700 hover:glow-green transition-all duration-300 h-full bg-black/70">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2 text-emerald-300">
                            {doc.title}
                          </CardTitle>
                          {!doc.first_access && (
                            <Badge variant="secondary" className="ml-2">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accessed
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-3 text-white/80">
                          {doc.introduction}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleDocumentAccess(doc)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold hover:from-emerald-400 hover:to-green-400 hover:text-white transition-transform"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && firstAccessDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeCelebration}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <Card className="glass-effect border-white/20 glow-red relative overflow-hidden">
                {/* Celebration Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500"
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                      }}
                      animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                  ))}
                </div>

                <CardHeader className="text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-full gradient-ai flex items-center justify-center mx-auto mb-4"
                  >
                    <Gift className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gradient mb-2">
                    🎉 Congratulations! You've Got Access!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Welcome to <strong>{firstAccessDoc.title}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-4 relative z-10">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {firstAccessDoc.introduction}
                  </p>
                  
                  <div className="flex flex-col space-y-3">
                    <Button
                      onClick={() => {
                        handleDocumentAccess(firstAccessDoc);
                        closeCelebration();
                      }}
                      className="gradient-ai hover:scale-105 transition-transform glow-red"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Access Document Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeCelebration}
                      className="glass-effect"
                    >
                      Access Later
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}