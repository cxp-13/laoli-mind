'use client';

import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setSelectedSuggestionIndex(-1);

    const atIndex = value.indexOf('@');
    if (atIndex === -1 && value.length > 0) {
      setSuggestions(EMAIL_SUFFIXES.map(suffix => value + suffix));
      setShowSuggestions(true);
    } else if (atIndex === value.length - 1) {
      setSuggestions(EMAIL_SUFFIXES.map(suffix => value.split('@')[0] + suffix));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(idx => (idx + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(idx => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        setEmail(suggestions[selectedSuggestionIndex]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.focus();
        e.preventDefault();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEmail(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative font-sans">
      {/* Admin Button - Fixed Position */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="outline"
          className="bg-gray-200 text-black px-4 py-2 rounded-lg text-sm hover:bg-gray-300 border-none font-medium"
          onClick={() => setShowPwdModal(true)}
        >
          admin
        </Button>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl space-y-12">
        {/* Graffiti Title - Reasonable size */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-none select-none"
          style={{ 
            fontFamily: "'Brush Script MT', 'Marker Felt', 'Comic Sans MS', cursive",
            fontWeight: '900',
            letterSpacing: '-0.02em',
            textShadow: `
              2px 2px 0px #333,
              4px 4px 0px #666,
              6px 6px 0px #999,
              8px 8px 15px rgba(0,0,0,0.6)
            `,
            transform: 'rotate(-1deg)',
            WebkitTextStroke: '1px #fff',
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))'
          }}
        >
          laoliMind
        </motion.h1>

        {/* Content Section */}
        <div className="w-full max-w-2xl relative space-y-8">
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl text-gray-300 font-light"
          >
            Enter your email, access the notion documents
          </motion.p>
          
          {/* Built in Bolt.new Badge */}
          <div className="absolute top-[-6rem] right-0 transform rotate-12 hidden lg:block">
            <div className="w-40 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-base font-medium text-center leading-tight"
              >
                built in<br/>Bolt.new
              </a>
            </div>
          </div>

          {/* Email Input Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleEmailSubmit} 
            className="relative w-full max-w-md mx-auto"
          >
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
                className="w-full pl-6 pr-16 py-4 bg-gray-800/80 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 border border-gray-700/50 text-lg"
                placeholder="your@email.com"
                autoComplete="off"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-transparent hover:bg-gray-700/50 text-white disabled:text-gray-500 transition-all"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-6 h-6" />
                )}
              </Button>
            </div>

            {/* Email Suggestions */}
            {isInputFocused && showSuggestions && suggestions.length > 0 && (
              <motion.ul 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 top-full mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto text-left"
              >
                {suggestions.map((s, idx) => (
                  <li
                    key={s}
                    className={`px-6 py-3 text-white hover:bg-gray-800/50 cursor-pointer transition-colors text-lg ${
                      selectedSuggestionIndex === idx ? 'bg-gray-700/50' : ''
                    }`}
                    onMouseDown={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </motion.form>
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-gray-500 text-sm space-y-1 pt-8"
        >
          <p className="font-light">Made by lantianlaoli</p>
          <p className="font-light">&copy;2025 lantianlaoli@gmail.com</p>
        </motion.footer>
      </div>

      {/* Admin Password Modal */}
      <AnimatePresence>
        {showPwdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPwdModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 w-full max-w-md"
            >
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Admin Access</h3>
                  <p className="text-gray-300 font-light">Enter your admin password to continue</p>
                </div>
                
                <input
                  type="password"
                  value={adminPwd}
                  onChange={e => setAdminPwd(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  required
                  className="w-full px-6 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-600 bg-gray-800/50 text-white hover:bg-gray-700/50 backdrop-blur-sm"
                    onClick={() => {
                      setShowPwdModal(false);
                      setAdminPwd('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={pwdLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {pwdLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Access Admin Panel'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}