import { KnowledgeBookData, Section, CaseType, ExampleAsset, SearchResultItem, ThemeMode, AssetLink } from '../types';
import { INITIAL_KNOWLEDGE_BOOK_DATA } from '../data/seedData';

const STORAGE_KEY = 'gain_private_markets_knowledge_book_v1';
const ROLE_KEY = 'gain_knowledge_book_role_v1';
const PASSWORD_KEY = 'gain_compendium_editor_password_v1';
const THEME_KEY = 'gain_compendium_theme_v1';
const DEFAULT_EDITOR_PASSWORD = 'gain';

class StorageService {
  private data: KnowledgeBookData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): KnowledgeBookData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as KnowledgeBookData;
        if (parsed.sections && parsed.caseTypes && parsed.examples) {
          const seedMap = new Map(INITIAL_KNOWLEDGE_BOOK_DATA.examples.map((ex) => [ex.id, ex]));
          parsed.examples = parsed.examples.map((ex) => {
            const seedEx = seedMap.get(ex.id);
            const dealPurpose = ex.dealPurpose || seedEx?.dealPurpose;
            let links = ex.links && ex.links.length > 0 ? ex.links : seedEx?.links;
            if ((!links || links.length === 0) && ex.gainAssetUrl) {
              links = [{ title: 'Gain Asset', url: ex.gainAssetUrl }];
            }
            const images = ex.images && ex.images.length > 0 ? ex.images : seedEx?.images;
            return {
              ...ex,
              dealPurpose,
              links,
              images,
            };
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored knowledge book data, initializing seed data', e);
    }
    this.persist(INITIAL_KNOWLEDGE_BOOK_DATA);
    return INITIAL_KNOWLEDGE_BOOK_DATA;
  }

  private persist(data: KnowledgeBookData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.data = data;
      this.notify();
    } catch (e) {
      console.error('Failed to persist knowledge book data to localStorage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in storage listener', err);
      }
    });
  }

  // --- Read Operations ---
  public getData(): KnowledgeBookData {
    return this.data;
  }

  public getSections(): Section[] {
    return [...this.data.sections].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getSectionById(id: string): Section | undefined {
    return this.data.sections.find((s) => s.id === id);
  }

  public getCaseTypesBySection(sectionId: string): CaseType[] {
    return this.data.caseTypes
      .filter((c) => c.sectionId === sectionId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getAllCaseTypes(): CaseType[] {
    return [...this.data.caseTypes].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCaseTypeById(id: string): CaseType | undefined {
    return this.data.caseTypes.find((c) => c.id === id);
  }

  public getExamplesByCaseTypeId(caseTypeId: string): ExampleAsset[] {
    return this.data.examples
      .filter((ex) => ex.caseTypeIds.includes(caseTypeId))
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  public getAllExamples(): ExampleAsset[] {
    return [...this.data.examples];
  }

  public getExampleById(id: string): ExampleAsset | undefined {
    return this.data.examples.find((ex) => ex.id === id);
  }

  // Count helper
  public getCaseCountBySection(sectionId: string): number {
    return this.data.caseTypes.filter((c) => c.sectionId === sectionId).length;
  }

  public getExampleCountForCase(caseTypeId: string): number {
    return this.data.examples.filter((ex) => ex.caseTypeIds.includes(caseTypeId)).length;
  }

  // --- Write Operations (Admin / Editor) ---
  public saveCaseType(caseType: Partial<CaseType> & { name: string; sectionId: string }): CaseType {
    const isNew = !caseType.id;
    const now = new Date().toISOString().split('T')[0];
    const sectionCases = this.getCaseTypesBySection(caseType.sectionId);
    const nextOrder = sectionCases.length > 0 ? Math.max(...sectionCases.map((c) => c.displayOrder)) + 1 : 1;

    let savedCase: CaseType;

    if (isNew) {
      const generatedId = `case-${caseType.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`;
      savedCase = {
        id: generatedId,
        sectionId: caseType.sectionId,
        name: caseType.name.trim(),
        description: caseType.description?.trim() || '',
        whyComplicated: caseType.whyComplicated?.trim() || '',
        analystChecklist: caseType.analystChecklist?.trim() || '',
        displayOrder: caseType.displayOrder ?? nextOrder,
        createdBy: caseType.createdBy || 'Analyst Contributor',
        createdDate: now,
        lastUpdated: now,
        lastUpdatedBy: caseType.lastUpdatedBy || 'Database Editor',
        tags: caseType.tags || [],
        images: caseType.images && caseType.images.length > 0 ? caseType.images : undefined,
      };
      const updatedCaseTypes = [...this.data.caseTypes, savedCase];
      this.persist({
        ...this.data,
        lastUpdated: new Date().toISOString(),
        caseTypes: updatedCaseTypes,
      });
    } else {
      const existing = this.data.caseTypes.find((c) => c.id === caseType.id);
      savedCase = {
        id: caseType.id!,
        sectionId: caseType.sectionId || existing?.sectionId || 'background',
        name: caseType.name.trim(),
        description: caseType.description?.trim() || existing?.description || '',
        whyComplicated: caseType.whyComplicated !== undefined ? caseType.whyComplicated.trim() : existing?.whyComplicated,
        analystChecklist: caseType.analystChecklist !== undefined ? caseType.analystChecklist.trim() : existing?.analystChecklist,
        displayOrder: caseType.displayOrder ?? existing?.displayOrder ?? 1,
        createdBy: existing?.createdBy || 'Analyst Contributor',
        createdDate: existing?.createdDate || now,
        lastUpdated: now,
        lastUpdatedBy: caseType.lastUpdatedBy || 'Database Editor',
        tags: caseType.tags || existing?.tags || [],
        images: caseType.images !== undefined ? (caseType.images.length > 0 ? caseType.images : undefined) : existing?.images,
      };
      const updatedCaseTypes = this.data.caseTypes.map((c) => (c.id === caseType.id ? savedCase : c));
      this.persist({
        ...this.data,
        lastUpdated: new Date().toISOString(),
        caseTypes: updatedCaseTypes,
      });
    }

    return savedCase;
  }

  public deleteCaseType(id: string): boolean {
    const exists = this.data.caseTypes.some((c) => c.id === id);
    if (!exists) return false;

    // Filter out case type
    const updatedCaseTypes = this.data.caseTypes.filter((c) => c.id !== id);

    // Update examples to remove reference to this case type
    const updatedExamples = this.data.examples
      .map((ex) => ({
        ...ex,
        caseTypeIds: ex.caseTypeIds.filter((cid) => cid !== id),
      }))
      .filter((ex) => ex.caseTypeIds.length > 0); // Keep example only if it has other case types, or clean up

    this.persist({
      ...this.data,
      lastUpdated: new Date().toISOString(),
      caseTypes: updatedCaseTypes,
      examples: updatedExamples,
    });
    return true;
  }

  public moveCaseType(caseTypeId: string, targetSectionId: string): boolean {
    const caseType = this.data.caseTypes.find((c) => c.id === caseTypeId);
    if (!caseType || caseType.sectionId === targetSectionId) return false;

    const targetCases = this.getCaseTypesBySection(targetSectionId);
    const nextOrder = targetCases.length > 0 ? Math.max(...targetCases.map((c) => c.displayOrder)) + 1 : 1;

    const updatedCase: CaseType = {
      ...caseType,
      sectionId: targetSectionId,
      displayOrder: nextOrder,
      lastUpdated: new Date().toISOString().split('T')[0],
      lastUpdatedBy: 'Database Editor',
    };

    const updatedCaseTypes = this.data.caseTypes.map((c) => (c.id === caseTypeId ? updatedCase : c));
    this.persist({
      ...this.data,
      lastUpdated: new Date().toISOString(),
      caseTypes: updatedCaseTypes,
    });
    return true;
  }

  public reorderCaseTypes(sectionId: string, orderedIds: string[]) {
    const updatedCaseTypes = this.data.caseTypes.map((c) => {
      if (c.sectionId === sectionId) {
        const orderIdx = orderedIds.indexOf(c.id);
        if (orderIdx !== -1) {
          return { ...c, displayOrder: orderIdx + 1 };
        }
      }
      return c;
    });

    this.persist({
      ...this.data,
      caseTypes: updatedCaseTypes,
    });
  }

  public saveExample(example: Partial<ExampleAsset> & { assetName: string; caseTypeIds: string[] }): ExampleAsset {
    const isNew = !example.id;
    const now = new Date().toISOString().split('T')[0];

    // Normalize links list
    let normalizedLinks: AssetLink[] = (example.links || [])
      .map((l) => {
        let u = (l.url || '').trim();
        if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
          u = `https://${u}`;
        }
        return {
          id: l.id || `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: (l.title || '').trim() || 'Gain Asset',
          url: u,
        };
      })
      .filter((l) => Boolean(l.url));

    // Ensure valid gain asset URL fallback
    let formattedUrl = (example.gainAssetUrl || '').trim();
    if (normalizedLinks.length > 0) {
      formattedUrl = normalizedLinks[0].url;
    } else if (!formattedUrl) {
      formattedUrl = `https://gain.ai/assets/${encodeURIComponent(example.assetName.toLowerCase().replace(/\s+/g, '-'))}`;
      normalizedLinks = [{ id: 'link-default', title: 'Gain Asset', url: formattedUrl }];
    } else if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
      normalizedLinks = [{ id: 'link-default', title: 'Gain Asset', url: formattedUrl }];
    } else {
      normalizedLinks = [{ id: 'link-default', title: 'Gain Asset', url: formattedUrl }];
    }

    const cleanDealPurpose = example.dealPurpose?.trim() || undefined;

    let savedExample: ExampleAsset;

    if (isNew) {
      const generatedId = `ex-${example.assetName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`;
      savedExample = {
        id: generatedId,
        caseTypeIds: example.caseTypeIds,
        assetName: example.assetName.trim(),
        gainAssetUrl: formattedUrl,
        links: normalizedLinks,
        dealPurpose: cleanDealPurpose,
        images: example.images && example.images.length > 0 ? example.images : undefined,
        notes: example.notes?.trim() || '',
        tickerOrIdentifier: example.tickerOrIdentifier?.trim(),
        transactionYear: example.transactionYear?.trim(),
        keyTakeaway: example.keyTakeaway?.trim(),
        createdBy: example.createdBy || 'Analyst Contributor',
        createdDate: now,
        lastUpdated: now,
      };
      const updatedExamples = [savedExample, ...this.data.examples];
      this.persist({
        ...this.data,
        lastUpdated: new Date().toISOString(),
        examples: updatedExamples,
      });
    } else {
      const existing = this.data.examples.find((ex) => ex.id === example.id);
      savedExample = {
        id: example.id!,
        caseTypeIds: example.caseTypeIds || existing?.caseTypeIds || [],
        assetName: example.assetName.trim(),
        gainAssetUrl: formattedUrl,
        links: normalizedLinks.length > 0 ? normalizedLinks : (existing?.links || [{ title: 'Gain Asset', url: formattedUrl }]),
        dealPurpose: cleanDealPurpose !== undefined ? cleanDealPurpose : existing?.dealPurpose,
        images: example.images !== undefined ? (example.images.length > 0 ? example.images : undefined) : existing?.images,
        notes: example.notes !== undefined ? example.notes.trim() : (existing?.notes || ''),
        tickerOrIdentifier: example.tickerOrIdentifier !== undefined ? example.tickerOrIdentifier.trim() : existing?.tickerOrIdentifier,
        transactionYear: example.transactionYear !== undefined ? example.transactionYear.trim() : existing?.transactionYear,
        keyTakeaway: example.keyTakeaway !== undefined ? example.keyTakeaway.trim() : existing?.keyTakeaway,
        createdBy: existing?.createdBy || 'Analyst Contributor',
        createdDate: existing?.createdDate || now,
        lastUpdated: now,
      };
      const updatedExamples = this.data.examples.map((ex) => (ex.id === example.id ? savedExample : ex));
      this.persist({
        ...this.data,
        lastUpdated: new Date().toISOString(),
        examples: updatedExamples,
      });
    }

    return savedExample;
  }

  public deleteExample(id: string): boolean {
    const exists = this.data.examples.some((ex) => ex.id === id);
    if (!exists) return false;

    const updatedExamples = this.data.examples.filter((ex) => ex.id !== id);
    this.persist({
      ...this.data,
      lastUpdated: new Date().toISOString(),
      examples: updatedExamples,
    });
    return true;
  }

  // --- Global Search Functionality ---
  public search(query: string): SearchResultItem[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results: SearchResultItem[] = [];
    const sectionMap = new Map(this.data.sections.map((s) => [s.id, s.name]));
    const caseTypeMap = new Map(this.data.caseTypes.map((c) => [c.id, c]));

    // 1. Search Case Types
    for (const ct of this.data.caseTypes) {
      const sectionName = sectionMap.get(ct.sectionId) || 'General';
      const nameMatch = ct.name.toLowerCase().includes(cleanQuery);
      const descMatch = ct.description.toLowerCase().includes(cleanQuery);
      const whyMatch = ct.whyComplicated?.toLowerCase().includes(cleanQuery);
      const checklistMatch = ct.analystChecklist?.toLowerCase().includes(cleanQuery);
      const tagMatch = ct.tags?.some((t) => t.toLowerCase().includes(cleanQuery));

      if (nameMatch) {
        results.push({
          id: `search-ct-name-${ct.id}`,
          type: 'case_type',
          sectionId: ct.sectionId,
          sectionName,
          caseTypeId: ct.id,
          caseTypeName: ct.name,
          title: ct.name,
          subtitle: `${sectionName} • Case Type`,
          snippet: ct.description.slice(0, 160) + (ct.description.length > 160 ? '...' : ''),
          matchField: 'Case Name',
        });
      } else if (descMatch) {
        const idx = ct.description.toLowerCase().indexOf(cleanQuery);
        const start = Math.max(0, idx - 40);
        const end = Math.min(ct.description.length, idx + cleanQuery.length + 80);
        results.push({
          id: `search-ct-desc-${ct.id}`,
          type: 'case_type',
          sectionId: ct.sectionId,
          sectionName,
          caseTypeId: ct.id,
          caseTypeName: ct.name,
          title: ct.name,
          subtitle: `${sectionName} • Description Match`,
          snippet: (start > 0 ? '...' : '') + ct.description.slice(start, end) + (end < ct.description.length ? '...' : ''),
          matchField: 'Description',
        });
      } else if (whyMatch && ct.whyComplicated) {
        const idx = ct.whyComplicated.toLowerCase().indexOf(cleanQuery);
        const start = Math.max(0, idx - 40);
        const end = Math.min(ct.whyComplicated.length, idx + cleanQuery.length + 80);
        results.push({
          id: `search-ct-why-${ct.id}`,
          type: 'case_type',
          sectionId: ct.sectionId,
          sectionName,
          caseTypeId: ct.id,
          caseTypeName: ct.name,
          title: ct.name,
          subtitle: `${sectionName} • Complexity Context`,
          snippet: (start > 0 ? '...' : '') + ct.whyComplicated.slice(start, end) + (end < ct.whyComplicated.length ? '...' : ''),
          matchField: 'Description',
        });
      } else if (checklistMatch && ct.analystChecklist) {
        results.push({
          id: `search-ct-chk-${ct.id}`,
          type: 'case_type',
          sectionId: ct.sectionId,
          sectionName,
          caseTypeId: ct.id,
          caseTypeName: ct.name,
          title: ct.name,
          subtitle: `${sectionName} • Analyst Checklist`,
          snippet: ct.analystChecklist.slice(0, 140) + '...',
          matchField: 'Checklist',
        });
      } else if (tagMatch) {
        results.push({
          id: `search-ct-tag-${ct.id}`,
          type: 'case_type',
          sectionId: ct.sectionId,
          sectionName,
          caseTypeId: ct.id,
          caseTypeName: ct.name,
          title: ct.name,
          subtitle: `${sectionName} • Tag Match`,
          snippet: ct.description.slice(0, 140) + '...',
          matchField: 'Case Name',
        });
      }
    }

    // 2. Search Asset Examples
    for (const ex of this.data.examples) {
      const nameMatch = ex.assetName.toLowerCase().includes(cleanQuery);
      const noteMatch = ex.notes.toLowerCase().includes(cleanQuery);
      const tickerMatch = ex.tickerOrIdentifier?.toLowerCase().includes(cleanQuery);
      const takeawayMatch = ex.keyTakeaway?.toLowerCase().includes(cleanQuery);
      const purposeMatch = ex.dealPurpose?.toLowerCase().includes(cleanQuery);
      const linkMatch = ex.links?.some(
        (l) => l.title.toLowerCase().includes(cleanQuery) || l.url.toLowerCase().includes(cleanQuery)
      );
      const imageMatch = ex.images?.some(
        (img) =>
          img.name.toLowerCase().includes(cleanQuery) ||
          (img.caption && img.caption.toLowerCase().includes(cleanQuery))
      );

      if (nameMatch || noteMatch || tickerMatch || takeawayMatch || purposeMatch || linkMatch || imageMatch) {
        // For each case type this asset belongs to, add a result context
        for (const cId of ex.caseTypeIds) {
          const caseType = caseTypeMap.get(cId);
          if (caseType) {
            const sectionName = sectionMap.get(caseType.sectionId) || 'General';
            let matchField: SearchResultItem['matchField'] = 'Asset Name';
            let snippetText = ex.notes;

            if (purposeMatch && ex.dealPurpose) {
              matchField = 'Deal Purpose';
              snippetText = `Deal Purpose: ${ex.dealPurpose}`;
            } else if (nameMatch || tickerMatch) {
              matchField = 'Asset Name';
              snippetText = ex.dealPurpose ? `Deal: ${ex.dealPurpose}` : (ex.notes || `Real Gain asset example in ${caseType.name}`);
            } else if (takeawayMatch && ex.keyTakeaway) {
              matchField = 'Example Note';
              snippetText = `Takeaway: ${ex.keyTakeaway}`;
            } else if (imageMatch) {
              matchField = 'Example Note';
              const matchedImg = ex.images?.find(
                (img) =>
                  img.name.toLowerCase().includes(cleanQuery) ||
                  (img.caption && img.caption.toLowerCase().includes(cleanQuery))
              );
              snippetText = `Attached image: ${matchedImg?.caption || matchedImg?.name}`;
            } else if (linkMatch) {
              matchField = 'Asset Name';
              const matchedLink = ex.links?.find(
                (l) => l.title.toLowerCase().includes(cleanQuery) || l.url.toLowerCase().includes(cleanQuery)
              );
              snippetText = `Link: ${matchedLink?.title || 'External reference'} (${matchedLink?.url})`;
            } else {
              matchField = 'Example Note';
              const idx = ex.notes.toLowerCase().indexOf(cleanQuery);
              const start = Math.max(0, idx - 40);
              const end = Math.min(ex.notes.length, idx + cleanQuery.length + 80);
              snippetText = (start > 0 ? '...' : '') + ex.notes.slice(start, end) + (end < ex.notes.length ? '...' : '');
            }

            results.push({
              id: `search-ex-${ex.id}-${caseType.id}`,
              type: 'example_asset',
              sectionId: caseType.sectionId,
              sectionName,
              caseTypeId: caseType.id,
              caseTypeName: caseType.name,
              assetName: ex.assetName,
              title: ex.assetName,
              subtitle: `${sectionName} → ${caseType.name} → Example Asset`,
              snippet: snippetText,
              gainAssetUrl: ex.gainAssetUrl,
              links: ex.links,
              dealPurpose: ex.dealPurpose,
              images: ex.images,
              matchField,
            });
          }
        }
      }
    }

    return results;
  }

  // --- Export & Import ---
  public exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString) as KnowledgeBookData;
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        return { success: false, error: 'Invalid JSON: Missing sections array' };
      }
      if (!parsed.caseTypes || !Array.isArray(parsed.caseTypes)) {
        return { success: false, error: 'Invalid JSON: Missing caseTypes array' };
      }
      if (!parsed.examples || !Array.isArray(parsed.examples)) {
        return { success: false, error: 'Invalid JSON: Missing examples array' };
      }

      this.persist({
        version: parsed.version || 1,
        lastUpdated: new Date().toISOString(),
        sections: parsed.sections,
        caseTypes: parsed.caseTypes,
        examples: parsed.examples,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid JSON syntax' };
    }
  }

  public resetToDefaults() {
    this.persist(INITIAL_KNOWLEDGE_BOOK_DATA);
  }

  // --- Role & Password Management ---
  public getStoredRole(): 'analyst' | 'editor' {
    const r = localStorage.getItem(ROLE_KEY);
    return r === 'editor' ? 'editor' : 'analyst';
  }

  public setStoredRole(role: 'analyst' | 'editor') {
    localStorage.setItem(ROLE_KEY, role);
    this.notify();
  }

  public getStoredEditorPassword(): string {
    const stored = localStorage.getItem(PASSWORD_KEY);
    return stored || DEFAULT_EDITOR_PASSWORD;
  }

  public verifyEditorPassword(passwordAttempt: string): boolean {
    const currentPass = this.getStoredEditorPassword();
    return passwordAttempt.trim() === currentPass.trim();
  }

  public setEditorPassword(newPassword: string): boolean {
    if (!newPassword || newPassword.trim().length < 2) return false;
    localStorage.setItem(PASSWORD_KEY, newPassword.trim());
    return true;
  }

  // --- Theme Management ---
  public getStoredTheme(): ThemeMode {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'dark' || t === 'light') return t;
    // Check system preference default
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  public setStoredTheme(theme: ThemeMode) {
    localStorage.setItem(THEME_KEY, theme);
    this.notify();
  }
}

export const storageService = new StorageService();
