import React from 'react';
import { Building2, DollarSign, Layers, BookOpen, Shield, ShieldCheck, History, ExternalLink, Sparkles, Lock, Unlock, Sun, Moon } from 'lucide-react';
import { Section, CaseType, SectionId, UserRole, ThemeMode } from '../types';
import { storageService } from '../services/storageService';

interface SidebarProps {
  sections: Section[];
  currentSectionId?: string;
  currentView: 'home' | 'section' | 'case';
  onNavigateHome: () => void;
  onNavigateSection: (sectionId: SectionId) => void;
  onSelectCaseType: (caseTypeId: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRequestEditorMode?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  currentSectionId,
  currentView,
  onNavigateHome,
  onNavigateSection,
  onSelectCaseType,
  currentRole,
  onRoleChange,
  onRequestEditorMode,
  isOpenMobile,
  onCloseMobile,
  theme,
  onToggleTheme,
}) => {
  const allCaseTypes = storageService.getAllCaseTypes();

  // Curated quick lookup cases
  const quickLookups = allCaseTypes.slice(0, 5);

  const getSectionCount = (sectionId: SectionId) => {
    return storageService.getCaseTypesBySection(sectionId).length;
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Sections Navigation */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Sections
              </h2>
              <button
                onClick={() => {
                  onNavigateHome();
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`text-[11px] font-semibold transition-colors ${
                  currentView === 'home'
                    ? 'text-indigo-600 dark:text-indigo-400 underline'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Overview
              </button>
            </div>

            <ul className="space-y-1">
              {sections.map((sec) => {
                const count = getSectionCount(sec.id);
                const isActive = currentView === 'section' && currentSectionId === sec.id;

                return (
                  <li key={sec.id}>
                    <button
                      onClick={() => {
                        onNavigateSection(sec.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{sec.name}</span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                          isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Lookups / Popular Cases */}
          <div>
            <h2 className="px-2 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
              <span>Quick Lookups</span>
            </h2>
            <ul className="space-y-0.5">
              {quickLookups.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelectCaseType(c.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors truncate block"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* User Role & Status Box */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
                {currentRole === 'editor' ? (
                  <Unlock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                )}
                <span>Access Level</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentRole === 'editor'
                    ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {currentRole === 'editor' ? 'Editor' : 'Analyst'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Active as <span className="font-semibold text-slate-700 dark:text-slate-200">{currentRole === 'editor' ? 'Senior Editor' : 'Database Analyst'}</span>.
            </p>
            <button
              onClick={() => {
                if (currentRole === 'analyst') {
                  if (onRequestEditorMode) {
                    onRequestEditorMode();
                  } else {
                    onRoleChange('editor');
                  }
                } else {
                  onRoleChange('analyst');
                }
              }}
              className="w-full text-left text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors pt-0.5 flex items-center justify-between"
            >
              <span>{currentRole === 'analyst' ? 'Unlock Editor Mode' : 'Lock to Analyst View'}</span>
              <span>→</span>
            </button>
          </div>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Theme</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 capitalize">
                {theme || 'light'} Mode
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
