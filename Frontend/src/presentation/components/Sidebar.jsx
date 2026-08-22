import React, { useState } from 'react';
import { useEditor } from '../../application/context/EditorContext';
import { Plus, Trash2, X, Database, Server, Monitor } from 'lucide-react';

export default function Sidebar() {
  const {
    ir,
    selectedNode,
    setSelectedNode,
    addDatabaseModel,
    updateDatabaseModel,
    deleteDatabaseModel,
    addBackendRoute,
    updateBackendRoute,
    deleteBackendRoute,
    addFrontendPage,
    updateFrontendPage,
    deleteFrontendPage
  } = useEditor();

  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'inspect'
  
  // Creation States
  const [modelName, setModelName] = useState('');
  const [routeMethod, setRouteMethod] = useState('GET');
  const [routePath, setRoutePath] = useState('/api/');
  const [pageTitle, setPageTitle] = useState('');
  const [pagePath, setPagePath] = useState('/');

  // Attribute editing States
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('String');
  const [newFieldReq, setNewFieldReq] = useState(false);

  // Sync tab on node selection
  React.useEffect(() => {
    if (selectedNode) {
      setActiveTab('inspect');
    }
  }, [selectedNode]);

  const handleAddDBModel = (e) => {
    e.preventDefault();
    if (!modelName.trim()) return;
    addDatabaseModel(modelName.trim());
    setModelName('');
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!routePath.trim()) return;
    addBackendRoute(routeMethod, routePath.trim());
    setRoutePath('/api/');
  };

  const handleAddPage = (e) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pagePath.trim()) return;
    addFrontendPage(pageTitle.trim(), pagePath.trim());
    setPageTitle('');
    setPagePath('/');
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim() || !selectedNode || selectedNode.type !== 'database') return;
    
    const updatedFields = [...selectedNode.data.fields, {
      name: newFieldName.trim(),
      type: newFieldType,
      required: newFieldReq,
      unique: false
    }];

    updateDatabaseModel(selectedNode.data.id, { fields: updatedFields });
    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, fields: updatedFields }
    });
    setNewFieldName('');
    setNewFieldReq(false);
  };

  const handleDeleteField = (fieldName) => {
    if (!selectedNode || selectedNode.type !== 'database') return;
    const updatedFields = selectedNode.data.fields.filter(f => f.name !== fieldName);
    updateDatabaseModel(selectedNode.data.id, { fields: updatedFields });
    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, fields: updatedFields }
    });
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 text-white flex flex-col h-full shadow-2xl relative z-20">
      {/* Tabs */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'add' ? 'border-indigo-500 text-indigo-400 bg-slate-850/30' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Toolbox
        </button>
        <button
          onClick={() => {
            if (selectedNode) setActiveTab('inspect');
          }}
          disabled={!selectedNode}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${
            !selectedNode ? 'opacity-40 cursor-not-allowed text-slate-500' :
            activeTab === 'inspect' ? 'border-indigo-500 text-indigo-400 bg-slate-850/30' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Inspector
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ADD PANEL */}
        {activeTab === 'add' && (
          <div className="space-y-6">
            {/* Create DB Schema */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Database size={14} /> Add DB Model
              </h3>
              <form onSubmit={handleAddDBModel} className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Product, Order"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Plus size={14} /> Create Model
                </button>
              </form>
            </div>

            {/* Create API Route */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Server size={14} /> Add API Endpoint
              </h3>
              <form onSubmit={handleAddRoute} className="space-y-2">
                <div className="flex gap-1.5">
                  <select
                    value={routeMethod}
                    onChange={(e) => setRouteMethod(e.target.value)}
                    className="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={routePath}
                    onChange={(e) => setRoutePath(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Plus size={14} /> Create Route
                </button>
              </form>
            </div>

            {/* Create UI Page */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Monitor size={14} /> Add Frontend Page
              </h3>
              <form onSubmit={handleAddPage} className="space-y-2">
                <input
                  type="text"
                  placeholder="Page Title (e.g. Products)"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Route Path (e.g. /products)"
                  value={pagePath}
                  onChange={(e) => setPagePath(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded text-xs text-white focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <Plus size={14} /> Create Page
                </button>
              </form>
            </div>
          </div>
        )}

        {/* INSPECT PANEL */}
        {activeTab === 'inspect' && selectedNode && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                {selectedNode.type === 'database' && <Database size={16} className="text-indigo-400" />}
                {selectedNode.type === 'backend' && <Server size={16} className="text-purple-400" />}
                {selectedNode.type === 'frontend' && <Monitor size={16} className="text-emerald-400" />}
                <span className="text-xs font-bold text-slate-300 uppercase">{selectedNode.type} Attributes</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. DB Model Inspector */}
            {selectedNode.type === 'database' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={selectedNode.data.name}
                    onChange={(e) => {
                      updateDatabaseModel(selectedNode.data.id, { name: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, name: e.target.value } });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-semibold text-white focus:outline-none"
                  />
                </div>

                {/* Fields list */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Fields Schema</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedNode.data.fields.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-950/30 rounded border border-slate-850">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-slate-200">{f.name}</span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {f.type} {f.required && '• required'} {f.unique && '• unique'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteField(f.name)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add field Form */}
                <form onSubmit={handleAddField} className="bg-slate-950/40 p-3 rounded-lg border border-slate-850 space-y-2.5">
                  <span className="block text-[10px] font-bold text-indigo-400 uppercase">New Attribute</span>
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none"
                  />
                  <div className="flex justify-between items-center gap-2">
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                    >
                      <option>String</option>
                      <option>Number</option>
                      <option>Boolean</option>
                      <option>Date</option>
                    </select>
                    <label className="flex items-center gap-1 text-[10px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={newFieldReq}
                        onChange={(e) => setNewFieldReq(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                      />
                      Required
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white rounded text-[11px] font-semibold transition"
                  >
                    Add Field
                  </button>
                </form>

                <button
                  onClick={() => deleteDatabaseModel(selectedNode.data.id)}
                  className="w-full mt-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={14} /> Delete Model
                </button>
              </div>
            )}

            {/* 2. Route Inspector */}
            {selectedNode.type === 'backend' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Route Path</label>
                  <input
                    type="text"
                    value={selectedNode.data.path}
                    onChange={(e) => {
                      updateBackendRoute(selectedNode.data.id, { path: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, path: e.target.value } });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-semibold text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">HTTP Method</label>
                  <select
                    value={selectedNode.data.method}
                    onChange={(e) => {
                      updateBackendRoute(selectedNode.data.id, { method: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, method: e.target.value } });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-semibold text-white focus:outline-none"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950/20 rounded border border-slate-850">
                  <span className="text-xs text-slate-300 font-semibold">Enable Authentication Guard</span>
                  <input
                    type="checkbox"
                    checked={selectedNode.data.authRequired}
                    onChange={(e) => {
                      updateBackendRoute(selectedNode.data.id, { authRequired: e.target.checked });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, authRequired: e.target.checked } });
                    }}
                    className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                  />
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Logic Pipeline</span>
                  <div className="space-y-1.5 pl-2 border-l-2 border-purple-500">
                    {selectedNode.data.logicSteps.map((step, idx) => (
                      <div key={idx} className="bg-slate-950/40 p-2 rounded border border-slate-850 text-xs text-slate-300 font-mono">
                        {idx + 1}. {step.type} {step.model ? `➔ ${step.model}` : ''}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteBackendRoute(selectedNode.data.id)}
                  className="w-full mt-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={14} /> Delete Endpoint
                </button>
              </div>
            )}

            {/* 3. Page Inspector */}
            {selectedNode.type === 'frontend' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Page Title</label>
                  <input
                    type="text"
                    value={selectedNode.data.title}
                    onChange={(e) => {
                      updateFrontendPage(selectedNode.data.id, { title: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, title: e.target.value } });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-semibold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Routing Path</label>
                  <input
                    type="text"
                    value={selectedNode.data.path}
                    onChange={(e) => {
                      updateFrontendPage(selectedNode.data.id, { path: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, path: e.target.value } });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-semibold text-white font-mono focus:outline-none"
                  />
                </div>

                {/* Sub components layout */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Component Template</label>
                  <select
                    value={selectedNode.data.components[0]?.type || 'Form'}
                    onChange={(e) => {
                      const updatedComp = {
                        ...selectedNode.data.components[0],
                        type: e.target.value,
                        title: e.target.value === 'Form' ? 'Add Item Form' : 'Item Overview Table'
                      };
                      updateFrontendPage(selectedNode.data.id, { components: [updatedComp] });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, components: [updatedComp] } });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none"
                  >
                    <option>Form</option>
                    <option>List</option>
                  </select>
                </div>

                {/* Render submit mapping selector if Form type */}
                {selectedNode.data.components[0]?.type === 'Form' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Button Action Trigger</label>
                    <select
                      value={selectedNode.data.components[0]?.submitButton?.routeId || ''}
                      onChange={(e) => {
                        const updatedComp = {
                          ...selectedNode.data.components[0],
                          submitButton: {
                            ...selectedNode.data.components[0].submitButton,
                            routeId: e.target.value
                          }
                        };
                        updateFrontendPage(selectedNode.data.id, { components: [updatedComp] });
                        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, components: [updatedComp] } });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none font-mono"
                    >
                      <option value="">-- None --</option>
                      {ir.backend.routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.method} {r.path}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => deleteFrontendPage(selectedNode.data.id)}
                  className="w-full mt-4 py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 size={14} /> Delete Page
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
