import React, { useState, useEffect } from 'react';
import { X, MoveRight, Building2, DollarSign, Layers } from 'lucide-react';
import { CaseType, Section } from '../types';

interface MoveSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMove: (caseTypeId: string, targetSectionId: string) => void;
  caseType: CaseType | null;
  sections: Section[];
}

export const MoveSectionModal: React.FC<MoveSectionModalProps> = ({
  isOpen,
  onClose,
  onConfirmMove,
  caseType,
  sections,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  useEffect(() => {
    if (caseType) {
      setSelectedSectionId(caseType.sectionId);
    }
  }, [caseType, isOpen]);

  if (!isOpen || !caseType) return null;

  const currentSection = sections.find((s) => s.id === caseType.sectionId);

  const handleMove = () => {
    if (selectedSectionId && selectedSectionId !== caseType.sectionId) {
      onConfirmMove(caseType.id, selectedSectionId);
      onClose();
    }
  };

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'background':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'financials':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      default:
        return <Layers className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden z-10 animate-scale-in p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <MoveRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Move Case Type</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Moving case: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{caseType.name}</strong>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current Section: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentSection?.name}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select Target Section
          </label>
          <div className="space-y-2">
            {sections.map((s) => {
              const isSelected = selectedSectionId === s.id;
              const isCurrent = caseType.sectionId === s.id;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSectionId(s.id)}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600 dark:ring-indigo-500 text-indigo-950 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {getSectionIcon(s.id)}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center space-x-1.5">
                        <span>{s.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{s.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedSectionId === caseType.sectionId}
            onClick={handleMove}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
              selectedSectionId === caseType.sectionId
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white'
            }`}
          >
            Confirm Move
          </button>
        </div>
      </div>
    </div>
  );
};
