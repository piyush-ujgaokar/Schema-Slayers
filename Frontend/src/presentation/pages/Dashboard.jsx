import React, { useState, useEffect } from "react";
import {
  EditorProvider,
  useEditor,
} from "../../application/context/EditorContext";
import { useAuth } from "../../application/context/AuthContext";
import Canvas from "../canvas/Canvas";
import Sidebar from "../components/Sidebar";
import SandboxPreview from "../components/SandboxPreview";
import CodeViewer from "../components/CodeViewer";
import AIPromptBar from "../components/AIPromptBar";
import {
  LogOut,
  Layout,
  Play,
  Code,
  Box,
  User,
  Save,
  History,
  Trash2,
  X,
  FolderPlus,
} from "lucide-react";

function DashboardContent() {
  const { logout, user } = useAuth();
  const {
    isCompiling,
    projectsList,
    currentProject,
    saveProject,
    loadProject,
    deleteSavedProject,
    fetchProjects,
    createNewProject,
  } = useEditor();

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState(() => {
    return localStorage.getItem("visual_builder_active_tab") || "canvas";
  });

  useEffect(() => {
    localStorage.setItem("visual_builder_active_tab", activeWorkspaceTab);
  }, [activeWorkspaceTab]);

  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync save modal input with loaded project name
  useEffect(() => {
    if (currentProject) {
      setNewProjectName(currentProject.name);
    } else {
      setNewProjectName("");
    }
  }, [currentProject, showSaveModal]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setSaveLoading(true);
    const res = await saveProject(newProjectName.trim());
    setSaveLoading(false);

    if (res.success) {
      alert("Visual stack architecture saved to history database!");
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
    if (
      confirm(
        "Are you sure you want to delete this visual configuration from history?",
      )
    ) {
      const res = await deleteSavedProject(id);
      if (!res.success) {
        alert(`Failed to delete: ${res.message}`);
      }
    }
  };

  return (
    <div className="h-screen bg-brand-bg flex flex-col overflow-hidden text-brand-text relative font-sans">
      {/* Top Navbar */}
      <header className="bg-brand-card border-b border-brand-border px-6 py-3.5 flex items-center justify-between z-30 shadow-sm">
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-md shadow-brand-primary/10">
            <Box size={22} className="text-brand-bg" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-brand-text">
              {"SchemaSlayer"}
            </h1>
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">
              {"Tech Architecture"}
            </span>
          </div>
        </div>

        {/* AI Input prompt Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <AIPromptBar />
        </div>

        {/* Workspace controls & user profile */}
        <div className="flex items-center gap-3">
          {/* Create a new Schema Design button */}
          <button
            onClick={() => {
              if (confirm('Start a new visual canvas design? Unsaved changes will be lost.')) {
                createNewProject();
              }
            }}
            className="px-4 py-2 bg-brand-bg hover:bg-brand-border/60 text-brand-text rounded-xl text-sm font-bold flex items-center gap-1.5 border border-brand-border/80 shadow-sm transition cursor-pointer"
            title="Create a new Schema Design"
          >
            <FolderPlus size={16} />
            New Architecture
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-brand-bg hover:bg-brand-border/60 text-brand-text rounded-xl text-sm font-bold flex items-center gap-1.5 border border-brand-border/80 shadow-sm transition cursor-pointer"
            title="Save Project History"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={() => {
              fetchProjects();
              setShowHistoryModal(true);
            }}
            className="px-4 py-2 bg-brand-bg hover:bg-brand-border/60 text-brand-text rounded-xl text-sm font-bold flex items-center gap-1.5 border border-brand-border/80 shadow-sm transition cursor-pointer"
            title="Projects History List"
          >
            <History size={16} />
            History ({projectsList.length})
          </button>

          <div className="w-[1px] h-6 bg-brand-border mx-1"></div>

          {isCompiling && (
            <div className="flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/10 px-3 py-1.5 rounded-full text-xs text-brand-primary font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-ping"></span>
              Compiling...
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-brand-bg border border-brand-border/80 px-4 py-2 rounded-xl text-sm font-bold">
            <User size={15} className="text-brand-muted" />
            <span className="text-brand-text">{user?.name}</span>
          </div>

          <button
            onClick={logout}
            className="p-2.5 bg-brand-bg hover:bg-rose-50 border border-brand-border hover:border-rose-100 text-brand-muted hover:text-rose-600 rounded-xl transition cursor-pointer"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Workspace Area Header with Tabs */}
      <div className="bg-brand-card border-b border-brand-border px-6 py-2.5 flex items-center justify-between z-20">
        <div className="flex bg-brand-bg border border-brand-border p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveWorkspaceTab("canvas")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
              activeWorkspaceTab === "canvas"
                ? "bg-brand-primary text-brand-bg shadow-sm"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Layout size={16} />
            Visual Canvas
          </button>
          <button
            onClick={() => setActiveWorkspaceTab("simulator")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
              activeWorkspaceTab === "simulator"
                ? "bg-brand-primary text-brand-bg shadow-sm"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Play size={16} />
            App Simulator
          </button>
          <button
            onClick={() => setActiveWorkspaceTab("code")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
              activeWorkspaceTab === "code"
                ? "bg-brand-primary text-brand-bg shadow-sm"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Code size={16} />
            Generated Code
          </button>
        </div>
        <div className="text-xs text-brand-muted font-bold uppercase tracking-wider">
          Sandbox connected: MongoDB Dev Cluster
        </div>
      </div>

      {/* Main split dashboard viewports */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeWorkspaceTab === "canvas" && (
          <>
            {/* Center Canvas */}
            <main className="flex-1 h-full overflow-hidden">
              <Canvas />
            </main>
            {/* Right Sidebar panel */}
            <Sidebar />
          </>
        )}

        {activeWorkspaceTab === "simulator" && (
          <main className="flex-1 h-full overflow-hidden">
            <SandboxPreview />
          </main>
        )}

        {activeWorkspaceTab === "code" && (
          <main className="flex-1 h-full overflow-hidden">
            <CodeViewer />
          </main>
        )}
      </div>

      {/* SAVE DIALOG MODAL */}
      {showSaveModal && (
        <div className="absolute inset-0 bg-brand-primary/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5">
                <Save size={18} className="text-brand-primary" />
                {currentProject
                  ? "Update Project History"
                  : "Save New Workspace"}
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-brand-muted hover:text-brand-text transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Management"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saveLoading || !newProjectName.trim()}
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-brand-bg rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              >
                {saveLoading ? "Saving..." : "Save Configuration"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HISTORY LIST MODAL */}
      {showHistoryModal && (
        <div className="absolute inset-0 bg-brand-primary/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border mb-4 shrink-0">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-1.5">
                <History size={18} className="text-brand-primary" />
                Past Workspace Configurations
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-brand-muted hover:text-brand-text transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {projectsList.length === 0 ? (
                <div className="py-12 text-center text-brand-muted text-sm italic">
                  No saved history found. Set up and save your first workspace!
                </div>
              ) : (
                projectsList.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLoad(project)}
                    className="p-4 bg-brand-bg/40 hover:bg-brand-bg/80 border border-brand-border hover:border-brand-accent/50 rounded-2xl flex items-center justify-between cursor-pointer transition duration-200 group shadow-sm"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition truncate">
                        {project.name}
                      </span>
                      <span className="text-xs text-brand-muted font-mono">
                        Saved: {new Date(project.updatedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoad(project);
                        }}
                        className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 hover:bg-rose-50 text-brand-muted hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Delete from History"
                      >
                        <Trash2 size={15} />
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
