import React from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
    settings: AppSettings;
    onSave: (newSettings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
    const handleChange = (key: keyof AppSettings, value: any) => {
        onSave({ ...settings, [key]: value });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-light text-white mb-2">Studio Settings</h2>
                <p className="text-zinc-500 text-sm">Customize your metadata generation workflow.</p>
            </div>

            <div className="space-y-6">
                {/* Custom Instructions */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                    <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Custom AI Instructions
                    </label>
                    <p className="text-xs text-zinc-500 mb-4">
                        Add specific rules for the AI (e.g., "Always include 'Editorial' in keywords", "Focus on food styling terms").
                    </p>
                    <textarea
                        value={settings.customInstructions}
                        onChange={(e) => handleChange('customInstructions', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 min-h-[120px]"
                        placeholder="e.g. Avoid using brand names, focus on conceptual keywords..."
                    />
                </div>

                {/* Export Options */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4">Export Preferences</h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-300">Include CSV Headers</p>
                            <p className="text-xs text-zinc-500">Required for Shutterstock bulk upload</p>
                        </div>
                        <button
                            onClick={() => handleChange('csvHeader', !settings.csvHeader)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.csvHeader ? 'bg-purple-600' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.csvHeader ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
