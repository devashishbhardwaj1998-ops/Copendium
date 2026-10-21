export type SectionId = 'background' | 'financials' | 'others' | string;

export interface Section {
  id: SectionId;
  name: string;
  description: string;
  displayOrder: number;
  iconName: 'Building2' | 'DollarSign' | 'Layers' | 'Folder';
  colorTheme: string;
}

export interface CaseType {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  whyComplicated?: string;
  analystChecklist?: string;
  displayOrder: number;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  tags?: string[];
  images?: AssetAttachmentImage[];
}

export interface AssetAttachmentImage {
  id: string;
  name: string;
  dataUrl: string; // base64 data URL
  caption?: string;
  uploadedAt?: string;
  sizeBytes?: number;
}

export interface AssetLink {
  id?: string;
  title: string;
  url: string;
}

export interface ExampleAsset {
  id: string;
  caseTypeIds: string[]; // Can belong to multiple case types
  assetName: string;
  gainAssetUrl: string; // Kept for backward compatibility
  links?: AssetLink[]; // Multiple links option
  dealPurpose?: string; // Small box describing what the deal is for
  images?: AssetAttachmentImage[]; // Uploaded screenshots, structure diagrams, filings
  notes: string;
  tickerOrIdentifier?: string;
  transactionYear?: string;
  keyTakeaway?: string;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
}

export type UserRole = 'analyst' | 'editor';
export type ThemeMode = 'light' | 'dark';

export interface SearchResultItem {
  id: string;
  type: 'case_type' | 'example_asset';
  sectionId: string;
  sectionName: string;
  caseTypeId: string;
  caseTypeName: string;
  assetName?: string;
  title: string;
  subtitle: string;
  snippet: string;
  gainAssetUrl?: string;
  links?: AssetLink[];
  dealPurpose?: string;
  images?: AssetAttachmentImage[];
  matchField: 'Case Name' | 'Description' | 'Asset Name' | 'Example Note' | 'Checklist' | 'Deal Purpose';
}

export interface KnowledgeBookData {
  version: number;
  lastUpdated: string;
  sections: Section[];
  caseTypes: CaseType[];
  examples: ExampleAsset[];
}
