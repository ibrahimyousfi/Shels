'use client';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ message, onClose, type = 'error' }: ErrorMessageProps) {
  const bgColor = type === 'error' ? 'bg-red-900/20 border-[#2f0012]' : 
                   type === 'warning' ? 'bg-yellow-900/20 border-[#2f0012]' : 
                   'bg-blue-900/20 border-[#2f0012]';
  
  const textColor = type === 'error' ? 'text-red-300' : 
                    type === 'warning' ? 'text-yellow-300' : 
                    'text-blue-300';
  
  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} border-2 rounded-lg p-4 shadow-lg z-50 max-w-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <span className="text-xl mr-2">{icon}</span>
          <div className="flex-1">
            <p className={`font-semibold ${textColor} mb-1`}>
              {type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}
            </p>
            <p className={`text-sm ${textColor}`}>{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 ${textColor} hover:opacity-70`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
