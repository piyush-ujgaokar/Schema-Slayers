import React, { useState, useEffect } from 'react';
import { useEditor } from '../../application/context/EditorContext';
import { FileCode, Clipboard, Check, Download, Folder } from 'lucide-react';

export default function CodeViewer() {
  const { compiledFiles, isCompiling } = useEditor();
  const [selectedFile, setSelectedFile] = useState('');
  const [copied, setCopied] = useState(false);

  const filepaths = Object.keys(compiledFiles);

  useEffect(() => {
    // Auto-select first file if available and none selected
    if (filepaths.length > 0 && !selectedFile) {
      setSelectedFile(filepaths[0]);
    }
  }, [compiledFiles, filepaths, selectedFile]);

  const handleCopy = () => {
    if (!selectedFile || !compiledFiles[selectedFile]) return;
    navigator.clipboard.writeText(compiledFiles[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    // Standard mock for download action in hackathon
    // In a real product we can create a zip blob, but for hackathon demo we will generate a downloadable JSON or tell the user we wrote/zipped the workspace.
    // Let's create a downloadable JSON file of the compiled workspace as a manifest.
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

  if (isCompiling && filepaths.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          <p className="text-xs">Compiling Visual Architecture...</p>
        </div>
      </div>
    );
  }

  if (filepaths.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 text-slate-500 text-xs italic">
        Design database models, backend controllers, and pages on the canvas to inspect code.
      </div>
    );
  }

  return (
    <div className="flex h-full text-white bg-slate-950">
      {/* File Explorer */}
      <div className="w-72 bg-slate-950 border-r border-slate-900 flex flex-col h-full">
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Explorer</span>
          <button
            onClick={handleDownloadZip}
            className="p-1.5 bg-indigo-650 hover:bg-indigo-650/80 border border-indigo-500/20 text-indigo-300 rounded text-xs flex items-center gap-1 transition"
          >
            <Download size={13} />
            <span className="text-[10px] font-semibold">Export JSON</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {/* Group files by backend and frontend */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold text-indigo-400">
                <Folder size={12} /> Backend System
              </div>
              <div className="space-y-0.5 mt-1">
                {filepaths
                  .filter((p) => p.startsWith('backend'))
                  .map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition ${
                        selectedFile === path ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <FileCode size={13} />
                      <span className="truncate">{path.replace('backend/src/', '')}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold text-emerald-400">
                <Folder size={12} /> Frontend Views
              </div>
              <div className="space-y-0.5 mt-1">
                {filepaths
                  .filter((p) => p.startsWith('frontend'))
                  .map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition ${
                        selectedFile === path ? 'bg-emerald-600/10 text-emerald-400 border-l-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <FileCode size={13} />
                      <span className="truncate">{path.replace('frontend/src/', '')}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="flex-1 flex flex-col h-full bg-slate-900/40">
        {selectedFile ? (
          <>
            {/* Tab header bar */}
            <div className="px-5 py-3 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-indigo-400" />
                <span className="text-xs font-mono text-slate-300 font-semibold">{selectedFile}</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard size={12} />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Pre container */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs leading-relaxed text-indigo-200/90 bg-slate-950/80">
              <pre className="select-text whitespace-pre">{compiledFiles[selectedFile]}</pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
            Select a generated file to view output source code.
          </div>
        )}
      </div>
    </div>
  );
}
