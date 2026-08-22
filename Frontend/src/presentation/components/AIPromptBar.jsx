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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative w-full flex bg-slate-900 border border-slate-800 focus-within:border-indigo-500 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center pl-4 text-indigo-400">
            <Sparkles size={18} className={aiLoading ? 'animate-pulse' : ''} />
          </div>
          
          <input
            type="text"
            disabled={aiLoading}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI to architect: 'Add product CRUD flow' or 'Create JWT auth system'..."
            className="w-full py-3.5 pl-3 pr-24 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          <div className="absolute right-2 top-2">
            <button
              type="submit"
              disabled={aiLoading || !prompt.trim()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition active:scale-[0.98]"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Generating...
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
        <p className={`text-center text-[11px] mt-2 font-medium transition-all ${
          statusMsg.includes('Error') ? 'text-rose-400' : 'text-indigo-300'
        }`}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
