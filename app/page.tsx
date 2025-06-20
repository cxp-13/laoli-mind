'use client';

import { Button } from '@/components/ui/button';
import { Check, Sparkles, Send, Twitter, Github, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSpring, animated } from 'react-spring';

interface Testimonial {
  name: string;
  initials: string;
  text: string;
}

const EMAIL_SUFFIXES = [
  '@gmail.com', '@qq.com', '@163.com', '@126.com', '@outlook.com',
  '@hotmail.com', '@icloud.com', '@yahoo.com', '@foxmail.com', '@protonmail.com'
];

// AnimatedCount component for the number
function AnimatedCount({ to = 20, duration = 2000 }: { to?: number; duration?: number }) {
  const spring = useSpring({
    from: { val: 1 },
    to: { val: to },
    config: { duration },
    reset: false,
  });
  return (
    <animated.span style={{
      display: 'inline-block',
      minWidth: '2ch',
      color: '#8B5CF6',
      textShadow: '0 0 12px #8B5CF6, 0 0 32px #06B6D4',
    }} className="font-extrabold">
      {spring.val.to((v: number) => Math.floor(v))}
    </animated.span>
  );
}

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
  const [permissionCount, setPermissionCount] = useState<number | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Typing effect for dynamic part of subtitle
  const staticIntro = 'Access curated docs';
  const dynamicText = 'AI startup resources, and actionable SaaS templates.';
  // Pronounced pauses after key words/phrases (indices are after the character is typed)
  const typingPauses = [2, 9, 18, 28, 38]; // after 'AI', 'startup', 'resources,', 'and', 'actionable'
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const typingSpeed = 120; // ms per character (deliberate, slower)
  const pauseDuration = 900; // ms for pronounced pauses

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;

    // Blinking cursor
    if (isTyping) {
      cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
    } else {
      setShowCursor(false);
    }

    if (isTyping) {
      if (charIndex < dynamicText.length) {
        const isPause = typingPauses.includes(charIndex);
        typingTimeout = setTimeout(() => {
          setTypedText(dynamicText.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, isPause ? pauseDuration : typingSpeed);
      } else {
        setIsTyping(false);
        setShowCursor(false);
      }
    }

    return () => {
      clearTimeout(typingTimeout);
      clearInterval(cursorInterval);
    };
  }, [charIndex, isTyping, typingPauses]);

  useEffect(() => {
    const fetchPermissionCount = async () => {
      try {
        const response = await fetch('/api/permissions-count');
        const data = await response.json();
        if (data.success) {
          setPermissionCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching permission count:', error);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        const data = await response.json();
        if (data.success && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchPermissionCount();
    fetchTestimonials();
  }, []);


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

  const testimonialRows = testimonials.length > 0 ? [
    { items: [...testimonials, ...testimonials], duration: 120 },
    { items: [...testimonials.slice(testimonials.length / 2), ...testimonials.slice(0, testimonials.length / 2), ...testimonials.slice(testimonials.length / 2), ...testimonials.slice(0, testimonials.length / 2)], duration: 90, reverse: true },
    { items: [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)], duration: 150 },
  ] : [];


  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative font-sans" style={{ background: 'radial-gradient(circle at center, #1c1c1c, #000000)' }}>
      <style jsx global>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-blink { animation: blink 1s steps(2, start) infinite; }
        @keyframes blink { to { visibility: hidden; } }
      `}</style>
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
      <main className="flex-1 flex flex-col w-full">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 w-full">
          <div className="flex flex-col items-center w-full max-w-4xl space-y-12">
            {/* Graffiti Title */}
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
                  0 0 10px rgba(255, 255, 255, 0.2),
                  0 0 20px rgba(255, 255, 255, 0.2),
                  0 0 40px rgba(110, 231, 183, 0.5),
                  0 0 80px rgba(59, 130, 246, 0.5)
                `,
                transform: 'rotate(-1deg)',
              }}
            >
              laoliMind
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl font-light flex flex-wrap items-center justify-center gap-1 min-h-[2.5em]"
              aria-label="Access curated docs, AI startup resources, and actionable SaaS templates."
            >
              {staticIntro}
              <span className="inline-flex items-center mx-1 align-middle">
                <Image src="/notion.png" alt="Notion" width={28} height={28} className="inline-block align-middle rounded-sm shadow-md" style={{ marginBottom: '-4px' }} />
              </span>
              <span className="inline-block">
                {typedText}
                {isTyping && (
                  <span className="border-r-2 border-blue-400 ml-0.5 animate-blink" style={{ height: '1.2em', verticalAlign: 'middle' }} aria-hidden="true" />
                )}
              </span>
            </motion.p>

            {/* Content Section */}
            <div className="w-full max-w-md relative space-y-4">
              {/* Email Input Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleEmailSubmit}
                className="relative w-full mx-auto"
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
                    className="w-full pl-6 pr-16 py-4 bg-gray-900/50 backdrop-blur-sm rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50 text-lg"
                    placeholder="your@email.com"
                    autoComplete="off"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg bg-gradient-to-r from-teal-400 to-blue-500 text-white disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
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
                        className={`px-6 py-3 text-white hover:bg-gray-800/50 cursor-pointer transition-colors text-lg ${selectedSuggestionIndex === idx ? 'bg-gray-700/50' : ''
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
          </div>
        </section>

        {/* Testimonial Section */}
        {testimonials.length > 0 && (
          <section className="w-full pb-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full text-center"
            >
              {/* Animated Reader Count */}
              <div className="mb-8 flex justify-center">
                <span
                  className="text-3xl md:text-4xl font-extrabold tracking-tight"
                  style={{
                    fontFamily: 'Inter, "JetBrains Mono", "Montserrat", "Orbitron", Arial, sans-serif',
                    letterSpacing: '0.01em',
                    color: '#fff',
                    textShadow: '0 0 12px #8B5CF6, 0 0 32px #06B6D4',
                    background: 'linear-gradient(90deg, #8B5CF6 30%, #06B6D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <AnimatedCount to={20} duration={2200} />
                  <span className="text-3xl md:text-4xl font-extrabold align-baseline" style={{ color: '#8B5CF6', textShadow: '0 0 8px #8B5CF6' }}>+</span>
                  <span className="ml-2 font-bold" style={{ color: '#fff', textShadow: '0 0 8px #06B6D4' }}>views on the document.</span>
                </span>
              </div>
              {/* End Animated Reader Count */}
              <div className="relative w-full overflow-hidden space-y-4 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                {testimonialRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex w-max space-x-4"
                    style={{
                      animation: `scroll ${row.duration}s linear infinite`,
                      animationDirection: row.reverse ? 'reverse' : 'normal',
                    }}
                  >
                    {row.items.map((testimonial, index) => (
                      <div key={`${rowIndex}-${index}`} className="w-max flex-shrink-0">
                        <div className="flex items-center p-4 bg-gray-900/50 rounded-lg border border-gray-800/80 hover:border-blue-500/50 transition-colors duration-300">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold shrink-0">
                            {testimonial.initials}
                          </div>
                          <div className="ml-4 text-left">
                            <p className="font-semibold text-white leading-tight">{testimonial.name}</p>
                            <p className="text-sm text-gray-400 leading-tight">{`"${testimonial.text}"`}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full text-center p-8 text-gray-500 text-sm space-y-4"
      >
        <div className="flex justify-center items-center space-x-6">
          <a href="https://x.com/cxp1611642" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Twitter /></a>
          <a href="https://github.com/cxp-13" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors"><Github /></a>
        </div>
        <div>
          <p className="font-light">&copy;2025 lantianlaoli@gmail.com</p>
        </div>
      </motion.footer>

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
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                    <Sparkles className="w-8 h-8 text-gray-400" />
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
                  className="w-full px-6 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                    className="flex-1 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-500"
                  >
                    {pwdLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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