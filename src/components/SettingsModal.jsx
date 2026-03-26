import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Check, ShieldAlert } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) setApiKey(storedKey);
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        setTimeout(onClose, 500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1e1e1e] border border-[#333] p-6 w-[400px] shadow-2xl relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6 text-zinc-200">
                            <div className="bg-tech-orange/10 p-2 text-tech-orange">
                                <Key size={24} />
                            </div>
                            <h2 className="text-xl font-bold">API Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                    Gemini API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full bg-black/30 border border-[#333] text-white p-3 pr-10 focus:border-tech-orange outline-none transition-colors font-mono text-sm"
                                    />
                                    {apiKey && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tech-teal">
                                            <ShieldAlert size={14} className="opacity-0" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                    Your key is stored locally in your browser. Required for AI features.
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                className={`
                                    w-full py-2.5 font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                                    ${isSaved
                                        ? 'bg-tech-teal text-black'
                                        : 'bg-tech-orange text-black hover:bg-tech-orange-dark'
                                    }
                                `}
                            >
                                {isSaved ? (
                                    <><Check size={18} /> Saved</>
                                ) : (
                                    "Save Configuration"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
