
import React from 'react';

interface LumiereModalProps {
  content: string;
  isLoading: boolean;
  onClose: () => void;
  error?: string | null;
}

// Lightweight Markdown Renderer to avoid heavy dependencies
// Supports: **Bold**, - List items, and Paragraphs
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // 1. Split by newlines to handle paragraphs and lists
  const lines = text.split('\n');

  return (
    <div className="space-y-4 text-left">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />; // Spacer for empty lines

        // Handle List Items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             const content = trimmed.substring(2);
             return (
                 <div key={index} className="flex gap-2 pl-4">
                     <span className="text-zinc-400">•</span>
                     <span>{parseBold(content)}</span>
                 </div>
             );
        }

        // Handle Normal Paragraphs
        return (
            <p key={index} className="leading-relaxed">
                {parseBold(trimmed)}
            </p>
        );
      })}
    </div>
  );
};

// Helper to parse **bold** text
const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const LumiereModal: React.FC<LumiereModalProps> = ({ content, isLoading, onClose, error }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500">
      <div 
        className="w-full max-w-2xl min-h-[50vh] max-h-[80vh] overflow-y-auto no-scrollbar relative flex flex-col items-center text-center p-8 md:p-12 rounded-[3rem] shadow-2xl transition-all"
        style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,250,0.9) 100%)',
            boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[var(--accent)] opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-blue-400 opacity-5 rounded-full blur-[80px] pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-zinc-300 hover:text-zinc-600 transition-colors z-20"
        >
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <h3 className="serif italic text-3xl text-zinc-800 mb-2 mt-4 flex items-center gap-3">
           <span className="text-xl opacity-40">✨</span> 
           流光·洞见 
           <span className="text-xl opacity-40">✨</span>
        </h3>
        <div className="w-12 h-[1px] bg-zinc-800/20 mb-10"></div>

        <div className="w-full text-lg text-zinc-700 font-light serif min-h-[200px]">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-6 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-2 border-zinc-200 border-t-zinc-800 animate-spin"></div>
                    <span className="text-sm tracking-[0.2em] uppercase text-zinc-400">正在溯游时间长河...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                    <span className="text-3xl">🍂</span>
                    <p className="text-center text-zinc-500 text-sm max-w-xs">{error}</p>
                    <button onClick={onClose} className="mt-4 px-6 py-2 bg-zinc-100 rounded-full text-xs hover:bg-zinc-200 transition-colors">关闭</button>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <SimpleMarkdown text={content} />
                </div>
            )}
        </div>

        {!isLoading && !error && content && (
            <div className="mt-12 animate-in slide-in-from-bottom-4 fade-in duration-1000">
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-300 font-bold select-none">
                    Lumière Insight
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default LumiereModal;
