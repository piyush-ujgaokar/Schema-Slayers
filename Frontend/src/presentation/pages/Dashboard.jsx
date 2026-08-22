import React, { useState } from 'react';
import { EditorProvider, useEditor } from '../../application/context/EditorContext';
import { useAuth } from '../../application/context/AuthContext';
import Canvas from '../canvas/Canvas';
import Sidebar from '../components/Sidebar';
import SandboxPreview from '../components/SandboxPreview';
import CodeViewer from '../components/CodeViewer';
import AIPromptBar from '../components/AIPromptBar';
import { LogOut, Layout, Play, Code, Box, User } from 'lucide-react';

function DashboardContent() {
  const { logout, user } = useAuth();
  const { isCompiling } = useEditor();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('canvas'); // 'canvas', 'simulator', 'code'

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-30 shadow-md">
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Box size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">VisualStack</h1>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">MERN Builder</span>
          </div>
        </div>

        {/* AI Input prompt Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <AIPromptBar />
        </div>

        {/* User profile & controls */}
        <div className="flex items-center gap-4">
          {isCompiling && (
            <div className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-900/40 px-2.5 py-1 rounded-full text-[10px] text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              Compiling...
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <User size={13} className="text-slate-400" />
            <span className="font-semibold text-slate-300">{user?.name}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/30 text-slate-400 hover:text-rose-400 rounded-lg transition duration-200"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Workspace Area Header with Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-900 px-6 py-2 flex items-center justify-between z-20">
        <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-lg">
          <button
            onClick={() => setActiveWorkspaceTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeWorkspaceTab === 'canvas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout size={14} />
            Visual Canvas
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeWorkspaceTab === 'simulator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play size={14} />
            App Simulator
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeWorkspaceTab === 'code' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code size={14} />
            Generated Code
          </button>
        </div>
        <div className="text-[11px] text-slate-500 font-mono italic">
          Active Sandbox: MongoDB Atlas Atlas Cluster (Dev)
        </div>
      </div>

      {/* Main split dashboard viewports */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeWorkspaceTab === 'canvas' && (
          <>
            {/* Center Canvas */}
            <main className="flex-1 h-full overflow-hidden">
              <Canvas />
            </main>
            {/* Right Sidebar panel */}
            <Sidebar />
          </>
        )}

        {activeWorkspaceTab === 'simulator' && (
          <main className="flex-1 h-full overflow-hidden">
            <SandboxPreview />
          </main>
        )}

        {activeWorkspaceTab === 'code' && (
          <main className="flex-1 h-full overflow-hidden">
            <CodeViewer />
          </main>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <EditorProvider>
      <DashboardContent />
    </EditorProvider>
  );
}
