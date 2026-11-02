import React, { useState, useEffect } from 'react';
import { RentalProvider, useRental } from './context/RentalContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { PropertyDetailsView } from './views/PropertyDetailsView';
import { PostPropertyView } from './views/PostPropertyView';
import { MessagesView } from './views/MessagesView';
import { FavoritesView } from './views/FavoritesView';
import { ManagePropertyView } from './views/ManagePropertyView';
import { AdminModerationView } from './views/AdminModerationView';
import { StaticInfoModal } from './views/StaticInfoModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

import { App as CapApp } from '@capacitor/app';

const AppContent: React.FC = () => {
  const { activePage, navigateTo, errorNotice, dismissError } = useRental();
  const [infoTopic, setInfoTopic] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Native Android hardware & gesture back button handling
  useEffect(() => {
    let listenerPromise: Promise<any> | null = null;
    try {
      listenerPromise = CapApp.addListener('backButton', () => {
        if (infoTopic) {
          setInfoTopic(null);
        } else if (showConfigModal) {
          setShowConfigModal(false);
        } else if (activePage !== 'home') {
          navigateTo('home');
        } else {
          CapApp.exitApp();
        }
      });
    } catch {
      // Non-native browser environment
    }

    return () => {
      if (listenerPromise) {
        listenerPromise.then(handle => handle?.remove?.()).catch(() => {});
      }
    };
  }, [activePage, infoTopic, showConfigModal]);

  // Check URL hash for direct deep links (e.g. #manage?token=... or #admin)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#manage')) {
        const params = new URLSearchParams(hash.replace('#manage?', ''));
        const token = params.get('token');
        navigateTo('manage', null, token);
      } else if (hash === '#admin') {
        navigateTo('admin');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-[#167B62]/20 selection:text-[#167B62]">
      {/* Top Navbar */}
      <Navbar />

      {/* Notice Banner if offline or notice */}
      {errorNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
          <span>{errorNotice}</span>
          <button 
            onClick={dismissError}
            className="text-amber-900 font-bold ml-3 hover:underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Dynamic View Area */}
      <main className="flex-1">
        {activePage === 'home' && <HomeView />}
        {activePage === 'explore' && <ExploreView />}
        {activePage === 'details' && <PropertyDetailsView />}
        {activePage === 'post' && <PostPropertyView />}
        {activePage === 'messages' && <MessagesView />}
        {activePage === 'favorites' && <FavoritesView />}
        {activePage === 'manage' && <ManagePropertyView />}
        {activePage === 'admin' && <AdminModerationView />}
      </main>

      {/* Platform Footer */}
      <Footer 
        onOpenInfoModal={(topic) => setInfoTopic(topic)} 
        onOpenDatabaseSettings={() => setShowConfigModal(true)}
      />

      {/* Mobile Bottom Navigation Bar (< md viewports) */}
      <MobileBottomNav />

      {/* Legal & About Modal */}
      <StaticInfoModal topic={infoTopic} onClose={() => setInfoTopic(null)} />

      {/* Supabase Realtime Database Settings Modal */}
      <SupabaseConfigModal 
        isOpen={showConfigModal} 
        onClose={() => setShowConfigModal(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <RentalProvider>
      <AppContent />
    </RentalProvider>
  );
}
