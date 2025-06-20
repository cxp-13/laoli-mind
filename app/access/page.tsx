'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ExternalLink, ArrowLeft, Sparkles, CheckCircle, Gift, Clock, Zap, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '../types';
import { format, differenceInDays } from 'date-fns';

export interface AccessDocument extends Document {
  first_access: boolean;
  deadline?: string | null;
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
    window.open(doc.link, '_blank');
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setFirstAccessDoc(null);
  };

  // Helper function to format deadline display
  const formatDeadline = (deadline: string | null | undefined) => {
    if (!deadline) {
      return { text: 'Permanent Access', icon: <Zap className="w-4 h-4" />, color: 'green' };
    }
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = differenceInDays(deadlineDate, now);
    
    if (daysLeft <= 0) {
      return { text: 'Expired', icon: <Clock className="w-4 h-4" />, color: 'red' };
    } else if (daysLeft <= 7) {
      return { 
        text: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`, 
        icon: <Clock className="w-4 h-4" />, 
        color: 'orange'
      };
    } else {
      return { 
        text: `Expires ${format(deadlineDate, 'MMM dd, yyyy')}`, 
        icon: <Clock className="w-4 h-4" />, 
        color: 'orange'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading your exclusive content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="rounded-full px-6 py-2 bg-gray-800 text-white border-gray-700 hover:bg-gray-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300">{email}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {documents.length === 0 ? (
            <Card className="border-gray-800 text-center py-12 bg-zinc-900">
              <CardContent>
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gray-800">
                    <Brain className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No accessible content</h3>
                  <p className="text-gray-400">
                    You currently have no accessible documents. Please contact the administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white" style={{ textShadow: '0 2px 8px rgba(255, 255, 255, 0.15)' }}>Your Exclusive Content</h1>
                <p className="text-lg text-gray-500">
                  You have <span className="font-bold text-gray-300">{documents.length}</span> accessible documents
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {documents.map((doc, index) => {
                  const deadlineInfo = formatDeadline(doc.deadline);
                  const deadlineColorClasses = {
                    green: 'bg-green-800/50 text-green-300 border-green-500/20',
                    orange: 'bg-orange-800/50 text-orange-300 border-orange-500/20',
                    red: 'bg-red-800/50 text-red-300 border-red-500/20',
                  };

                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-zinc-900 border border-transparent hover:border-gray-700 flex flex-col shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-200 ease-in-out h-full">
                        <CardHeader className="flex-1">
                          <CardTitle className="text-lg text-white">
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400 mb-4 leading-relaxed">
                            {doc.introduction}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {!doc.first_access && (
                              <Badge className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-md bg-gray-700 text-gray-300 border-none">
                                <CheckCircle className="w-4 h-4" />
                                <span>Accessed</span>
                              </Badge>
                            )}
                            <Badge className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-md border ${deadlineColorClasses[deadlineInfo.color as keyof typeof deadlineColorClasses]}`}>
                              {deadlineInfo.icon}
                              <span>{deadlineInfo.text}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="mt-auto">
                          <Button
                            onClick={() => handleDocumentAccess(doc)}
                            className="w-full bg-gray-200 text-black font-bold hover:bg-white disabled:bg-gray-800 disabled:text-gray-500 transition-all active:scale-[0.98]"
                            disabled={deadlineInfo.color === 'red'}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {deadlineInfo.color === 'red' ? 'Expired' : 'View Document'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeCelebration}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <Card className="border-gray-700 bg-gray-900 relative overflow-hidden">
                {/* Celebration Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white"
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                      }}
                      animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: Math.random() * 1.5 + 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
                
                <CardHeader className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gray-800 mb-4 border border-gray-700">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    First Access Unlocked!
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    You've gained access to: <br />
                    <strong className="text-white">{firstAccessDoc.title}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <p className="text-gray-400 mb-6">
                    A confirmation email with the document link has been sent to you.
                  </p>
                  <Button
                    onClick={closeCelebration}
                    className="w-full bg-gray-200 text-black font-bold hover:bg-gray-300"
                  >
                    Got it!
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Feedback Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed bottom-8 right-8 z-20"
      >
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfSgjX5KtEH8aJmOIE2aEbIA0KkvbGaIVdOMrMnUQ5AUUcyBA/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-sm text-white font-semibold rounded-full shadow-lg border border-gray-700 hover:bg-gray-800 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          Feedback
        </a>
      </motion.div>
    </div>
  );
}