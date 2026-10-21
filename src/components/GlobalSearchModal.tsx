import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, ExternalLink, ArrowRight, CornerDownLeft, Sparkles, ImageIcon } from 'lucide-react';
import { SearchResultItem } from '../types';
import { storageService } from '../services/storageService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCaseType: (caseTypeId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCaseType,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (query.trim()) {
        setResults(storageService.search(query));
      } else {
        setResults([]);
      }
    }
  }, [isOpen, query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setResults(storageService.search(val));
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
    setResults(storageService.search(tag));
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const caseTypeResults = results.filter((r) => r.type === 'case_type');
  const assetResults = results.filter((r) => r.type === 'example_asset');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh] z-10 animate-scale-in transition-colors">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-white dark:bg-slate-900 transition-colors">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-modal-input"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search complex cases, descriptions, assets, notes..."
            className="w-full text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono shadow-2xs transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1 bg-white dark:bg-slate-900 transition-colors">
          {!query && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              Type to search by transaction scenario, keywords, checklists, or Gain asset names.
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No cases or assets match "{query}"</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try searching for broader terms like "SPAC", "debt", "carve-out", or a company name.
              </p>
            </div>
          )}

          {/* Case Types Group */}
          {caseTypeResults.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
                Case Types ({caseTypeResults.length})
              </h4>
              <div className="space-y-1">
                {caseTypeResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectCaseType(item.caseTypeId);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group flex items-start justify-between"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.sectionName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.snippet}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real Gain Asset Examples Group */}
          {assetResults.length > 0 && (
            <div className={caseTypeResults.length > 0 ? 'pt-3 border-t border-slate-200 dark:border-slate-800' : ''}>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
                Gain Asset Examples ({assetResults.length})
              </h4>
              <div className="space-y-1.5">
                {assetResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {item.sectionName} → {item.caseTypeName}
                        </span>
                        {item.images && item.images.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            <ImageIcon className="w-2.5 h-2.5 text-indigo-500" />
                            <span>{item.images.length} {item.images.length === 1 ? 'img' : 'imgs'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.snippet}</p>
                      {item.dealPurpose && item.matchField !== 'Deal Purpose' && (
                        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium line-clamp-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-400">Deal: </span>
                          {item.dealPurpose}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center flex-wrap justify-end">
                      <button
                        onClick={() => {
                          onSelectCaseType(item.caseTypeId);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                      >
                        View Case
                      </button>
                      {item.links && item.links.length > 0 ? (
                        item.links.slice(0, 2).map((l, lIdx) => (
                          <a
                            key={l.id || lIdx}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-md transition-colors"
                          >
                            <span>{l.title || 'Link'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))
                      ) : item.gainAssetUrl ? (
                        <a
                          href={item.gainAssetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-md transition-colors"
                        >
                          <span>Gain Asset</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <span>Search across Case Types, Descriptions, Checklists & Gain Assets</span>
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 shadow-2xs">ESC</kbd>
            <span>to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
