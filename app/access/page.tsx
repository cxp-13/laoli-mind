'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ExternalLink, ArrowLeft, Sparkles, CheckCircle, Gift, SettingsIcon as Confetti, Star, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '../types';
import { format } from 'date-fns';

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
      return { text: 'Permanent Access', icon: <Zap className="w-3 h-3" />, variant: 'default' as const };
    }
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysLeft <= 0) {
      return { text: 'Expired', icon: <Clock className="w-3 h-3" />, variant: 'destructive' as const };
    } else if (daysLeft <= 7) {
      return { 
        text: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`, 
        icon: <Clock className="w-3 h-3" />, 
        variant: 'secondary' as const 
      };
    } else {
      return { 
        text: `Expires ${format(deadlineDate, 'MMM dd, yyyy')}`, 
        icon: <Clock className="w-3 h-3" />, 
        variant: 'outline' as const 
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-emerald-900 to-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-emerald-200">Loading your exclusive content...</p>
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
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="rounded-full px-6 py-2 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold text-lg shadow-lg border-none hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all flex items-center gap-2"
            style={{ minWidth: 120 }}
          >
            <ArrowLeft className="w-6 h-6" />
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
                {documents.map((doc, index) => {
                  const deadlineInfo = formatDeadline(doc.deadline);
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-effect border-emerald-700 hover:glow-green transition-all duration-300 h-full bg-black/70">
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2 text-emerald-300">
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3 text-white/80 mb-2">
                            {doc.introduction}
                          </CardDescription>
                          <div className="flex flex-row gap-2 mt-2">
                            {!doc.first_access && (
                              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accessed
                              </Badge>
                            )}
                            <Badge variant={deadlineInfo.variant} className="rounded-full px-3 py-1 text-xs font-semibold flex items-center">
                              {deadlineInfo.icon}
                              {deadlineInfo.text}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => handleDocumentAccess(doc)}
                            className="w-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold hover:from-emerald-400 hover:to-green-400 hover:text-white transition-transform"
                            disabled={deadlineInfo.variant === 'destructive'}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {deadlineInfo.variant === 'destructive' ? 'Expired' : 'View Document'}
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
              <Card className="glass-effect border-emerald-700 bg-gradient-to-br from-black via-emerald-900 to-black relative overflow-hidden">
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
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center mx-auto mb-4"
                  >
                    <Gift className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-emerald-400 mb-2">
                    🎉 Congratulations! You&apos;ve Got Access!
                  </CardTitle>
                  <CardDescription className="text-base text-white/90">
                    Welcome to <strong className="text-emerald-300">{firstAccessDoc.title}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-4 relative z-10">
                  <p className="text-sm text-emerald-200 leading-relaxed">
                    {firstAccessDoc.introduction}
                  </p>
                  <div className="flex flex-col space-y-3">
                    <Button
                      onClick={() => {
                        handleDocumentAccess(firstAccessDoc);
                        closeCelebration();
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all glow-green"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Access Document Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeCelebration}
                      className="glass-effect border-emerald-700 text-emerald-300"
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

      {/* Floating Feedback Button */}
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSfSgjX5KtEH8aJmOIE2aEbIA0KkvbGaIVdOMrMnUQ5AUUcyBA/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50"
        aria-label="Project Feedback Survey"
      >
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold shadow-lg hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
          Feedback
        </button>
      </a>
    </div>
  );
}