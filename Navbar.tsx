import React, { useEffect } from 'react';
import { Search, Shield, ShieldCheck, Download, Menu, X, Lock, Unlock, Sun, Moon } from 'lucide-react';
import { SectionId, UserRole, ThemeMode } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRequestEditorMode?: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateSection: (sectionId: SectionId) => void;
  onOpenSearch: () => void;
  onOpenDataModal: () => void;
  currentSectionId?: string;
  currentView: 'home' | 'section' | 'case';
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onRequestEditorMode,
  theme,
  onToggleTheme,
  onNavigateHome,
  onNavigateSection,
  onOpenSearch,
  onOpenDataModal,
  currentSectionId,
  currentView,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const toggleRole = () => {
    if (currentRole === 'analyst') {
      if (onRequestEditorMode) {
        onRequestEditorMode();
      } else {
        onRoleChange('editor');
      }
    } else {
      // Locking editor back to analyst mode requires no password
      onRoleChange('analyst');
    }
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      } else if (
        e.key === '/' &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const initials = currentRole === 'editor' ? 'ED' : 'AN';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 transition-colors">
      {/* Left: Mobile toggle + Brand Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <button
          id="navbar-logo-btn"
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <Logo size="md" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
              <span>Compendium</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block leading-none">
              Complexity Knowledge Book
            </p>
          </div>
        </button>
      </div>

      {/* Center: Search Bar with Geometric styling */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6 lg:mx-12">
        <div
          onClick={onOpenSearch}
          className="relative cursor-pointer group"
        >
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 pointer-events-none transition-colors">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            readOnly
            placeholder="Search case types, descriptions, or assets..."
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/90 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg py-2 pl-10 pr-12 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer group-hover:bg-slate-200/70 dark:group-hover:bg-slate-750 transition-all shadow-2xs"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700/90 border border-slate-200 dark:border-slate-600 rounded font-mono shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Role Switcher, Theme Toggle & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:text-indigo-600 transition-colors" />
          )}
        </button>

        {/* Switch Role Button with Lock State */}
        <button
          id="role-toggle-btn"
          onClick={toggleRole}
          className={`text-xs sm:text-sm font-semibold transition-all px-2.5 py-1.5 rounded-md flex items-center gap-1.5 ${
            currentRole === 'editor'
              ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80'
              : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
          }`}
        >
          {currentRole === 'editor' ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Editor Mode</span>
              <span className="sm:hidden">Editor</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="hidden sm:inline">Switch to Editor</span>
              <span className="sm:hidden">Editor</span>
            </>
          )}
        </button>

        {/* Export / Data Backup */}
        <button
          id="navbar-data-options-btn"
          onClick={onOpenDataModal}
          title="Export / Backup Knowledge Base"
          className="p-2 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* User Avatar Circle */}
        <div
          onClick={toggleRole}
          title={`Active as ${currentRole === 'editor' ? 'Senior Editor (Unlocked)' : 'Database Analyst (Read Only)'}. Click to toggle.`}
          className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shrink-0 select-none ${
            currentRole === 'editor'
              ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};
