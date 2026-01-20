'use client';

import { useEffect, useState } from 'react';
import { logger, LogEntry, LogLevel } from '@/lib/utils/logger';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await fetch(`/api/logs${filter !== 'ALL' ? `?level=${filter}` : ''}`);
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        }
      } catch (error) {
        console.error('Failed to load logs:', error);
      }
    };

    loadLogs();

    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh]);

  const clearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'text-red-400 bg-red-900/20';
      case LogLevel.WARN:
        return 'text-yellow-400 bg-yellow-900/20';
      case LogLevel.INFO:
        return 'text-blue-400 bg-blue-900/20';
      case LogLevel.DEBUG:
        return 'text-gray-400 bg-gray-900/20';
      default:
        return 'text-white';
    }
  };

  const errorLogs = logs.filter(log => log.level === LogLevel.ERROR).length;
  const warnLogs = logs.filter(log => log.level === LogLevel.WARN).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <div className="flex gap-4">
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Clear Logs
            </button>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded ${filter === 'ALL' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter(LogLevel.ERROR)}
              className={`px-4 py-2 rounded ${filter === LogLevel.ERROR ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              Errors ({errorLogs})
            </button>
            <button
              onClick={() => setFilter(LogLevel.WARN)}
              className={`px-4 py-2 rounded ${filter === LogLevel.WARN ? 'bg-yellow-600' : 'bg-gray-700'}`}
            >
              Warnings ({warnLogs})
            </button>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh (5s)
          </label>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No logs found</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className="border-b border-gray-700 pb-4 last:border-0"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-white mb-1">{log.message}</div>
                {log.error && (
                  <div className="text-red-400 text-sm mb-1">Error: {log.error}</div>
                )}
                {log.stack && (
                  <details className="mt-2">
                    <summary className="text-gray-400 text-sm cursor-pointer">Stack Trace</summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                      {log.stack}
                    </pre>
                  </details>
                )}
                {log.context && Object.keys(log.context).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-gray-400 text-sm cursor-pointer">Context</summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
