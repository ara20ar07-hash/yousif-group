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
  const { isOwnerLoggedIn, login, logout, authError } = useOwner();
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

                {authError && (authError.includes('admin-restricted-operation') || authError.includes('restricted-operation')) && (
                  <div className="mb-8 p-5 bg-amber/5 border border-amber/20 rounded-2xl text-start text-xs leading-relaxed">
                    <p className="font-semibold text-amber mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🛠️</span>
                      <span>{lang === 'ku' ? 'پاکسازی فایەربەیس پێویستە' : 'Firebase Auth Setup Needed'}</span>
                    </p>
                    <p className="mb-2 text-white/80">
                      {lang === 'ku' 
                        ? 'بۆ ئەوەی بتوانیت گۆڕانکارییەکان بە شێوەی ڕاستەوخۆ پاشەکەوت بکەیت، پێویستە سیستەمی چوونەژوورەوەی نەناسراو (Anonymous Auth) چالاک بکەیت لە فایەربەیس:' 
                        : 'To persist changes to the cloud database, please authorize Anonymous sign-in under Authentication in your Firebase project console:'}
                    </p>
                    <ol className="list-decimal ps-4 space-y-1 mb-3 text-white/60">
                      {lang === 'ku' ? (
                        <>
                          <li>لینکەکەی خوارەوە بکەرەوە تا بچیتە کۆنسۆڵ.</li>
                          <li>لە لای چەپ بڕۆ بەشی <strong>Authentication</strong> پاشان <strong>Sign-in method</strong>.</li>
                          <li>کلیک لەسەر <strong>Anonymous</strong> بکە، گڵۆپەکەی پێبکە و <strong>Save</strong> دابگرە.</li>
                        </>
                      ) : (
                        <>
                          <li>Click the link below to open your Firebase credentials portal.</li>
                          <li>Under <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong>, choose <strong>Anonymous</strong>.</li>
                          <li>Enable the toggle switch and click <strong>Save</strong>.</li>
                        </>
                      )}
                    </ol>
                    <a 
                      href="https://console.firebase.google.com/project/gen-lang-client-0516062385/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-navy bg-amber hover:bg-amber-bright text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-full transition-colors"
                    >
                      {lang === 'ku' ? 'کۆنسۆڵی فایەربەیس دابگرە ➔' : 'Activate in Firebase Console ➔'}
                    </a>
                  </div>
                )}

                {authError && !authError.includes('admin-restricted-operation') && !authError.includes('restricted-operation') && (
                  <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-start text-xs leading-relaxed">
                    <strong className="text-red-400 block mb-1">🔑 Firebase Auth Error</strong>
                    {authError}
                  </div>
                )}

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
                      {lang === 'ku' ? 'تێپەڕەوشە هەڵەیە. تکایە دووبارە تاقی بکەرەوە.' : 'Incorrect password. Please try again.'}
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
