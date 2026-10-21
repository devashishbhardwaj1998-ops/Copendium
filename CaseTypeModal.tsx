import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, HelpCircle, ImageIcon, UploadCloud, Trash2, Eye, Loader2, Plus } from 'lucide-react';
import { CaseType, Section, SectionId, AssetAttachmentImage } from '../types';
import { processImageFile, formatFileSize } from '../utils/imageUtils';
import { ImageLightboxModal } from './ImageLightboxModal';

interface CaseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseTypeData: Partial<CaseType> & { name: string; sectionId: string; images?: AssetAttachmentImage[] }) => void;
  initialData?: CaseType | null;
  sections: Section[];
  defaultSectionId?: SectionId;
}

export const CaseTypeModal: React.FC<CaseTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  sections,
  defaultSectionId,
}) => {
  const [name, setName] = useState('');
  const [sectionId, setSectionId] = useState<string>('background');
  const [description, setDescription] = useState('');
  const [whyComplicated, setWhyComplicated] = useState('');
  const [analystChecklist, setAnalystChecklist] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [images, setImages] = useState<AssetAttachmentImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('Senior Database Analyst');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSectionId(initialData.sectionId);
      setDescription(initialData.description);
      setWhyComplicated(initialData.whyComplicated || '');
      setAnalystChecklist(initialData.analystChecklist || '');
      setTagsInput((initialData.tags || []).join(', '));
      setImages(initialData.images || []);
      setAuthorName(initialData.lastUpdatedBy || 'Database Editor');
    } else {
      setName('');
      setSectionId(defaultSectionId || 'background');
      setDescription('');
      setWhyComplicated('');
      setAnalystChecklist('');
      setTagsInput('');
      setImages([]);
      setAuthorName('Senior Database Analyst');
    }
    setErrors({});
  }, [initialData, defaultSectionId, isOpen]);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploadingImages(true);
    const validImageFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      setIsUploadingImages(false);
      return;
    }

    try {
      const processed = await Promise.all(validImageFiles.map((f) => processImageFile(f)));
      setImages((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error('Error processing case images', err);
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Case type name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: initialData?.id,
      name: name.trim(),
      sectionId,
      description: description.trim(),
      whyComplicated: whyComplicated.trim(),
      analystChecklist: analystChecklist.trim(),
      tags: parsedTags,
      images: images.length > 0 ? images : undefined,
      lastUpdatedBy: authorName.trim() || 'Database Editor',
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] z-10 animate-scale-in transition-colors">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/60 transition-colors">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'Edit Case Type' : 'Add New Case Type'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the complexity concept, checklist, and structure diagrams for analysts.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
            {/* Section Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author / Maintainer */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Editor / Author
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Senior Database Analyst"
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Case Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Case Type Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="e.g. Reverse Mergers, Mezzanine Financing, VIE Structures"
                className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>}
            </div>

            {/* 1. What is this? */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. What is this situation? (Description) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">Helps junior analysts understand the core concept</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                placeholder="Explain what happens in this corporate transaction or situation in clear, accessible language..."
                className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  errors.description ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
              {errors.description && <p className="text-xs text-rose-600 dark:text-rose-400">{errors.description}</p>}
            </div>

            {/* 2. Why is it complicated? */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>2. Why is it complicated &amp; difficult to update?</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">e.g. accounting shifts, shell entities, PIK interest</span>
              </label>
              <textarea
                rows={3}
                value={whyComplicated}
                onChange={(e) => setWhyComplicated(e.target.value)}
                placeholder="Detail the specific friction points: cap table distortions, predecessor vs successor periods, dilution, warrant liabilities..."
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* 3. Analyst Checklist */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>3. Analyst Checklist (What to look out for in Gain)</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">Use bullet points (•) for scannability</span>
              </label>
              <textarea
                rows={3}
                value={analystChecklist}
                onChange={(e) => setAnalystChecklist(e.target.value)}
                placeholder={"• Check accounting acquirer vs legal acquirer\n• Verify share count adjustment ratio\n• Ensure warrant liabilities are recorded correctly"}
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Upload Diagrams / Images for this Case Type */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Concept Diagrams &amp; Structure Flowcharts</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 normal-case font-normal">
                    ({images.length} {images.length === 1 ? 'diagram' : 'diagrams'})
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Diagram</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/70 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                {isUploadingImages ? (
                  <div className="flex items-center justify-center space-x-2 py-1 text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-medium">Processing diagram(s)...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-1 text-slate-500 dark:text-slate-400">
                    <UploadCloud className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Upload diagram
                      </span>{' '}
                      or flowchart explaining this case structure
                    </span>
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {images.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className="w-12 h-12 rounded overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"
                      >
                        <img src={img.dataUrl} alt={img.caption || img.name} className="w-full h-full object-cover" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{img.name}</p>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) =>
                            setImages((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, caption: e.target.value } : item))
                            )
                          }
                          placeholder="Caption / description for this diagram"
                          className="w-full text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(idx)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. M&A, Public Listing, PIPE, Shell Entity"
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2 transition-colors">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                {initialData ? 'Save Changes' : 'Create Case Type'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {lightboxIndex !== null && images.length > 0 && (
        <ImageLightboxModal
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
          images={images}
          initialIndex={lightboxIndex}
          title={name || 'Case Diagram'}
          subtitle={images[lightboxIndex]?.caption || images[lightboxIndex]?.name}
        />
      )}
    </>
  );
};
