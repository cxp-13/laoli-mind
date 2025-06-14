'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Globe, Mail, ArrowRight, Sparkles, User, Calendar, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Testimonial {
  id: string;
  email: string;
  document_title: string;
  document_introduction: string;
  created_at: string;
  first_access: boolean;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.hasAccess) {
        window.location.href = `/access?email=${encodeURIComponent(email)}`;
      } else {
        toast.error('Sorry, you do not have access. Please contact the administrator.');
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('Error checking access, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPwd }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/admin';
      } else {
        toast.error(data.error || 'Password error');
      }
    } catch {
      toast.error('Verification failed, please try again');
    } finally {
      setPwdLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b border-white/10 glass-effect">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gradient">
            lantianlaoli Web3 x AI Transformation Hub
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPwdModal(true)}
            className="glass-effect hover:glow-red"
          >
            Admin Panel
          </Button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Animated Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center space-x-8 mb-8"
          >
            {[
              { Icon: Brain, color: 'text-purple-500', delay: 0 },
              { Icon: Zap, color: 'text-yellow-500', delay: 0.2 },
              { Icon: Globe, color: 'text-blue-500', delay: 0.4 },
            ].map(({ Icon, color, delay }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay, duration: 0.5 }}
                className={`p-4 rounded-full glass-effect animate-float ${color}`}
                style={{ animationDelay: `${delay}s` }}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
            ))}
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Web3 x AI</span>
              <br />
              <span className="text-slate-900 dark:text-white">Transformation Content Library</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              A professional Web3 and AI transformation content distribution platform, providing you with cutting-edge insights and practical guides.
            </p>
          </motion.div>

          {/* Email Access Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="glass-effect border-white/20 animate-glow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>Enter your email to access content</span>
                </CardTitle>
                <CardDescription>
                  Enter your email address to access exclusive content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-center glass-effect border-white/30"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full gradient-ai hover:scale-105 transition-transform glow-red"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Checking...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Access Content</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Testimonials Section */}
          {testimonials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-16 space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gradient">Trusted by Professionals</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Join {testimonials.length}+ users who are already transforming with Web3 & AI
                </p>
              </div>

              {/* Flowing Testimonials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {testimonials.slice(0, 9).map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.8 + (index * 0.1),
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className="glass-effect border-white/20 hover:glow-purple transition-all duration-500 h-full relative overflow-hidden group">
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full gradient-ai-subtle flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{maskEmail(testimonial.email)}</p>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(testimonial.created_at), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                          {!testimonial.first_access && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Accessed</span>
                            </div>
                          )}
                        </div>

                        <CardTitle className="text-base line-clamp-2 group-hover:text-gradient transition-all duration-300">
                          {testimonial.document_title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="relative z-10">


                        {/* Star rating visual */}
                        <div className="flex items-center space-x-1 mt-4 opacity-60">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </CardContent>

                      {/* Subtle bottom accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="flex justify-center items-center space-x-8 pt-8"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">{testimonials.length}+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">
                    {testimonials.filter(t => !t.first_access).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Documents Accessed</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">100%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-effect px-4 py-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-500">
          <p>&copy; 2024 lantianlaoli Web3 x AI Transformation Hub. All rights reserved.</p>
        </div>
      </footer>

      {/* 密码弹窗 */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-lg w-full max-w-xs">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Please enter the admin password</label>
                <Input
                  type="password"
                  value={adminPwd}
                  onChange={e => setAdminPwd(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPwdModal(false);
                    setAdminPwd('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pwdLoading}>
                  {pwdLoading ? 'Verifying...' : 'Enter Admin Panel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}