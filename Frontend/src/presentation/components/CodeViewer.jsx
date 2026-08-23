import React, { useState, useEffect } from 'react';
import { useEditor } from '../../application/context/EditorContext';
import { FileCode, Clipboard, Check, Download, Folder, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function CodeViewer() {
  const { compiledFiles, isCompiling, updateCompiledFile, fetchAICodeTemplates, applySuggestionFuzzy } = useEditor();
  const [selectedFile, setSelectedFile] = useState(() => {
    return localStorage.getItem('visual_builder_selected_file') || '';
  });
  const [copied, setCopied] = useState(false);

  // Chat/Suggestions Copilot states
  const [chatMessages, setChatMessages] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [promptInput, setPromptInput] = useState('');
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

  // Reset chat history and load welcome card + 3 auto-suggestions on file switch
  useEffect(() => {
    if (!selectedFile || !compiledFiles[selectedFile]) {
      setChatMessages([]);
      return;
    }

    const loadInitialSuggestions = async () => {
      setSuggestionsLoading(true);
      
      const basename = selectedFile.split('/').pop();
      setChatMessages([
        {
          sender: 'assistant',
          text: `Hi! I've scanned \`${basename}\`. Here are 3 automatic enhancement ideas. You can also type below to ask for custom changes!`
        }
      ]);

      const result = await fetchAICodeTemplates(selectedFile, compiledFiles[selectedFile]);
      setSuggestionsLoading(false);

      if (result.success && result.templates) {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: 'I generated these initial suggestions. Click Apply to merge them:',
            suggestions: result.templates
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: `Failed to load auto-suggestions: ${result.message || 'Unknown error'}`
          }
        ]);
      }
    };

    const timer = setTimeout(loadInitialSuggestions, 300);
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

  const handleSendPrompt = async (e) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || !selectedFile) return;

    const userPrompt = promptInput.trim();
    setPromptInput('');

    // Append user message
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userPrompt
      }
    ]);

    setSuggestionsLoading(true);

    const result = await fetchAICodeTemplates(selectedFile, compiledFiles[selectedFile], userPrompt);
    setSuggestionsLoading(false);

    if (result.success && result.templates && result.templates.length > 0) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `I've created ${result.templates.length} target code changes for your request. You can merge them below:`,
          suggestions: result.templates
        }
      ]);
    } else {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: result.success 
            ? "I analyzed the code but couldn't find matching target slots for that change. Try rephrasing your request!"
            : `Error generating custom templates: ${result.message || 'Please try again.'}`
        }
      ]);
    }
  };

  const handleApplySuggestion = (suggestion, uniqueCardId) => {
    const currentCode = compiledFiles[selectedFile];
    
    // Apply suggestions using fuzzy whitespace/variable normalization search-and-replace
    const newCode = applySuggestionFuzzy(currentCode, suggestion.targetSnippet, suggestion.replacementSnippet);
    
    if (!newCode) {
      alert(
        `Could not apply this template automatically!\n\nReason: The code in the editor has been modified, and the AI target block does not match precisely.\n\nTemplate proposed snippet:\n${suggestion.targetSnippet}`
      );
      return;
    }

    updateCompiledFile(selectedFile, newCode);
    
    // Set visual confirmation flash
    setApplySuccessId(uniqueCardId);
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
          <span className="text-xs font-bold text-brand-text uppercase tracking-wider">File Copilot Chat</span>
        </div>

        {/* Scrollable Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              {/* Bubble wrapper */}
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-brand-primary text-brand-bg rounded-tr-none'
                    : 'bg-brand-bg/50 border border-brand-border text-brand-text rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {/* Suggestions Cards attachment */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3.5 space-y-3.5 w-full min-w-[240px]">
                  {msg.suggestions.map((item, idx) => {
                    const uniqueCardId = `${index}_${idx}`;
                    return (
                      <div
                        key={idx}
                        className={`p-3 bg-brand-card border-2 rounded-xl transition flex flex-col gap-2 shadow-sm ${
                          applySuccessId === uniqueCardId
                            ? 'border-emerald-500 bg-emerald-50/10'
                            : 'border-brand-border hover:border-brand-accent/40'
                        }`}
                      >
                        <div>
                          <h5 className="text-[11px] font-bold text-brand-text leading-snug flex items-center gap-1.5">
                            {applySuccessId === uniqueCardId ? (
                              <Check size={12} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Sparkles size={11} className="text-brand-primary shrink-0" />
                            )}
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-brand-muted mt-1 leading-normal">
                            {item.description}
                          </p>
                        </div>

                        <button
                          onClick={() => handleApplySuggestion(item, uniqueCardId)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                            applySuccessId === uniqueCardId
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-brand-primary hover:bg-brand-primary-hover text-brand-bg cursor-pointer'
                          }`}
                        >
                          {applySuccessId === uniqueCardId ? (
                            'Applied!'
                          ) : (
                            <>
                              Apply Changes
                              <ArrowRight size={10} />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Loading state indicator */}
          {suggestionsLoading && (
            <div className="self-start flex items-center gap-2 bg-brand-bg/50 border border-brand-border p-3.5 rounded-2xl rounded-tl-none max-w-[85%] text-xs text-brand-muted font-bold">
              <Loader2 size={14} className="animate-spin text-brand-primary animate-pulse" />
              <span>Thinking...</span>
            </div>
          )}
        </div>

        {/* Chat Input Box (At the bottom) */}
        <form
          onSubmit={handleSendPrompt}
          className="p-3 border-t border-brand-border bg-brand-card flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Ask for code additions..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            disabled={suggestionsLoading}
            className="flex-1 px-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary transition"
          />
          <button
            type="submit"
            disabled={suggestionsLoading || !promptInput.trim()}
            className="p-2 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-border/40 text-brand-bg disabled:text-brand-muted rounded-xl transition cursor-pointer"
          >
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
