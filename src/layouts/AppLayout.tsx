import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ChatWidget from "../components/ChatWidget";
import { User, Notification, AssetIssuance } from "../types";

interface AppLayoutProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  alertsCount?: number;
  notifications?: Notification[];
  onMarkNotificationRead?: (id: string) => void;
  issuances?: AssetIssuance[];
  title: string;
  children: React.ReactNode;
  refreshAll?: () => void;
}

export default function AppLayout({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  alertsCount = 0,
  notifications = [],
  onMarkNotificationRead,
  issuances = [],
  title,
  children,
  refreshAll,
}: AppLayoutProps) {
  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // Desktop collapsed/expanded state (defaults to open on desktop)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Auto-adapt on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

  const handleToggleSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarOpen((prev) => !prev);
    }
  }, []);

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(false);
    }
  };

  return (
    <div className="h-screen app-layout-root bg-[#020617] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))] text-slate-100 font-sans flex flex-col relative overflow-hidden antialiased transition-colors">
      {/* Mobile Drawer Overlay (NO blur filters to prevent screen blur artifacts) */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 mobile-drawer-overlay lg:hidden transition-opacity duration-200"
          aria-label="Close navigation overlay"
        />
      )}

      {/* Mobile Slide-Over Drawer (< lg screens) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#090d1a] sidebar-container border-r border-white/10 shadow-2xl lg:hidden transition-transform duration-200 ease-in-out ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onLogout={onLogout}
          alertsCount={alertsCount}
          notifications={notifications}
          issuances={issuances}
          onCloseSidebar={() => setIsMobileDrawerOpen(false)}
          onOpenChat={() => setIsChatOpen(!isChatOpen)}
        />
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 z-10 relative overflow-hidden h-screen">
        {/* Desktop Sidebar Column (>= lg screens) - Width animated without CSS transforms to keep text razor sharp */}
        <div
          className={`hidden lg:flex flex-col h-full bg-[#090d1a] sidebar-container border-r border-white/5 shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out ${
            isDesktopSidebarOpen ? "w-64" : "w-0 border-r-0"
          }`}
        >
          <div className="w-64 h-full flex flex-col">
            <Sidebar
              currentUser={currentUser}
              activeTab={activeTab}
              setActiveTab={handleSelectTab}
              onLogout={onLogout}
              alertsCount={alertsCount}
              notifications={notifications}
              issuances={issuances}
              onCloseSidebar={() => setIsDesktopSidebarOpen(false)}
              onOpenChat={() => setIsChatOpen(!isChatOpen)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto content-scroll-area bg-transparent">
          <Topbar
            currentUser={currentUser}
            title={title}
            onToggleSidebar={handleToggleSidebar}
            onRefresh={refreshAll}
            notifications={notifications}
            onMarkNotificationRead={onMarkNotificationRead}
          />

          <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto pb-12">
            {children}
          </main>

          <footer className="text-center py-4 border-t border-white/5 bg-[#070b16] app-footer text-[10px] text-slate-500 font-mono tracking-wider mt-auto shrink-0 select-none relative z-10">
            AIITS Automated System Portal • International Islamic University Islamabad
          </footer>
        </div>

        <ChatWidget currentUser={currentUser} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </div>
  );

}
