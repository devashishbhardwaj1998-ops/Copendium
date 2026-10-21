import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Check, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = storageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compendium-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;

    const res = storageService.importData(importText);
    if (res.success) {
      setImportStatus({ success: true, message: 'Knowledge base successfully imported!' });
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } else {
      setImportStatus({ success: false, message: res.error || 'Import failed. Check JSON format.' });
    }
  };

  const handleReset = () => {
    storageService.resetToDefaults();
    setShowResetConfirm(false);
    setImportStatus({ success: true, message: 'Reset to default knowledge book examples!' });
    setTimeout(() => {
      setImportStatus(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden z-10 animate-scale-in p-6 space-y-5 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Knowledge Base Data &amp; Backup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Export, import, or reset the encyclopedia repository</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 ${
              importStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {importStatus.success ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Export Knowledge Book</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download all case descriptions, checklist rules, and Gain asset links as a JSON file.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-650 border border-slate-300 dark:border-slate-600 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        {/* Import Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Import Knowledge Base JSON
          </h4>
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Choose File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">or paste JSON below</span>
          </div>

          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste exported Knowledge Book JSON here..."
            className="w-full text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {importText && (
            <button
              onClick={handleImportSubmit}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Apply Imported Knowledge Base
            </button>
          )}
        </div>

        {/* Reset Section */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 transition-colors">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default knowledge book examples</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg space-y-2">
              <p className="text-xs text-rose-900 dark:text-rose-300 font-semibold">
                Reset all cases &amp; examples to factory defaults?
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                This will overwrite any custom added cases with the default library.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
                >
                  Yes, Reset Now
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
