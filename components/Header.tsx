'use client';

interface HeaderProps {
  sidebarOpen?: boolean;
}

export default function Header({ sidebarOpen = true }: HeaderProps) {
  return (
    <div className={`h-16 bg-[#0f0f0f] border-b border-[#2f0012] flex items-center justify-between px-6 fixed top-0 z-10 transition-all duration-300 ${sidebarOpen ? 'left-64 right-0' : 'left-16 right-0'}`}>
      <div className="flex items-center gap-4">
        <select className="bg-[#1f1f1f] text-white px-4 py-2 rounded-lg text-sm border border-[#2f0012] focus:outline-none focus:ring-1 focus:ring-gray-700">
          <option>Gemini 3 Flash</option>
          <option>Gemini 2.5 Flash</option>
          <option>Gemini 1.5 Flash</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        
        <button className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#1f1f1f]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">Feedback</span>
        </button>
      </div>
    </div>
  );
}
