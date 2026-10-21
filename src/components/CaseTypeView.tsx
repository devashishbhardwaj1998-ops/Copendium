import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
  MoveRight,
  AlertTriangle,
  CheckSquare,
  Building2,
  HelpCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Briefcase,
  Link as LinkIcon,
  ImageIcon,
  Eye,
} from 'lucide-react';
import { Section, CaseType, ExampleAsset, UserRole, SectionId, AssetAttachmentImage } from '../types';
import { storageService } from '../services/storageService';
import { formatFileSize } from '../utils/imageUtils';
import { ImageLightboxModal } from './ImageLightboxModal';

interface CaseTypeViewProps {
  caseType: CaseType;
  section: Section;
  examples: ExampleAsset[];
  onNavigateHome: () => void;
  onNavigateSection: (sectionId: SectionId) => void;
  onEditCaseType: (caseType: CaseType) => void;
  onDeleteCaseType: (caseType: CaseType) => void;
  onMoveCaseType: (caseType: CaseType) => void;
  onAddExample: (caseTypeId: string) => void;
  onEditExample: (example: ExampleAsset) => void;
  onDeleteExample: (example: ExampleAsset) => void;
  onSelectCaseType: (caseTypeId: string) => void;
  currentRole: UserRole;
}

export const CaseTypeView: React.FC<CaseTypeViewProps> = ({
  caseType,
  section,
  examples,
  onNavigateHome,
  onNavigateSection,
  onEditCaseType,
  onDeleteCaseType,
  onMoveCaseType,
  onAddExample,
  onEditExample,
  onDeleteExample,
  onSelectCaseType,
  currentRole,
}) => {
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: AssetAttachmentImage[];
    index: number;
    title: string;
    subtitle?: string;
  } | null>(null);

  const allCaseTypes = storageService.getAllCaseTypes();
  const caseTypeMap = new Map(allCaseTypes.map((c) => [c.id, c]));

  // Split checklist lines
  const checklistItems = (caseType.analystChecklist || '')
    .split('\n')
    .map((line) => line.replace(/^[•\-\*\d\.]\s*/, '').trim())
    .filter(Boolean);

  const fallbackChecklist = [
    "Verify the 'Target' vs 'Shell' / Legal vs Operating entity identities in Gain.",
    'Check for consolidated historical financials and stub periods pre-deal.',
    'Validate effective transaction date vs announcement/closing dates.',
    'Reconcile derivative liabilities, earn-outs, and share class structures.',
  ];

  const itemsToRender = checklistItems.length > 0 ? checklistItems : fallbackChecklist;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-full transition-colors">
      {/* Breadcrumb Navigation */}
      <nav className="px-6 sm:px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 shrink-0 flex-wrap transition-colors">
        <button
          onClick={onNavigateHome}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigateSection(section.id)}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {section.name}
        </button>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-xs">{caseType.name}</span>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Bar: Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                  {section.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Updated {caseType.lastUpdated || 'recently'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {caseType.name}
              </h1>
            </div>

            {/* Action Buttons for Editors */}
            {currentRole === 'editor' && (
              <div className="flex items-center gap-2 self-start shrink-0">
                <button
                  onClick={() => onMoveCaseType(caseType)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  title="Move to another section"
                >
                  <MoveRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Move</span>
                </button>
                <button
                  onClick={() => onEditCaseType(caseType)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteCaseType(caseType)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* 2-Column Grid (Left: Description, Complexity & Examples; Right: Checklist & Related Concepts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: What is this? */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0114 0z"
                    />
                  </svg>
                  <span>What is this situation?</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {caseType.description}
                </p>
              </div>

              {/* Card 2: Why is it complicated in Gain? */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 transition-colors">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Why is it complicated &amp; difficult to update?</span>
                </h3>
                <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-amber-50/40 dark:bg-amber-950/30 p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
                  {caseType.whyComplicated ||
                    'This transaction involves complex accounting treatment, multiple successive legal entities, stub periods, or non-standard equity conversion covenants that can distort metrics if entered incorrectly.'}
                </div>
              </div>

              {/* Card: Case Type Concept Diagrams (if any) */}
              {caseType.images && caseType.images.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Case Structure Diagrams &amp; Flowcharts</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {caseType.images.length} {caseType.images.length === 1 ? 'diagram' : 'diagrams'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {caseType.images.map((img, dIdx) => (
                      <button
                        key={img.id || dIdx}
                        type="button"
                        onClick={() =>
                          setLightboxState({
                            isOpen: true,
                            images: caseType.images!,
                            index: dIdx,
                            title: caseType.name,
                            subtitle: img.caption || img.name,
                          })
                        }
                        className="group relative rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/80 p-2 text-left hover:border-indigo-500 transition-all hover:shadow-xs"
                      >
                        <div className="w-full h-24 rounded bg-slate-100 dark:bg-slate-900 overflow-hidden mb-2 relative">
                          <img
                            src={img.dataUrl}
                            alt={img.caption || img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {img.caption || img.name}
                        </p>
                        {img.sizeBytes && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {formatFileSize(img.sizeBytes)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card 3: Examples in Gain Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center transition-colors">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Examples in Gain</h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                      {examples.length} {examples.length === 1 ? 'Asset' : 'Assets'}
                    </span>
                  </div>

                  {currentRole === 'editor' && (
                    <button
                      onClick={() => onAddExample(caseType.id)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Example</span>
                    </button>
                  )}
                </div>

                {examples.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No Gain examples added yet for this case type.</p>
                    {currentRole === 'editor' && (
                      <button
                        onClick={() => onAddExample(caseType.id)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Add the first Gain reference asset
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-2/5">
                            Deal &amp; Asset Name
                          </th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Key Context &amp; Notes
                          </th>
                          <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-48">
                            Links &amp; Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800">
                        {examples.map((ex) => {
                          const otherCaseTypes = ex.caseTypeIds
                            .filter((id) => id !== caseType.id)
                            .map((id) => caseTypeMap.get(id))
                            .filter(Boolean) as CaseType[];

                          return (
                            <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 align-top">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                  {ex.assetName}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5 flex-wrap">
                                  {ex.tickerOrIdentifier && (
                                    <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                                      {ex.tickerOrIdentifier}
                                    </span>
                                  )}
                                  {ex.transactionYear && <span>({ex.transactionYear})</span>}
                                </div>

                                {/* Small box describing what the deal is for */}
                                {ex.dealPurpose && (
                                  <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-0.5">
                                      <Briefcase className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                      <span>What this deal is for:</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                                      {ex.dealPurpose}
                                    </p>
                                  </div>
                                )}

                                {/* Attached Deal Images / Screenshots */}
                                {ex.images && ex.images.length > 0 && (
                                  <div className="mt-2.5 p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                      <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300">
                                        <ImageIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                        <span>Attached Images ({ex.images.length})</span>
                                      </span>
                                      <span className="font-normal lowercase text-slate-400">click to expand</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {ex.images.map((img, imgIdx) => (
                                        <button
                                          key={img.id || imgIdx}
                                          type="button"
                                          onClick={() =>
                                            setLightboxState({
                                              isOpen: true,
                                              images: ex.images!,
                                              index: imgIdx,
                                              title: ex.assetName,
                                              subtitle: img.caption || img.name,
                                            })
                                          }
                                          className="group relative flex items-center gap-1.5 p-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xs transition-all text-left"
                                          title={`View full image: ${img.caption || img.name}`}
                                        >
                                          <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-slate-100 dark:border-slate-750 bg-slate-100 dark:bg-slate-900 relative">
                                            <img
                                              src={img.dataUrl}
                                              alt={img.caption || img.name}
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-150"
                                            />
                                            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                              <Eye className="w-3 h-3" />
                                            </div>
                                          </div>
                                          <div className="pr-1 max-w-[110px]">
                                            <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                              {img.caption || img.name}
                                            </p>
                                            {img.sizeBytes && (
                                              <span className="text-[9px] text-slate-400 font-mono block">
                                                {formatFileSize(img.sizeBytes)}
                                              </span>
                                            )}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {otherCaseTypes.length > 0 && (
                                  <div className="pt-2 flex items-center gap-1 flex-wrap">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Also in:</span>
                                    {otherCaseTypes.map((ot) => (
                                      <button
                                        key={ot.id}
                                        onClick={() => onSelectCaseType(ot.id)}
                                        className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-0.2 rounded transition-colors"
                                      >
                                        {ot.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 align-top text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                                <div>{ex.notes}</div>
                                {ex.keyTakeaway && (
                                  <div className="mt-2 text-[11px] text-indigo-900 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/50 p-2 rounded border border-indigo-100 dark:border-indigo-900/60">
                                    <span className="font-bold text-indigo-950 dark:text-indigo-100">Takeaway: </span>
                                    {ex.keyTakeaway}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 align-top text-right">
                                <div className="flex flex-col items-end gap-2">
                                  {currentRole === 'editor' && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => onEditExample(ex)}
                                        title="Edit deal details, links, and images"
                                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteExample(ex)}
                                        title="Delete example"
                                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Images quick pill */}
                                  {ex.images && ex.images.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setLightboxState({
                                          isOpen: true,
                                          images: ex.images!,
                                          index: 0,
                                          title: ex.assetName,
                                          subtitle: ex.images![0]?.caption || ex.images![0]?.name,
                                        })
                                      }
                                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded border border-indigo-200/80 dark:border-indigo-800 transition-colors shadow-2xs"
                                      title="Open attached images"
                                    >
                                      <ImageIcon className="w-3 h-3 text-indigo-500" />
                                      <span>
                                        {ex.images.length} {ex.images.length === 1 ? 'image' : 'images'}
                                      </span>
                                    </button>
                                  )}

                                  {/* Multiple Links rendering */}
                                  <div className="flex flex-col items-end gap-1.5 w-full">
                                    {ex.links && ex.links.length > 0 ? (
                                      ex.links.map((link, lIdx) => (
                                        <a
                                          key={link.id || lIdx}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title={link.url}
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors shadow-2xs group max-w-full truncate ${
                                            lIdx === 0
                                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500'
                                              : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                          }`}
                                        >
                                          <span className="truncate">{link.title || 'View Link'}</span>
                                          <ExternalLink
                                            className={`w-3 h-3 shrink-0 ${
                                              lIdx === 0
                                                ? 'text-indigo-200'
                                                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                            }`}
                                          />
                                        </a>
                                      ))
                                    ) : (
                                      <a
                                        href={ex.gainAssetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                                      >
                                        <span>View Asset</span>
                                        <ExternalLink className="w-3 h-3 text-indigo-200 shrink-0" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Analyst Checklist */}
            <div className="space-y-6">
              {/* Analyst Checklist in Geometric Dark Theme */}
              <div className="bg-slate-900 dark:bg-slate-900/90 rounded-xl p-6 text-white border border-transparent dark:border-slate-800 shadow-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Analyst Checklist
                </h4>
                <ul className="space-y-4">
                  {itemsToRender.map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <div className="w-4 h-4 rounded border border-slate-600 shrink-0 mt-0.5 flex items-center justify-center text-indigo-400">
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Image Lightbox Modal */}
      {lightboxState && lightboxState.isOpen && (
        <ImageLightboxModal
          isOpen={true}
          onClose={() => setLightboxState(null)}
          images={lightboxState.images}
          initialIndex={lightboxState.index}
          title={lightboxState.title}
          subtitle={lightboxState.subtitle}
        />
      )}
    </div>
  );
};
