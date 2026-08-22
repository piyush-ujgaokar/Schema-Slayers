import React, { useState, useEffect } from 'react';
import { EditorProvider, useEditor } from '../../application/context/EditorContext';
import { useAuth } from '../../application/context/AuthContext';
import Canvas from '../canvas/Canvas';
import Sidebar from '../components/Sidebar';
import SandboxPreview from '../components/SandboxPreview';
import CodeViewer from '../components/CodeViewer';
import AIPromptBar from '../components/AIPromptBar';
import { LogOut, Layout, Play, Code, Box, User, Save, History, Trash2, FolderOpen, X } from 'lucide-react';

function DashboardContent() {
  const { logout, user } = useAuth();
  const { 
    isCompiling, 
    projectsList, 
    currentProject, 
    saveProject, 
    loadProject, 
    deleteSavedProject,
    fetchProjects
  } = useEditor();
  
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('canvas'); // 'canvas', 'simulator', 'code'
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync save modal input with loaded project name
  useEffect(() => {
    if (currentProject) {
      setNewProjectName(currentProject.name);
    } else {
      setNewProjectName('');
    }
  }, [currentProject, showSaveModal]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setSaveLoading(true);
    const res = await saveProject(newProjectName.trim());
    setSaveLoading(false);

    if (res.success) {
      alert('Visual stack architecture saved to history database!');
      setShowSaveModal(false);
    } else {
      alert(`Save failed: ${res.message}`);
    }
  };

  const handleLoad = (p) => {
    loadProject(p);
    setShowHistoryModal(false);
    alert(`Loaded visual stack workspace: "${p.name}"`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent loading on click row
    if (confirm('Are you sure you want to delete this visual configuration from history?')) {
      const res = await deleteSavedProject(id);
      if (!res.success) {
        alert(`Failed to delete: ${res.message}`);
      }
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 relative">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-30 shadow-md">
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Box size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              {currentProject ? currentProject.name : 'VisualStack'}
            </h1>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              {currentProject ? 'Project Loaded' : 'MERN Builder'}
            </span>
          </div>
        </div>

        {/* AI Input prompt Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <AIPromptBar />
        </div>

        {/* Workspace controls & user profile */}
        <div className="flex items-center gap-3">
          {/* Persistent buttons */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-750 transition"
            title="Save Project History"
          >
            <Save size={14} />
            Save
          </button>
          
          <button
            onClick={() => {
              fetchProjects();
              setShowHistoryModal(true);
            }}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-750 transition"
            title="Projects History List"
          >
            <History size={14} />
            History ({projectsList.length})
          </button>

          <div className="w-[1px] h-6 bg-slate-800 mx-1"></div>

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
          Active Sandbox: MongoDB Atlas Cluster (Dev)
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

      {/* SAVE DIALOG MODAL */}
      {showSaveModal && (
        <div className="absolute inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Save size={16} className="text-indigo-400" />
                {currentProject ? 'Update Project History' : 'Save New Workspace'}
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Management"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saveLoading || !newProjectName.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              >
                {saveLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HISTORY LIST MODAL */}
      {showHistoryModal && (
        <div className="absolute inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 shrink-0">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <History size={16} className="text-indigo-400" />
                Past Workspace Configurations
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {projectsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">
                  No saved history found. Set up and save your first workspace!
                </div>
              ) : (
                projectsList.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLoad(project)}
                    className="p-4 bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-indigo-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition duration-200 group"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition truncate">
                        {project.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Saved: {new Date(project.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoad(project);
                        }}
                        className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold transition"
                      >
                        Load
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-1.5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition"
                        title="Delete from History"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
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
