import React, { useState } from 'react';
import { Building2, DollarSign, Layers, Search, ArrowRight, BookOpen, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { Section, CaseType, SectionId, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface HomePageProps {
  sections: Section[];
  onSelectSection: (sectionId: SectionId) => void;
  onSelectCaseType: (caseTypeId: string) => void;
  onOpenSearch: () => void;
  onAddCaseType: (defaultSectionId?: SectionId) => void;
  currentRole: UserRole;
}

export const HomePage: React.FC<HomePageProps> = ({
  sections,
  onSelectSection,
  onSelectCaseType,
  onOpenSearch,
  onAddCaseType,
  currentRole,
}) => {
  const allCaseTypes = storageService.getAllCaseTypes();

  // Section icons mapping
  const renderSectionIcon = (id: string) => {
    switch (id) {
      case 'background':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'financials':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-amber-600" />;
    }
  };

  // Recently updated cases
  const recentCases = [...allCaseTypes]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 4);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-full transition-colors">
      {/* Breadcrumb / Top Bar */}
      <nav className="px-6 sm:px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 shrink-0 transition-colors">
        <span className="text-slate-600 dark:text-slate-300 font-medium">Compendium — Knowledge Base Overview</span>
      </nav>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero & Search Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Analyst Reference Encyclopedia</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
                <span>Compendium</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hidden sm:inline-block">
                  Private Markets Complexity Book
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Structured reference documentation, verification checklists, and live Gain asset examples for researching complex private market transactions, financing facilities, and governance models.
              </p>
            </div>

            {/* Hero Search Box */}
            <div className="space-y-2 pt-1">
              <div
                onClick={onOpenSearch}
                className="cursor-pointer group flex items-center justify-between w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-lg p-3 sm:p-3.5 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                  <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Search cases, descriptions, or asset tickers (e.g. Reverse Merger, Mezzanine, PIPE)...
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs">
                    ⌘K
                  </kbd>
                  <span className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded transition-colors shadow-2xs">
                    Search
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Main Knowledge Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Core Knowledge Sections</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a section to browse structured topics and reference Gain assets.
                </p>
              </div>
              {currentRole === 'editor' && (
                <button
                  id="home-add-case-btn"
                  onClick={() => onAddCaseType()}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Add Case Type</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sections.map((sec) => {
                const caseTypesInSection = storageService.getCaseTypesBySection(sec.id);
                const totalExamples = caseTypesInSection.reduce(
                  (acc, ct) => acc + storageService.getExampleCountForCase(ct.id),
                  0
                );

                return (
                  <div
                    key={sec.id}
                    id={`section-card-${sec.id}`}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                  >
                    <div className="p-6 space-y-4">
                      {/* Top icon and count badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                          {renderSectionIcon(sec.id)}
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-100 dark:border-indigo-800">
                          {caseTypesInSection.length} Cases
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {sec.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {sec.description}
                        </p>
                      </div>

                      {/* Sample Cases Preview */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Featured Cases
                        </span>
                        <ul className="space-y-1">
                          {caseTypesInSection.slice(0, 3).map((c) => (
                            <li key={c.id}>
                              <button
                                onClick={() => onSelectCaseType(c.id)}
                                className="w-full text-left text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                              >
                                • {c.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {totalExamples} Gain Assets
                      </span>
                      <button
                        onClick={() => onSelectSection(sec.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors"
                      >
                        <span>View Section</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-Column: Recently Updated Cases & Analyst Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Recently Maintained */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                    Recently Updated Cases
                  </h4>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{allCaseTypes.length} Total Cases</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentCases.map((c) => {
                  const examplesCount = storageService.getExampleCountForCase(c.id);
                  const section = sections.find((s) => s.id === c.sectionId);

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCaseType(c.id)}
                      className="cursor-pointer p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {section?.name || 'General'}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{c.lastUpdated}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {c.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span>{examplesCount} Gain Assets</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Column: Analyst Workflow Protocol Card */}
            <div className="bg-slate-900 dark:bg-slate-900/90 rounded-xl p-6 text-white border border-slate-800 shadow-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Analyst Workflow Protocol
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Standard procedure for researching complex corporate transactions:
                </p>
                <ol className="space-y-2 text-xs text-slate-300 pl-1 list-decimal list-inside">
                  <li>
                    <span className="font-semibold text-white">Search</span> scenario in the Knowledge Book.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Follow</span> the verification checklist rules.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Reference</span> real Gain assets to match historical precedents.
                  </li>
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Verified by Senior Database Analyst Team
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
