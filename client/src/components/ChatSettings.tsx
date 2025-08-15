import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface ChatSettingsProps {
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  onSave: (settings: any) => void;
  onClose: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const updateSetting = (key: string, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Chat Settings
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Temperature: {localSettings.temperature}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={localSettings.temperature}
            onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Focused</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Tokens: {localSettings.maxTokens}
          </label>
          <input
            type="range"
            min="1"
            max="8192"
            step="1"
            value={localSettings.maxTokens}
            onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>

        {/* Top P */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Top P: {localSettings.topP}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localSettings.topP}
            onChange={(e) => updateSetting('topP', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Conservative</span>
            <span>Diverse</span>
          </div>
        </div>

        {/* Frequency Penalty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frequency Penalty: {localSettings.frequencyPenalty}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={localSettings.frequencyPenalty}
            onChange={(e) => updateSetting('frequencyPenalty', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Repetitive</span>
            <span>Varied</span>
          </div>
        </div>

        {/* Presence Penalty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Presence Penalty: {localSettings.presencePenalty}
          </label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={localSettings.presencePenalty}
            onChange={(e) => updateSetting('presencePenalty', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Focused</span>
            <span>Exploratory</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          What do these settings do?
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Temperature:</strong> Controls randomness. Lower values make responses more focused and deterministic.</li>
          <li><strong>Max Tokens:</strong> Maximum length of the AI's response.</li>
          <li><strong>Top P:</strong> Controls diversity by considering only the most likely tokens.</li>
          <li><strong>Frequency Penalty:</strong> Reduces repetition of the same information.</li>
          <li><strong>Presence Penalty:</strong> Encourages the model to talk about new topics.</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatSettings;
