'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getSessions, deleteSession, type Session } from '@/lib/services/sessionStorage';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLoadSession?: (session: Session) => void;
}

export default function Sidebar({ isOpen, onToggle, onLoadSession }: SidebarProps) {
  const [isSessionsOpen, setIsSessionsOpen] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSessions();
    // Refresh sessions every 5 seconds
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const allSessions = await getSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      await loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleLoadSession = (session: Session) => {
    onLoadSession?.(session);
  };

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.repoUrl?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`bg-[#0f0f0f] text-white h-screen flex flex-col fixed left-0 top-0 z-20 border-r border-[#2f0012] transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Logo & Toggle */}
      <div className="p-4 flex items-center justify-start">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 transition-all duration-300 hover:opacity-80"
        >
          {isOpen ? (
            <>
              {isHovering ? (
                // Show close panel icon when open and hovering
                <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="8" height="16" rx="1" />
                  <rect x="13" y="4" width="8" height="16" rx="1" />
                </svg>
              ) : (
                // Show app icon when open
                <Image src="/icon.png" alt="Shels" width={24} height={24} className="w-6 h-6 flex-shrink-0" />
              )}
              <span className="text-xl font-semibold whitespace-nowrap">Shels</span>
            </>
          ) : (
            // Show icon or open panel icon when closed and hovering
            isHovering ? (
              <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="8" height="16" rx="1" />
                <path d="M13 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 8v12" />
              </svg>
            ) : (
              <Image src="/icon.png" alt="Shels" width={24} height={24} className="w-6 h-6 flex-shrink-0" />
            )
          )}
        </button>
      </div>

      {/* Search */}
      <div className={`p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for repo or sessions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
          <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
        <button
          onClick={() => setIsSessionsOpen(!isSessionsOpen)}
          className="w-full flex items-center justify-between text-gray-400 hover:text-white mb-2"
        >
          <span className="text-sm font-medium">Recent sessions</span>
          <svg className={`w-4 h-4 transition-transform ${isSessionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        
        {isSessionsOpen && (
          <div className="mt-2 space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="bg-[#1f1f1f] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm">
                    {searchQuery ? 'No sessions found' : 'Recent sessions will show up here'}
                  </span>
                </div>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleLoadSession(session)}
                  className="bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-lg p-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{session.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(session.timestamp)}</p>
                      {session.repoUrl && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{session.repoUrl}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1"
                      title="Delete session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Connect to GitHub */}
      <div className={`p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
        <button className="w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="text-sm font-medium">Connect to GitHub</span>
        </button>
      </div>

      {/* Bottom Actions - Always Visible */}
      <div className="p-4 space-y-3">
        {/* Settings */}
        <button 
          className={`w-full flex items-center gap-3 text-gray-500 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-[#1f1f1f] ${isOpen ? 'justify-start' : 'justify-center'}`}
          title="Settings"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isOpen && <span className="text-sm">Settings</span>}
        </button>

        {/* Profile */}
        <button 
          className={`w-full flex items-center gap-3 text-gray-500 hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-[#1f1f1f] ${isOpen ? 'justify-start' : 'justify-center'}`}
          title="Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          {isOpen && <span className="text-sm">Profile</span>}
        </button>
      </div>
    </div>
  );
}
