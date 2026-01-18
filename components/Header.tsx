'use client';

interface HeaderProps {
  sidebarOpen?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ sidebarOpen = true, isMobile = false, onToggleSidebar }: HeaderProps) {
  return (
    <div className={`h-16 bg-[#0f0f0f] border-b border-[#2f0012] flex items-center justify-between ${isMobile ? 'px-4' : 'px-6'} fixed top-0 z-10 transition-all duration-300 ${
      isMobile 
        ? 'left-0 right-0' 
        : (sidebarOpen ? 'left-64 right-0' : 'left-16 right-0')
    }`}>
      <div className="flex items-center gap-3 md:gap-4">
        {isMobile && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <select className={`bg-[#1f1f1f] text-white ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} rounded-lg border border-[#2f0012] focus:outline-none focus:ring-1 focus:ring-gray-700`}>
          <option>Gemini 3 Flash</option>
          <option>Gemini 2.5 Flash</option>
          <option>Gemini 1.5 Flash</option>
        </select>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {!isMobile && (
          <a 
            href="https://github.com/ibrahimyousfi/Shels" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src="https://img.shields.io/badge/GitHub-Shels-181717?style=flat&logo=github&logoColor=white" 
              alt="GitHub Repository" 
              className="h-6"
            />
          </a>
        )}
        
        <button className={`text-gray-500 hover:text-white transition-colors flex items-center gap-2 ${isMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg hover:bg-[#1f1f1f]`}>
          <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {!isMobile && <span className="text-sm">Feedback</span>}
        </button>
      </div>
    </div>
  );
}
