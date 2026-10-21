import React, { useState } from 'react';
import { Plus, Search, ArrowRight, Edit3, Trash2, MoveRight, Building2, DollarSign, Layers } from 'lucide-react';
import { Section, CaseType, UserRole, SectionId } from '../types';
import { storageService } from '../services/storageService';

interface SectionViewProps {
  section: Section;
  caseTypes: CaseType[];
  onNavigateHome: () => void;
  onSelectCaseType: (caseTypeId: string) => void;
  onAddCaseType: (sectionId: SectionId) => void;
  onEditCaseType: (caseType: CaseType) => void;
  onDeleteCaseType: (caseType: CaseType) => void;
  onMoveCaseType: (caseType: CaseType) => void;
  currentRole: UserRole;
}

export const SectionView: React.FC<SectionViewProps> = ({
  section,
  caseTypes,
  onNavigateHome,
  onSelectCaseType,
  onAddCaseType,
  onEditCaseType,
  onDeleteCaseType,
  onMoveCaseType,
  currentRole,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredCaseTypes = caseTypes.filter((c) => {
    const query = filterQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      (c.whyComplicated && c.whyComplicated.toLowerCase().includes(query)) ||
      (c.analystChecklist && c.analystChecklist.toLowerCase().includes(query)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)))
    );
  });

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'background':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'financials':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-full transition-colors">
      {/* Breadcrumbs Navigation */}
      <nav className="px-6 sm:px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 shrink-0 transition-colors">
        <button
          onClick={onNavigateHome}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium">{section.name}</span>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Section Banner Header */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center">
                  {getSectionIcon(section.id)}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {section.name} Cases
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {caseTypes.length} Cases
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                {section.description}
              </p>
            </div>

            {currentRole === 'editor' && (
              <button
                id="section-add-case-btn"
                onClick={() => onAddCaseType(section.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Case Type</span>
              </button>
            )}
          </div>

          {/* Search Filter Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Search ${section.name.toLowerCase()} case types or scenarios...`}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/90 rounded-lg py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none shadow-2xs transition-colors"
            />
          </div>

          {/* Grid of Case Types */}
          {filteredCaseTypes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-2 shadow-sm transition-colors">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No case types found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filterQuery ? `No cases match "${filterQuery}"` : 'No cases in this section yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCaseTypes.map((c) => {
                const examples = storageService.getExamplesByCaseTypeId(c.id);

                return (
                  <div
                    key={c.id}
                    id={`case-card-${c.id}`}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col justify-between p-5 space-y-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => onSelectCaseType(c.id)}
                          className="text-left font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                        >
                          {c.name}
                        </button>
                        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                          {examples.length} {examples.length === 1 ? 'Example' : 'Examples'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Updated {c.lastUpdated}
                      </span>

                      <div className="flex items-center gap-2">
                        {currentRole === 'editor' && (
                          <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCaseType(c);
                              }}
                              title="Edit Case Type"
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveCaseType(c);
                              }}
                              title="Move to another section"
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                            >
                              <MoveRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCaseType(c);
                              }}
                              title="Delete Case Type"
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => onSelectCaseType(c.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                        >
                          <span>Explore Case</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
