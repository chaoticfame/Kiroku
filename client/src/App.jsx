import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Discover from './components/Discover';
import AddModal from './components/AddModal';
import AuthModal from './components/AuthModal';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [libraryInitialType, setLibraryInitialType] = useState('All');
  const [discoverInitialType, setDiscoverInitialType] = useState('anime');
  
  // Add/Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('Anime');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading Kiroku...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  // Navigation router
  const handleNavigate = (tab, options = {}) => {
    setActiveTab(tab);
    if (tab === 'library' && options.type) {
      setLibraryInitialType(options.type);
    }
    if (tab === 'discover' && options.type) {
      setDiscoverInitialType(options.type);
    }
  };

  // Open Add Modal from navbar or buttons
  const handleOpenAddModal = (defaultType = 'Anime') => {
    setModalInitialData(null);
    setModalDefaultType(defaultType);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal from Library
  const handleEditEntry = (entry) => {
    setModalInitialData(entry);
    setModalDefaultType(entry.type);
    setIsAddModalOpen(true);
  };

  // Quick add from suggestions or Jikan discover
  const handleQuickAdd = (item) => {
    setModalInitialData({
      type: item.type,
      title: item.title,
      image_url: item.image || item.image_url,
      progress: 0,
      rating: 0,
      status: item.type === 'Manga' ? 'Plan to Read' : 'Plan to Watch'
    });
    setModalDefaultType(item.type);
    setIsAddModalOpen(true);
  };

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            key={`dashboard-${refreshTrigger}`}
            onNavigate={handleNavigate}
            onOpenAddModal={handleOpenAddModal}
            onQuickAddSuggestion={handleQuickAdd}
          />
        )}

        {activeTab === 'library' && (
          <Library
            key={`library-${refreshTrigger}-${libraryInitialType}`}
            initialType={libraryInitialType}
            onOpenAddModal={handleOpenAddModal}
            onEditEntry={handleEditEntry}
          />
        )}

        {activeTab === 'discover' && (
          <Discover
            key={`discover-${discoverInitialType}`}
            initialType={discoverInitialType}
            onQuickAddFromJikan={handleQuickAdd}
          />
        )}
      </main>

      {/* Add / Edit Entry Modal */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={modalInitialData}
        defaultType={modalDefaultType}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Kiroku (記録) — Anime & Manga Tracker Web Application</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
