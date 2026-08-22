import React, { useState, useEffect } from 'react';
import { useEditor } from '../../application/context/EditorContext';
import { FileCode, Clipboard, Check, Download, Folder, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function CodeViewer() {
  const { compiledFiles, isCompiling, updateCompiledFile, fetchAICodeTemplates } = useEditor();
  const [selectedFile, setSelectedFile] = useState(() => {
    return localStorage.getItem('visual_builder_selected_file') || '';
  });
  const [copied, setCopied] = useState(false);

  // AI suggestions states
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [applySuccessId, setApplySuccessId] = useState(null);

  const filepaths = Object.keys(compiledFiles);

  useEffect(() => {
    if (selectedFile) {
      localStorage.setItem('visual_builder_selected_file', selectedFile);
    }
  }, [selectedFile]);

  useEffect(() => {
    // Respect local storage choice if it exists in current files list, otherwise auto-select first file
    if (filepaths.length > 0) {
      const saved = localStorage.getItem('visual_builder_selected_file');
      if (saved && filepaths.includes(saved)) {
        if (selectedFile !== saved) {
          setSelectedFile(saved);
        }
      } else if (!selectedFile) {
        setSelectedFile(filepaths[0]);
      }
    }
  }, [compiledFiles, filepaths, selectedFile]);

  // Query AI Templates when active file changes
  useEffect(() => {
    if (!selectedFile || !compiledFiles[selectedFile]) {
      setAiSuggestions([]);
      return;
    }

    const loadSuggestions = async () => {
      setSuggestionsLoading(true);
      setSuggestionsError('');
      setAiSuggestions([]);

      const result = await fetchAICodeTemplates(selectedFile, compiledFiles[selectedFile]);
      setSuggestionsLoading(false);

      if (result.success) {
        setAiSuggestions(result.templates || []);
      } else {
        setSuggestionsError(result.message || 'Failed to fetch AI suggestions.');
      }
    };

    // Stagger / debounce slightly
    const timer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timer);
  }, [selectedFile]);

  const handleCopy = () => {
    if (!selectedFile || !compiledFiles[selectedFile]) return;
    navigator.clipboard.writeText(compiledFiles[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    const manifestStr = JSON.stringify(compiledFiles, null, 2);
    const blob = new Blob([manifestStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'visual_stack_project.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplySuggestion = (suggestion, index) => {
    const currentCode = compiledFiles[selectedFile];
    
    // Exact match search
    const hasTarget = currentCode.includes(suggestion.targetSnippet);
    
    if (!hasTarget) {
      // Soft trim check fallback to handle minor spacing differences
      const normalizedTarget = suggestion.targetSnippet.replace(/\s+/g, '');
      const normalizedCode = currentCode.replace(/\s+/g, '');
      
      if (normalizedCode.includes(normalizedTarget)) {
        alert('Code snippet matches with slight formatting spacing differences. Applying replacement.');
      } else {
        alert(
          `Could not apply this template automatically!\n\nReason: The code in the editor has been modified, and the AI target block does not match precisely.\n\nTemplate proposed snippet:\n${suggestion.targetSnippet}`
        );
        return;
      }
    }

    // Replace target with replacement
    const newCode = currentCode.replace(suggestion.targetSnippet, suggestion.replacementSnippet);
    updateCompiledFile(selectedFile, newCode);
    
    // Set visual confirmation flash
    setApplySuccessId(index);
    setTimeout(() => setApplySuccessId(null), 3000);
  };

  if (isCompiling && filepaths.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-brand-bg text-brand-muted">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary"></div>
          <p className="text-sm font-semibold">Compiling Visual Architecture...</p>
        </div>
      </div>
    );
  }

  if (filepaths.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-brand-bg text-brand-muted text-sm italic">
        Design database models, backend controllers, and pages on the canvas to inspect code.
      </div>
    );
  }

  return (
    <div className="flex h-full text-brand-text bg-brand-bg font-sans overflow-hidden">
      {/* File Explorer (Left Column) */}
      <div className="w-64 bg-brand-card border-r border-brand-border flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-brand-border flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Project Explorer</span>
          <button
            onClick={handleDownloadZip}
            className="px-2.5 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Download size={13} />
            Export JSON
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs uppercase font-bold text-indigo-600">
                <Folder size={14} className="shrink-0" /> Backend System
              </div>
              <div className="space-y-1 mt-1.5">
                {filepaths
                  .filter((p) => p.startsWith('backend'))
                  .map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-mono flex items-center gap-2.5 transition cursor-pointer ${
                        selectedFile === path ? 'bg-brand-bg text-brand-text font-bold border-l-2 border-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg/30'
                      }`}
                    >
                      <FileCode size={14} className="text-indigo-600 shrink-0" />
                      <span className="truncate">{path.replace('backend/src/', '')}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs uppercase font-bold text-emerald-600">
                <Folder size={14} className="shrink-0" /> Frontend Views
              </div>
              <div className="space-y-1 mt-1.5">
                {filepaths
                  .filter((p) => p.startsWith('frontend'))
                  .map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-mono flex items-center gap-2.5 transition cursor-pointer ${
                        selectedFile === path ? 'bg-brand-bg text-brand-text font-bold border-l-2 border-brand-primary shadow-sm' : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg/30'
                      }`}
                    >
                      <FileCode size={14} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{path.replace('frontend/src/', '')}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor Panel (Center Column) */}
      <div className="flex-1 flex flex-col h-full bg-brand-bg p-4 overflow-hidden">
        {selectedFile ? (
          <div className="flex-1 flex flex-col bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm">
            {/* Header bar */}
            <div className="px-5 py-3 border-b border-brand-border bg-brand-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCode size={18} className="text-brand-primary shrink-0" />
                <span className="text-sm font-mono text-brand-text font-bold">{selectedFile}</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-brand-bg hover:bg-brand-border/60 border border-brand-border text-brand-text rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard size={14} />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Editable Text Area Editor */}
            <textarea
              value={compiledFiles[selectedFile] || ''}
              onChange={(e) => updateCompiledFile(selectedFile, e.target.value)}
              spellCheck="false"
              className="flex-1 p-5 overflow-auto font-mono text-sm leading-relaxed text-brand-text bg-[#FDFDFB] shadow-inner select-text border-none focus:outline-none focus:ring-0 resize-none"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-brand-muted text-sm italic">
            Select a generated file to view output source code.
          </div>
        )}
      </div>

      {/* AI Suggestions Side Panel (Right Column) */}
      <div className="w-80 bg-brand-card border-l border-brand-border flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-brand-border flex items-center gap-2 shrink-0">
          <Sparkles size={16} className="text-brand-primary fill-brand-primary animate-pulse" />
          <span className="text-xs font-bold text-brand-text uppercase tracking-wider">AI Code Templates</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {suggestionsLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-brand-muted text-xs">
              <Loader2 size={24} className="animate-spin text-brand-primary" />
              <span>Analyzing code in Gemini...</span>
            </div>
          )}

          {suggestionsError && (
            <div className="py-8 text-center text-rose-600 text-xs px-2 leading-relaxed">
              ⚠️ {suggestionsError}
            </div>
          )}

          {!suggestionsLoading && !suggestionsError && aiSuggestions.length === 0 && (
            <div className="py-12 text-center text-brand-muted text-xs italic px-3 leading-relaxed">
              No template enhancements found for this file.
            </div>
          )}

          {!suggestionsLoading && !suggestionsError && aiSuggestions.length > 0 && (
            <div className="space-y-4">
              <span className="block text-[10px] uppercase font-bold text-brand-muted tracking-wider">
                Upgrade Recommendations
              </span>
              
              {aiSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 bg-brand-bg/40 border-2 rounded-2xl transition duration-250 flex flex-col gap-2.5 shadow-sm ${
                    applySuccessId === idx
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-brand-border hover:border-brand-accent/50'
                  }`}
                >
                  <div>
                    <h5 className="text-sm font-bold text-brand-text leading-snug flex items-center gap-1.5">
                      {applySuccessId === idx ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Sparkles size={13} className="text-brand-primary shrink-0" />
                      )}
                      {item.title}
                    </h5>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplySuggestion(item, idx)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                      applySuccessId === idx
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-brand-primary hover:bg-brand-primary-hover text-brand-bg cursor-pointer'
                    }`}
                  >
                    {applySuccessId === idx ? (
                      'Template Injected!'
                    ) : (
                      <>
                        Apply Suggestion
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
