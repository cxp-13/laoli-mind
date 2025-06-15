'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Globe, Mail, ArrowRight, Sparkles, User, Calendar, CheckCircle, Star, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import clsx from 'clsx';

interface Testimonial {
  id: string;
  email: string;
  document_title: string;
  document_introduction: string;
  created_at: string;
  first_access: boolean;
}

const EMAIL_SUFFIXES = [
  '@gmail.com', '@qq.com', '@163.com', '@126.com', '@outlook.com',
  '@hotmail.com', '@icloud.com', '@yahoo.com', '@foxmail.com', '@protonmail.com'
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

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

  // 实时补全逻辑
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // 只在没有@或@后没有内容时显示建议
    const atIndex = value.indexOf('@');
    if (atIndex === -1) {
      setSuggestions(EMAIL_SUFFIXES.map(suffix => value + suffix));
      setShowSuggestions(true);
    } else if (atIndex === value.length - 1) {
      setSuggestions(EMAIL_SUFFIXES.map(suffix => value.split('@')[0] + suffix));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // 选择建议
  const handleSuggestionClick = (suggestion: string) => {
    setEmail(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-emerald-900 to-black relative">
      <header className="absolute top-0 left-0 w-full flex items-center justify-end px-6 py-6 z-10">
        <Button
          variant="outline"
          className="rounded-full border-emerald-400 bg-black/60 text-emerald-300 hover:bg-emerald-900 active:scale-95 transition-all shadow"
          onClick={() => setShowPwdModal(true)}
        >
          Admin Panel
        </Button>
      </header>
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full absolute top-0 left-0 right-0 bottom-0">
        <h1 className="text-6xl md:text-8xl font-extrabold text-emerald-400 drop-shadow-lg tracking-tight font-manrope text-center">
          lantianlaoli
        </h1>
        <div className="mt-4 text-2xl md:text-3xl font-semibold text-white/80 font-inter text-center">
          Notion Super Warehouse
        </div>
        <div className="w-full max-w-xl mx-auto mt-16 flex justify-center">
          <form
            className="flex items-center gap-2 bg-black/70 rounded-2xl p-4 shadow-lg border border-emerald-700 glass-effect relative"
            onSubmit={handleEmailSubmit}
          >
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 100)}
              placeholder="Enter your email to get access"
              className="flex-1 px-5 py-3 rounded-full border-none bg-black/80 text-white text-lg font-inter focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-gray-400"
              autoComplete="off"
              required
            />
            <button
              type="submit"
              className="profit-btn rounded-full px-8 py-3 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold text-lg shadow-lg flex items-center gap-2 hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all relative overflow-hidden"
            >
              <span className="relative flex items-center">
                <Zap className="w-5 h-5 profit-zap transition-transform duration-200" />
              </span>
              Profit Now
            </button>
            {/* 补全建议下拉 */}
            {isInputFocused && showSuggestions && suggestions.length > 0 && (
              <>
                {/* 点击空白收起 */}
                <div
                  className="fixed inset-0 z-10"
                  onMouseDown={() => setShowSuggestions(false)}
                  aria-hidden="true"
                />
                <ul className="absolute left-0 right-0 top-full mt-2 bg-black/90 border border-emerald-700 rounded-xl shadow-lg z-20">
                  {suggestions.map(s => (
                    <li
                      key={s}
                      className="px-5 py-2 text-white hover:bg-emerald-600 cursor-pointer transition"
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </form>
        </div>
      </div>
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-black via-emerald-900 to-black rounded-2xl p-8 shadow-2xl w-full max-w-sm">
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block mb-4 text-lg font-semibold text-emerald-400">Please enter the admin password</label>
                <input
                  type="password"
                  value={adminPwd}
                  onChange={e => setAdminPwd(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-5 py-3 rounded-xl bg-black/80 text-white text-lg border-2 border-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-6 py-2 rounded-full bg-black text-white border border-emerald-500 hover:bg-emerald-900 transition"
                  onClick={() => {
                    setShowPwdModal(false);
                    setAdminPwd('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-bold shadow-lg hover:from-emerald-400 hover:to-green-400 hover:text-white active:scale-95 transition-all"
                  disabled={pwdLoading}
                >
                  {pwdLoading ? 'Verifying...' : 'Enter Admin Panel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}