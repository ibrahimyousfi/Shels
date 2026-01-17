'use client';

interface TestConfigProps {
  testTypes: ('unit' | 'integration' | 'security' | 'performance')[];
  duration: 'one-time' | 'continuous';
  autoFix: boolean;
  onTestTypeChange: (type: 'unit' | 'integration' | 'security' | 'performance') => void;
  onDurationChange: (duration: 'one-time' | 'continuous') => void;
  onAutoFixChange: (autoFix: boolean) => void;
}

export default function TestConfig({
  testTypes,
  duration,
  autoFix,
  onTestTypeChange,
  onDurationChange,
  onAutoFixChange
}: TestConfigProps) {
  return (
    <div className="bg-[#171717] border border-[#2f0012] rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Test Configuration</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-400">Test Types</label>
        <div className="grid grid-cols-2 gap-3">
          {(['unit', 'integration', 'security', 'performance'] as const).map(type => (
            <label key={type} className="flex items-center text-gray-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={testTypes.includes(type)}
                onChange={() => onTestTypeChange(type)}
                className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] rounded focus:ring-gray-700"
              />
              {type.charAt(0).toUpperCase() + type.slice(1)} Tests
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-400">Duration</label>
        <div className="space-y-2">
          <label className="flex items-center text-gray-300 cursor-pointer hover:text-white">
            <input
              type="radio"
              name="duration"
              value="one-time"
              checked={duration === 'one-time'}
              onChange={() => onDurationChange('one-time')}
              className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] focus:ring-gray-700"
            />
            One-time test (run once)
          </label>
          <label className="flex items-center text-gray-300 cursor-pointer hover:text-white">
            <input
              type="radio"
              name="duration"
              value="continuous"
              checked={duration === 'continuous'}
              onChange={() => onDurationChange('continuous')}
              className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] focus:ring-gray-700"
            />
            Continuous monitoring (24/7)
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center text-gray-300 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={autoFix}
            onChange={(e) => onAutoFixChange(e.target.checked)}
            className="mr-2 w-4 h-4 text-gray-600 bg-[#1f1f1f] border-[#2f0012] rounded focus:ring-gray-700"
          />
          Enable automatic fixes
        </label>
      </div>
    </div>
  );
}
