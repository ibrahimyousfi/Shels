'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TestConfig from '@/components/TestConfig';
import ResultsView from '@/components/ResultsView';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useCodeTesting } from '@/hooks/useCodeTesting';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<{ message: string; type?: 'error' | 'warning' | 'info' } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [typingText, setTypingText] = useState('');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const typingRef = useRef<{ charIndex: number; isDeleting: boolean; timeoutId: NodeJS.Timeout | null }>({
    charIndex: 0,
    isDeleting: false,
    timeoutId: null
  });
  
  const sentences = [
    "Meet Shels: your autonomous testing agent",
    "Automate code testing, analysis, and fixes with AI",
    "Save hours of manual testing and debugging",
    "Catch bugs before they reach production",
    "Ship faster with confidence in your code quality"
  ];

  useEffect(() => {
    const currentSentence = sentences[currentSentenceIndex];
    
    const type = () => {
      const { charIndex, isDeleting } = typingRef.current;
      
      if (isDeleting) {
        setTypingText(currentSentence.substring(0, charIndex - 1));
        typingRef.current.charIndex--;
      } else {
        setTypingText(currentSentence.substring(0, charIndex + 1));
        typingRef.current.charIndex++;
      }

      if (!isDeleting && typingRef.current.charIndex === currentSentence.length) {
        typingRef.current.timeoutId = setTimeout(() => {
          typingRef.current.isDeleting = true;
          type();
        }, 2000);
        return;
      } else if (isDeleting && typingRef.current.charIndex === 0) {
        typingRef.current.isDeleting = false;
        setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length);
        return;
      }

      const speed = isDeleting ? 50 : 100;
      typingRef.current.timeoutId = setTimeout(type, speed);
    };

    typingRef.current.charIndex = 0;
    typingRef.current.isDeleting = false;
    typingRef.current.timeoutId = setTimeout(type, 100);
    
    return () => {
      if (typingRef.current.timeoutId) {
        clearTimeout(typingRef.current.timeoutId);
      }
    };
  }, [currentSentenceIndex]);
  const {
    repoUrl, files, testTypes, duration, autoFix, isAnalyzing, results, progress, marathonTaskId,
    setRepoUrl, setFiles, handleTestTypeChange, setDuration, setAutoFix, handleStartTesting,
    setMarathonTaskId, setErrorCallback, regenerateTimeline, regenerateMetrics, loadSession
  } = useCodeTesting();

  useEffect(() => {
    setErrorCallback?.((err: { message: string; type?: 'error' | 'warning' | 'info' }) => {
      setError(err);
      setTimeout(() => setError(null), 5000);
    });
  }, [setErrorCallback]);

  const handleStopMarathon = async () => {
    if (!marathonTaskId) return;
    await fetch('/api/marathon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop', taskId: marathonTaskId })
    });
    setMarathonTaskId(null);
  };

  const handleLoadSession = (session: any) => {
    loadSession(session);
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLoadSession={handleLoadSession}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto pt-16 px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="mb-12 mt-8">
              <h1 className="text-3xl font-bold mb-3 text-white flex items-center gap-3 min-h-[3rem]">
                <Image src="/icon.png" alt="Shels" width={40} height={40} className="w-10 h-10 flex-shrink-0" />
                <span className="flex-1">
                  {typingText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              <p className="text-base text-gray-400 mb-8">
                Shels will analyze, test, and fix your code automatically. Focus on what you care about while the agent works!
              </p>

              {/* Main Input with Dropdown */}
              <div className="bg-[#171717] border border-[#2f0012] rounded-lg mb-8">
                <div className="p-4 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors"
                      title="Settings"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors"
                      title="Upload Files"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setFiles(Array.from(e.target.files));
                          setRepoUrl('');
                        }
                      }}
                      className="hidden"
                      {...({ webkitdirectory: '' } as any)}
                    />
                    <button
                      onClick={() => window.open('https://github.com', '_blank')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
                    disabled={isAnalyzing}
                  />
                  <button
                    onClick={handleStartTesting}
                    disabled={isAnalyzing || (!repoUrl && files.length === 0)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                    title="Start Testing"
                  >
                    {isAnalyzing ? (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                  </button>
                </div>
                
                {/* Expanded Configuration */}
                {isExpanded && (
                  <div className="border-t border-[#2f0012] p-4 space-y-4">
                    {files.length > 0 && (
                      <div className="text-sm text-gray-400">
                        {files.length} files selected
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Test Types</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['unit', 'integration', 'security', 'performance'] as const).map(type => (
                            <label key={type} className="flex items-center text-gray-300 cursor-pointer hover:text-white text-sm">
                              <input
                                type="checkbox"
                                checked={testTypes.includes(type)}
                                onChange={() => handleTestTypeChange(type)}
                                className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] rounded focus:ring-gray-700"
                              />
                              {type.charAt(0).toUpperCase() + type.slice(1)} Tests
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Duration</label>
                        <div className="space-y-2">
                          <label className="flex items-center text-gray-300 cursor-pointer hover:text-white text-sm">
                            <input
                              type="radio"
                              name="duration"
                              value="one-time"
                              checked={duration === 'one-time'}
                              onChange={() => setDuration('one-time')}
                              className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] focus:ring-gray-700"
                            />
                            One-time test (run once)
                          </label>
                          <label className="flex items-center text-gray-300 cursor-pointer hover:text-white text-sm">
                            <input
                              type="radio"
                              name="duration"
                              value="continuous"
                              checked={duration === 'continuous'}
                              onChange={() => setDuration('continuous')}
                              className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] focus:ring-gray-700"
                            />
                            Continuous monitoring (24/7)
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center text-gray-300 cursor-pointer hover:text-white text-sm">
                          <input
                            type="checkbox"
                            checked={autoFix}
                            onChange={(e) => setAutoFix(e.target.checked)}
                            className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] rounded focus:ring-gray-700"
                          />
                          Enable automatic fixes
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Try Examples Section */}
            {!isAnalyzing && !results && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Try Shels out</h3>
                </div>
                <div className="flex gap-3">
                  {['React App', 'Node.js API', 'TypeScript Project'].map((example) => (
                    <button
                      key={example}
                      className="bg-[#171717] border border-[#2f0012] hover:border-[#4a0020] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Integrate Section */}
            {!isAnalyzing && !results && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white">Integrate Shels</h3>
                </div>
                <div className="flex gap-3">
                  <button className="bg-[#171717] border border-[#2f0012] hover:border-[#4a0020] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Configure Render
                  </button>
                  <button className="bg-[#171717] border border-[#2f0012] hover:border-[#4a0020] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download CLI
                  </button>
                  <button className="bg-[#171717] border border-[#2f0012] hover:border-[#4a0020] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <span className="text-sm">&lt; &gt;</span>
                    Try API
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {isAnalyzing && <LoadingSpinner progress={progress} />}

            {/* Results */}
            {results && (
              <ResultsView
                results={results}
                marathonTaskId={marathonTaskId}
                onError={(message, type) => setError({ message, type })}
                onStopMarathon={handleStopMarathon}
                onRegenerateTimeline={regenerateTimeline}
                onRegenerateMetrics={regenerateMetrics}
              />
            )}

            {/* Info Text */}
            {!isAnalyzing && !results && (
              <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-800/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  Shels is powerful and can execute on any inputs and repositories received. 
                  For best results, read the <a href="#" className="underline">usage guide</a>.
          </p>
        </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-[#2f0012] flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Open source licenses</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Use code with caution</a>
            </div>
        </div>
      </main>
      </div>

      {error && (
        <ErrorMessage
          message={error.message}
          type={error.type || 'error'}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
