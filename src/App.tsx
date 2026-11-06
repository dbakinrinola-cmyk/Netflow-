/**
 * NETFLOW - Educational Social Media Platform
 * "Connect. Discover. Learn. Grow."
 */

import React, { useState, useEffect } from 'react';
import { User, Post, Quiz, PDFMaterial, LearningCategory } from './types/index.js';
import { api } from './services/api.js';
import { PWAInstallButton } from './components/pwa/PWAInstallButton.js';
import { OfflineIndicator } from './components/pwa/OfflineIndicator.js';
import { HomeView } from './components/views/HomeView.js';
import { DiscoverView } from './components/views/DiscoverView.js';
import { FlowsView } from './components/views/FlowsView.js';
import { CommunitiesView } from './components/views/CommunitiesView.js';
import { AIHubView } from './components/views/AIHubView.js';
import { MessagesView } from './components/views/MessagesView.js';
import { NotificationsView } from './components/views/NotificationsView.js';
import { ProfileView } from './components/views/ProfileView.js';
import { CreatePostModal } from './components/modals/CreatePostModal.js';
import { QuizModal } from './components/modals/QuizModal.js';
import { PDFViewerModal } from './components/modals/PDFViewerModal.js';
import { AuthModal } from './components/modals/AuthModal.js';
import { CinematicOpening } from './components/cinematic/CinematicOpening.js';
import {
  Home,
  Compass,
  PlaySquare,
  Users,
  Sparkles,
  MessageSquare,
  Bell,
  User as UserIcon,
  Plus,
  LogIn,
  ChevronDown,
  CheckCircle2,
  Film,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);
  const [viewingUserId, setViewingUserId] = useState<string | undefined>(undefined);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return sessionStorage.getItem('netflow_intro_played_session') !== 'true';
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('netflow_intro_played_session', 'true');
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowAccountMenu(false);
    setShowIntro(true);
  };

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activePDF, setActivePDF] = useState<PDFMaterial | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Initial user load
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.getCurrentUser();
        setCurrentUser(res.user);
      } catch (err) {
        // Fallback to Alex Chen demo
        try {
          const demoRes = await api.demoLogin('u_alex');
          setCurrentUser(demoRes.user);
        } catch {}
      }
    }
    loadUser();
  }, []);

  // Real-time Event Stream (SSE)
  useEffect(() => {
    if (!currentUser) return;
    const eventSource = new EventSource(`/api/realtime/stream?userId=${currentUser.id}`);

    eventSource.addEventListener('notification', () => {
      setUnreadNotifsCount((prev) => prev + 1);
    });

    eventSource.addEventListener('error', () => {
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [currentUser?.id]);

  const handleUserClick = (userId: string) => {
    setViewingUserId(userId);
    setActiveTab('profile');
  };

  const handleSwitchAccount = async (userId: string) => {
    try {
      const res = await api.demoLogin(userId);
      setCurrentUser(res.user);
      setShowAccountMenu(false);
      // Reset view to user's feed
      setViewingUserId(undefined);
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Initializing NETFLOW Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION BAR (Strict 3-Zone Contract)           */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single Text Element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                setViewingUserId(undefined);
              }}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="font-black text-white text-base">N</span>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  NETFLOW
                </span>
                <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                  Connect. Discover. Learn. Grow.
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Primary Navigation Links (Single-Line, No Wrapping) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => {
                setActiveTab('home');
                setViewingUserId(undefined);
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'home' && !viewingUserId ? 'text-blue-400 font-bold' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'discover' ? 'text-blue-400 font-bold' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setActiveTab('communities')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'communities' ? 'text-blue-400 font-bold' : ''
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Communities</span>
            </button>

            <button
              onClick={() => setActiveTab('flows')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'flows' ? 'text-blue-400 font-bold' : ''
              }`}
            >
              <PlaySquare className="w-4 h-4" />
              <span>Flows</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'ai' ? 'text-cyan-400 font-bold' : ''
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>NETFLOW AI</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'messages' ? 'text-blue-400 font-bold' : ''
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </button>
          </nav>

          {/* Zone 3: Actions (PWA install, Quick Switcher, Create, Notifications, Profile) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* PWA In-App Install Prompt */}
            <PWAInstallButton />

            {/* Notifications Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                activeTab === 'notifications' ? 'bg-slate-800 text-blue-400' : ''
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {/* Create CTA Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>

            {/* Account Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50 animate-in fade-in duration-150 space-y-2">
                  <div className="p-2 border-b border-slate-800">
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.role} · {currentUser.institution || 'Scholar'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewingUserId(undefined);
                      setActiveTab('profile');
                      setShowAccountMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-blue-400" />
                    <span>My Academic Profile</span>
                  </button>

                  <button
                    onClick={handleReplayIntro}
                    className="w-full text-left p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Replay Opening Sequence</span>
                  </button>

                  {/* Switch Demo Accounts */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                      Switch Demo Role
                    </span>
                    <button
                      onClick={() => handleSwitchAccount('u_alex')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser.id === 'u_alex' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>Alex Chen (Student)</span>
                      {currentUser.id === 'u_alex' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSwitchAccount('u_elena')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser.id === 'u_elena' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>Dr. Elena Vance (Physics Prof)</span>
                      {currentUser.id === 'u_elena' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSwitchAccount('u_marcus')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        currentUser.id === 'u_marcus' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>Marcus Thorne (CS Creator)</span>
                      {currentUser.id === 'u_marcus' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        setShowAuthModal(true);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs text-blue-400 hover:bg-slate-800 flex items-center gap-2 font-semibold"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Register or Sign In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN VIEW CONTAINER                                   */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-12">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            onOpenCreate={() => setShowCreateModal(true)}
            onOpenPDF={(pdf) => setActivePDF(pdf)}
            onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onUserClick={handleUserClick}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            currentUser={currentUser}
            onSelectCategory={(cat) => {
              setActiveTab('home');
            }}
            onUserClick={handleUserClick}
            onOpenCommunity={() => setActiveTab('communities')}
          />
        )}

        {activeTab === 'flows' && (
          <FlowsView
            currentUser={currentUser}
            onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
            onUserClick={handleUserClick}
          />
        )}

        {activeTab === 'communities' && (
          <CommunitiesView currentUser={currentUser} />
        )}

        {activeTab === 'ai' && (
          <AIHubView
            currentUser={currentUser}
            onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            currentUser={currentUser}
            onOpenPDF={(pdf) => setActivePDF(pdf)}
            onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            viewingUserId={viewingUserId}
            onOpenPDF={(pdf) => setActivePDF(pdf)}
            onOpenQuiz={(quiz) => setActiveQuiz(quiz)}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
          />
        )}
      </main>

      {/* ======================================================== */}
      {/* 3. MOBILE BOTTOM NAVIGATION DOCK                         */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => {
            setActiveTab('home');
            setViewingUserId(undefined);
          }}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'home' && !viewingUserId ? 'text-blue-400 font-bold' : ''
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'discover' ? 'text-blue-400 font-bold' : ''}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Discover</span>
        </button>

        {/* Center Floating Post (+) Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 -mt-4 border-2 border-[#0a0f1d]"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('flows')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'flows' ? 'text-blue-400 font-bold' : ''}`}
        >
          <PlaySquare className="w-5 h-5" />
          <span className="text-[10px]">Flows</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'text-cyan-400 font-bold' : ''}`}
        >
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px]">AI</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 4. MODALS & OVERLAYS                                     */}
      {/* ======================================================== */}
      {showCreateModal && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => {
            setActiveTab('home');
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {activeQuiz && (
        <QuizModal
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {activePDF && (
        <PDFViewerModal
          material={activePDF}
          onClose={() => setActivePDF(null)}
        />
      )}

      {/* Cinematic Opening Sequence */}
      {showIntro && (
        <CinematicOpening
          onComplete={handleIntroComplete}
          onSkip={handleIntroComplete}
        />
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
