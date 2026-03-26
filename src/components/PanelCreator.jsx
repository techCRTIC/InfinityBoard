import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generatePanelImage, enhancePrompt } from '../utils/aiGenerator';
import { writeBinaryFile, createDir, exists } from '@tauri-apps/api/fs';
import { documentDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../store/useStore';

const PanelCreator = ({ isOpen, onClose }) => {
    const { addItem, items, panelCreatorReferenceImage, setPanelCreatorReferenceImage } = useStore();
    const fileInputRef = useRef(null);
    const dragControls = useDragControls();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [referenceImage, setReferenceImage] = useState(null);

    React.useEffect(() => {
        if (panelCreatorReferenceImage) {
            setReferenceImage(panelCreatorReferenceImage);
        }
    }, [panelCreatorReferenceImage]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const handleEnhance = async () => {
        if (!prompt) return;
        setIsEnhancing(true);
        try {
            const newPrompt = await enhancePrompt(prompt);
            setPrompt(newPrompt);
        } catch (error) {
            // Enhancement failed
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => { setReferenceImage(reader.result); };
            reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => { setReferenceImage(reader.result); };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt && !referenceImage) return;
        setIsGenerating(true);
        try {
            const base64Image = await generatePanelImage(prompt, referenceImage, aspectRatio);
            const filename = `panel-${uuidv4()}.png`;
            const filePath = await join(await documentDir(), 'InfiniteBoard', 'Panels', filename);
            const dir = await join(await documentDir(), 'InfiniteBoard', 'Panels');
            if (!(await exists(dir))) { await createDir(dir, { recursive: true }); }

            const binaryData = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
            await writeBinaryFile(filePath, binaryData);
            const assetUrl = convertFileSrc(filePath);

            let width = 300, height = 300;
            if (aspectRatio === "16:9") { width = 533; height = 300; }
            else if (aspectRatio === "9:16") { width = 300; height = 533; }
            else if (aspectRatio === "4:3") { width = 400; height = 300; }
            else if (aspectRatio === "3:4") { width = 300; height = 400; }

            addItem({ id: uuidv4(), type: 'image', content: assetUrl, x: window.innerWidth / 2 - (width / 2), y: window.innerHeight / 2 - (height / 2), width, height, rotation: 0 });
            setPrompt('');
            setReferenceImage(null);
        } catch (error) {
            // Generation failed
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    drag dragListener={false} dragControls={dragControls} dragMomentum={false}
                    className="fixed bottom-24 right-6 z-50 w-80 bg-[#1e1e1e] border border-zinc-800 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/50 cursor-move"
                    >
                        <div className="flex items-center gap-2 text-tech-orange">
                            <Sparkles size={18} />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Panel Creator</h3>
                        </div>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* Aspect Ratio */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Aspect Ratio</label>
                            <div className="flex gap-2">
                                {["1:1", "16:9", "9:16", "4:3"].map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`flex-1 py-1.5 text-xs font-bold transition-colors border
                                            ${aspectRatio === ratio
                                                ? 'bg-tech-orange text-black border-tech-orange'
                                                : 'bg-black/30 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                                            }
                                        `}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prompt */}
                        <div className="relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Prompt</label>
                                <button
                                    onClick={handleEnhance}
                                    disabled={isEnhancing || !prompt}
                                    className="text-[10px] font-bold uppercase flex items-center gap-1 text-tech-orange hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                                    {isEnhancing ? 'Enhancing...' : 'Enhance'}
                                </button>
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the scene..."
                                className="w-full h-20 bg-black/30 border border-zinc-800 p-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-tech-orange outline-none resize-none"
                            />
                        </div>

                        {/* Reference Image */}
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Reference Image (Optional)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative h-24 border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group
                                    ${isDragging
                                        ? 'border-tech-orange bg-tech-orange/10 scale-[1.02]'
                                        : 'border-zinc-700 bg-black/20 hover:border-tech-orange hover:bg-tech-orange/5'
                                    }
                                `}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                {referenceImage ? (
                                    <>
                                        <img src={referenceImage} alt="Ref" className="h-full w-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs text-white font-medium bg-black/50 px-2 py-1">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload className={`mb-1 transition-colors ${isDragging ? 'text-tech-orange' : 'text-zinc-500 group-hover:text-tech-orange'}`} size={20} />
                                        <span className={`text-xs transition-colors ${isDragging ? 'text-tech-orange' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                            {isDragging ? 'Drop Image Here' : 'Upload or Drag Image'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (!prompt && !referenceImage)}
                            className={`w-full py-2.5 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                ${isGenerating
                                    ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                                    : 'bg-tech-orange text-black hover:bg-tech-orange-dark shadow-[0_0_15px_rgba(255,70,19,0.2)] hover:shadow-[0_0_20px_rgba(255,70,19,0.4)]'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" size={16} /> Generating...</>
                            ) : (
                                <><ImageIcon size={16} /> Generate Panel</>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PanelCreator;
