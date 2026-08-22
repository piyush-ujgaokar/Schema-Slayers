import React, { useState } from 'react';
import { useEditor } from '../../application/context/EditorContext';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function AIPromptBar() {
  const [prompt, setPrompt] = useState('');
  const { sendAIPrompt, aiLoading } = useEditor();
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || aiLoading) return;

    setStatusMsg('Architecting Full Stack layers...');
    const result = await sendAIPrompt(prompt);
    
    if (result.success) {
      setStatusMsg('AI updates successfully applied to canvas!');
      setPrompt('');
      setTimeout(() => setStatusMsg(''), 4000);
    } else {
      setStatusMsg(`Error: ${result.message || 'AI request failed'}`);
      setTimeout(() => setStatusMsg(''), 6000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-brand-accent/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative w-full flex bg-brand-card border border-brand-border focus-within:border-brand-accent rounded-xl overflow-hidden shadow-md">
          <div className="flex items-center pl-4 text-brand-primary">
            <Sparkles size={18} className={aiLoading ? 'animate-pulse' : ''} />
          </div>
          
          <input
            type="text"
            disabled={aiLoading}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI: 'Add product CRUD flow' or 'Create JWT auth system'..."
            className="w-full py-3 pl-3 pr-24 bg-transparent text-sm text-brand-text placeholder-brand-muted focus:outline-none disabled:opacity-50"
          />

          <div className="absolute right-2 top-1.5">
            <button
              type="submit"
              disabled={aiLoading || !prompt.trim()}
              className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-border disabled:text-brand-muted text-brand-bg text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  Build
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {statusMsg && (
        <p className={`text-center text-[10px] mt-1.5 font-bold transition-all ${
          statusMsg.includes('Error') ? 'text-rose-600' : 'text-brand-primary'
        }`}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
