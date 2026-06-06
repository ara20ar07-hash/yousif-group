import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, ShieldCheck, LogOut } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useOwner } from './OwnerContext';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OwnerLoginModal({ isOpen, onClose }: OwnerLoginModalProps) {
  const { lang } = useLanguage();
  const { isOwnerLoggedIn, login, logout } = useOwner();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError(false);
      setPassword('');
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-navy-mid border border-white/10 w-full max-w-md p-8 rounded-[32px] shadow-2xl overflow-hidden z-10"
          >
            {/* Top golden accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-muted hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isOwnerLoggedIn ? (
              <div className="text-center pt-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                
                <h3 className="font-serif text-2xl text-text-main mb-2">
                  {lang === 'ku' ? 'تۆ وەک خاوەن کار چوویتەتە ژوورەوە' : 'You are logged in as Owner'}
                </h3>
                
                <p className="text-sm text-muted mb-8 leading-relaxed">
                  {lang === 'ku' 
                    ? 'ئێستا دەتوانیت وێنەی تازە بۆ هەر کام لە سیستەمەکان زیاد بکەیت یان بیسڕیتەوە لە پڕۆژەکانی پێشوودا.' 
                    : 'You can now add new project photos directly onto each system SOLUTIONS detail page.'}
                </p>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-[11px] tracking-widest uppercase py-4 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> {lang === 'ku' ? 'چوونەدەرەوە' : 'Log Out Admin'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-4">
                <div className="w-16 h-16 bg-amber/10 border border-amber/30 text-amber rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8" />
                </div>

                <h3 className="font-serif text-2xl text-text-main text-center mb-1">
                  {lang === 'ku' ? 'دەروازەی خاوەن کار' : 'Owner Portal'}
                </h3>
                <p className="text-xs text-muted text-center mb-8 uppercase tracking-widest">
                  {lang === 'ku' ? 'تکایە تێپەڕەوشە بنووسە' : 'Secured Administrator Area'}
                </p>

                <div className="mb-6">
                  <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
                    {lang === 'ku' ? 'تێپەڕەوشە (نهێنی)' : 'Owner Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="•••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    autoFocus
                    className="w-full bg-navy border border-white/10 text-text-main text-center text-lg tracking-[0.3em] px-4 py-3.5 rounded-2xl outline-none focus:border-amber transition-colors"
                  />
                  {error && (
                    <p className="text-xs text-red-400 mt-2 text-center">
                      {lang === 'ku' ? 'تێپەڕەوشە هەڵەیە. تکایە دووبارە تاقی بکەرەوە.' : 'Incorrect password. Hint: 12345'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber text-navy font-semibold text-[11px] tracking-widest uppercase py-4 rounded-full hover:bg-amber-bright transition-colors duration-200"
                >
                  {lang === 'ku' ? 'چوونە ژوورەوە' : 'Unlock Dashboard'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
