import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Terminal, Globe, MessageCircle, Check, ChevronDown, Flame, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onToggleAICopilot: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onToggleAICopilot,
  onNavigateTab,
}) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const { language, setLanguage, currentLanguageOption, t } = useLanguage();
  const { theme, toggleTheme, isGogginsMode } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const avatarSrc = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsLangOpen(false);
  };

  return (
    <header className="navbar-glass overflow-hidden shrink-0 relative z-30">
      {/* 1.1 Demo Mode Disclaimer Banner Strip */}
      <div
        className={`px-3 sm:px-4 py-1 text-[9.5px] sm:text-[10.5px] font-bold tracking-wide text-center flex items-center justify-center gap-1.5 border-b select-none ${
          isGogginsMode
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            : 'bg-indigo-50/75 text-indigo-700 border-indigo-100/70'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isGogginsMode ? 'bg-amber-400' : 'bg-indigo-500'}`} />
        <span className="leading-tight">
          DEMO MODE — synthetic data from Kaggle educational-factor datasets; no real student PII is stored.
        </span>
      </div>

      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isGogginsMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <span
            className={`font-black text-lg tracking-[0.14em] ${
              isGogginsMode ? 'text-amber-400' : 'text-[#1A1A2E]'
            }`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            LUCIFER
          </span>
        </div>

        {/* Left: Search Bar Pill */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 flex-1 max-w-sm bg-slate-100/70 border border-slate-200/60 hover:bg-slate-100 px-4 py-2 rounded-full cursor-text transition-all focus-ring"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-[#9B9BB8] shrink-0" />
          <span className="text-xs font-semibold text-[#9B9BB8]">{t('searchPlaceholder')}</span>
          <kbd className="ml-auto text-[10px] font-black text-[#9B9BB8] bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
            ⌘ K
          </kbd>
        </button>

        {/* Right: Nav Pills + Avatar */}
        <div className="flex items-center gap-2">
          {/* STAY HARD / Dark Mode Toggle (Students only - hidden for Teachers) */}
          {user?.role !== 'teacher' && (
            <button
              onClick={toggleTheme}
              title={isGogginsMode ? "Switch to Light Mode" : "Switch to David Goggins Dark Mode"}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                isGogginsMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              {isGogginsMode ? (
                <>
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold tracking-wider text-amber-300">STAY HARD</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold">GOGGINS MODE</span>
                </>
              )}
            </button>
          )}

          {/* Terminal */}
          <button
            onClick={onOpenCommandPalette}
            className="navbar-pill hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#4A4A6A] uppercase tracking-wider cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 shrink-0" />
            <span>{t('terminal')}</span>
            <kbd className="text-[9px] font-black text-[#9B9BB8] bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/50">
              Ctrl+K
            </kbd>
          </button>

          {/* Language Button & Dropdown */}
          <div className="relative hidden md:block" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`navbar-pill flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isLangOpen ? 'ring-2 ring-indigo-500/30 bg-white shadow-sm' : ''
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-[#1A1A2E]">{currentLanguageOption.flag} {currentLanguageOption.code.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 text-[#9B9BB8] transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Dropdown Menu */}
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-card p-1.5 shadow-xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#9B9BB8] border-b border-slate-100 mb-1">
                  Select Language
                </div>
                <div className="space-y-0.5">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-[#1A1A2E] hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{lang.flag}</span>
                          <div className="text-left">
                            <p className="leading-none">{lang.name}</p>
                            <p className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-[#9B9BB8]'}`}>
                              {lang.nativeName}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <button
            onClick={onToggleAICopilot}
            className="navbar-pill hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#4A4A6A] uppercase tracking-wider cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{t('contact')}</span>
          </button>

          {/* Avatar */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            title={user ? `Signed in as ${user.name}` : 'Sign In'}
            className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#22D3EE] shadow-sm cursor-pointer ml-1 shrink-0 focus-ring"
          >
            <img
              src={avatarSrc}
              alt={user?.name || 'User'}
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </button>
        </div>
      </div>
    </header>
  );
};



