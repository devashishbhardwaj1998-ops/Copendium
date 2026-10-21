import React, { useState, useEffect } from 'react';
import { Section, CaseType, ExampleAsset, SectionId, UserRole, ThemeMode } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { SectionView } from './components/SectionView';
import { CaseTypeView } from './components/CaseTypeView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CaseTypeModal } from './components/CaseTypeModal';
import { ExampleModal } from './components/ExampleModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { MoveSectionModal } from './components/MoveSectionModal';
import { DataBackupModal } from './components/DataBackupModal';
import { EditorPasswordModal } from './components/EditorPasswordModal';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'section' | 'case'>('home');
  const [selectedSectionId, setSelectedSectionId] = useState<SectionId>('background');
  const [selectedCaseTypeId, setSelectedCaseTypeId] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getStoredTheme());

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // User Role State
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getStoredRole());
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingEditorAction, setPendingEditorAction] = useState<(() => void) | null>(null);

  // Reactive Data State from Storage
  const [sections, setSections] = useState<Section[]>(storageService.getSections());
  const [allCaseTypes, setAllCaseTypes] = useState<CaseType[]>(storageService.getAllCaseTypes());
  const [allExamples, setAllExamples] = useState<ExampleAsset[]>(storageService.getAllExamples());

  // Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Case Type Modal
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCaseType, setEditingCaseType] = useState<CaseType | null>(null);
  const [defaultSectionForAdd, setDefaultSectionForAdd] = useState<SectionId | undefined>('background');

  // Example Asset Modal
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [editingExample, setEditingExample] = useState<ExampleAsset | null>(null);
  const [defaultCaseTypeForAdd, setDefaultCaseTypeForAdd] = useState<string | undefined>(undefined);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'case' | 'example';
    item: CaseType | ExampleAsset;
  } | null>(null);

  // Move Modal
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingCaseType, setMovingCaseType] = useState<CaseType | null>(null);

  // Synchronize HTML element class with current theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setSections(storageService.getSections());
      setAllCaseTypes(storageService.getAllCaseTypes());
      setAllExamples(storageService.getAllExamples());
      setCurrentRole(storageService.getStoredRole());
      setTheme(storageService.getStoredTheme());
    });
    return () => unsubscribe();
  }, []);

  // Update theme handler
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storageService.setStoredTheme(nextTheme);
  };

  // Update role handler
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    storageService.setStoredRole(newRole);
  };

  const handleRequestEditorMode = (onUnlocked?: () => void) => {
    if (currentRole === 'editor') {
      if (onUnlocked) onUnlocked();
      return;
    }
    setPendingEditorAction(() => (onUnlocked ? onUnlocked : null));
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSuccess = () => {
    setCurrentRole('editor');
    storageService.setStoredRole('editor');
    if (pendingEditorAction) {
      pendingEditorAction();
      setPendingEditorAction(null);
    }
  };

  // Navigation Handlers
  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedCaseTypeId(null);
    setIsMobileSidebarOpen(false);
  };

  const handleNavigateSection = (sectionId: SectionId) => {
    setSelectedSectionId(sectionId);
    setSelectedCaseTypeId(null);
    setCurrentView('section');
    setIsMobileSidebarOpen(false);
  };

  const handleSelectCaseType = (caseTypeId: string) => {
    const targetCase = storageService.getCaseTypeById(caseTypeId);
    if (targetCase) {
      setSelectedSectionId(targetCase.sectionId);
      setSelectedCaseTypeId(caseTypeId);
      setCurrentView('case');
      setIsMobileSidebarOpen(false);
    }
  };

  // Case Type CRUD Handlers
  const handleOpenAddCaseType = (defaultSectionId?: SectionId) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setEditingCaseType(null);
        setDefaultSectionForAdd(defaultSectionId || selectedSectionId || 'background');
        setIsCaseModalOpen(true);
      });
      return;
    }
    setEditingCaseType(null);
    setDefaultSectionForAdd(defaultSectionId || selectedSectionId || 'background');
    setIsCaseModalOpen(true);
  };

  const handleOpenEditCaseType = (caseType: CaseType) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setEditingCaseType(caseType);
        setDefaultSectionForAdd(caseType.sectionId);
        setIsCaseModalOpen(true);
      });
      return;
    }
    setEditingCaseType(caseType);
    setDefaultSectionForAdd(caseType.sectionId);
    setIsCaseModalOpen(true);
  };

  const handleSaveCaseType = (data: Partial<CaseType> & { name: string; sectionId: string }) => {
    const saved = storageService.saveCaseType(data);
    if (currentView === 'case' && selectedCaseTypeId === saved.id) {
      setSelectedCaseTypeId(saved.id);
    }
  };

  const handleOpenDeleteCaseType = (caseType: CaseType) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setDeleteTarget({ type: 'case', item: caseType });
        setIsDeleteModalOpen(true);
      });
      return;
    }
    setDeleteTarget({ type: 'case', item: caseType });
    setIsDeleteModalOpen(true);
  };

  const handleOpenMoveCaseType = (caseType: CaseType) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setMovingCaseType(caseType);
        setIsMoveModalOpen(true);
      });
      return;
    }
    setMovingCaseType(caseType);
    setIsMoveModalOpen(true);
  };

  const handleConfirmMoveCaseType = (caseTypeId: string, targetSectionId: string) => {
    storageService.moveCaseType(caseTypeId, targetSectionId);
    if (currentView === 'case') {
      setSelectedSectionId(targetSectionId);
    }
  };

  // Example CRUD Handlers
  const handleOpenAddExample = (caseTypeId: string) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setEditingExample(null);
        setDefaultCaseTypeForAdd(caseTypeId);
        setIsExampleModalOpen(true);
      });
      return;
    }
    setEditingExample(null);
    setDefaultCaseTypeForAdd(caseTypeId);
    setIsExampleModalOpen(true);
  };

  const handleOpenEditExample = (example: ExampleAsset) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setEditingExample(example);
        setIsExampleModalOpen(true);
      });
      return;
    }
    setEditingExample(example);
    setIsExampleModalOpen(true);
  };

  const handleSaveExample = (data: Partial<ExampleAsset> & { assetName: string; caseTypeIds: string[] }) => {
    storageService.saveExample(data);
  };

  const handleOpenDeleteExample = (example: ExampleAsset) => {
    if (currentRole !== 'editor') {
      handleRequestEditorMode(() => {
        setDeleteTarget({ type: 'example', item: example });
        setIsDeleteModalOpen(true);
      });
      return;
    }
    setDeleteTarget({ type: 'example', item: example });
    setIsDeleteModalOpen(true);
  };

  // Delete confirmation
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'case') {
      const caseType = deleteTarget.item as CaseType;
      storageService.deleteCaseType(caseType.id);
      if (currentView === 'case' && selectedCaseTypeId === caseType.id) {
        handleNavigateSection(caseType.sectionId);
      }
    } else {
      const example = deleteTarget.item as ExampleAsset;
      storageService.deleteExample(example.id);
    }
    setDeleteTarget(null);
  };

  // Active objects for section or case view
  const currentSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const currentCaseTypes = storageService.getCaseTypesBySection(selectedSectionId);
  const activeCaseType = selectedCaseTypeId ? storageService.getCaseTypeById(selectedCaseTypeId) : null;
  const activeCaseExamples = selectedCaseTypeId ? storageService.getExamplesByCaseTypeId(selectedCaseTypeId) : [];

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors">
      {/* Top Header / Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onRequestEditorMode={() => handleRequestEditorMode()}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onNavigateHome={handleNavigateHome}
        onNavigateSection={handleNavigateSection}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        currentSectionId={selectedSectionId}
        currentView={currentView}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main App Layout: Sidebar + Central Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Persistent Geometric Sidebar */}
        <Sidebar
          sections={sections}
          currentSectionId={selectedSectionId}
          currentView={currentView}
          onNavigateHome={handleNavigateHome}
          onNavigateSection={handleNavigateSection}
          onSelectCaseType={handleSelectCaseType}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onRequestEditorMode={() => handleRequestEditorMode()}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
          {currentView === 'home' && (
            <HomePage
              sections={sections}
              onSelectSection={handleNavigateSection}
              onSelectCaseType={handleSelectCaseType}
              onOpenSearch={() => setIsSearchOpen(true)}
              onAddCaseType={handleOpenAddCaseType}
              currentRole={currentRole}
            />
          )}

          {currentView === 'section' && currentSection && (
            <SectionView
              section={currentSection}
              caseTypes={currentCaseTypes}
              onNavigateHome={handleNavigateHome}
              onSelectCaseType={handleSelectCaseType}
              onAddCaseType={handleOpenAddCaseType}
              onEditCaseType={handleOpenEditCaseType}
              onDeleteCaseType={handleOpenDeleteCaseType}
              onMoveCaseType={handleOpenMoveCaseType}
              currentRole={currentRole}
            />
          )}

          {currentView === 'case' && activeCaseType && currentSection && (
            <CaseTypeView
              caseType={activeCaseType}
              section={currentSection}
              examples={activeCaseExamples}
              onNavigateHome={handleNavigateHome}
              onNavigateSection={handleNavigateSection}
              onEditCaseType={handleOpenEditCaseType}
              onDeleteCaseType={handleOpenDeleteCaseType}
              onMoveCaseType={handleOpenMoveCaseType}
              onAddExample={handleOpenAddExample}
              onEditExample={handleOpenEditExample}
              onDeleteExample={handleOpenDeleteExample}
              onSelectCaseType={handleSelectCaseType}
              currentRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCaseType={handleSelectCaseType}
      />

      <CaseTypeModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onSave={handleSaveCaseType}
        initialData={editingCaseType}
        sections={sections}
        defaultSectionId={defaultSectionForAdd}
      />

      <ExampleModal
        isOpen={isExampleModalOpen}
        onClose={() => setIsExampleModalOpen(false)}
        onSave={handleSaveExample}
        initialData={editingExample}
        defaultCaseTypeId={defaultCaseTypeForAdd}
        allCaseTypes={allCaseTypes}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === 'case' ? 'Delete Case Type' : 'Delete Gain Asset Example'}
        message={
          deleteTarget?.type === 'case'
            ? 'Are you sure you want to delete this case type? Associated asset examples will remain in other cases if linked.'
            : 'Are you sure you want to remove this real asset example from the database?'
        }
        itemTitle={
          deleteTarget?.type === 'case'
            ? (deleteTarget.item as CaseType).name
            : (deleteTarget?.item as ExampleAsset)?.assetName || ''
        }
      />

      <MoveSectionModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        onConfirmMove={handleConfirmMoveCaseType}
        caseType={movingCaseType}
        sections={sections}
      />

      <DataBackupModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      <EditorPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingEditorAction(null);
        }}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}
