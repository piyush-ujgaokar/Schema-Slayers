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
    <aside className="w-80 bg-brand-card border-l border-brand-border text-brand-text flex flex-col h-full shadow-lg relative z-25">
      {/* Tabs */}
      <div className="flex border-b border-brand-border shrink-0">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-4 text-sm font-bold border-b-2 uppercase tracking-wide transition ${
            activeTab === 'add' ? 'border-brand-primary text-brand-text bg-brand-bg/20' : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Toolbox
        </button>
        <button
          onClick={() => {
            if (selectedNode) setActiveTab('inspect');
          }}
          disabled={!selectedNode}
          className={`flex-1 py-4 text-sm font-bold border-b-2 uppercase tracking-wide transition ${
            !selectedNode ? 'opacity-30 cursor-not-allowed text-brand-muted' :
            activeTab === 'inspect' ? 'border-brand-primary text-brand-text bg-brand-bg/20' : 'border-transparent text-brand-muted hover:text-brand-text'
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
            <div className="bg-brand-bg/40 p-4 rounded-2xl border border-brand-border">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Database size={16} className="text-indigo-600" /> Add DB Model
              </h3>
              <form onSubmit={handleAddDBModel} className="space-y-3">
                <input
                  type="text"
                  placeholder="e.g. Product, Order"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus size={16} /> Create Model
                </button>
              </form>
            </div>

            {/* Create API Route */}
            <div className="bg-brand-bg/40 p-4 rounded-2xl border border-brand-border">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Server size={16} className="text-purple-600" /> Add API Endpoint
              </h3>
              <form onSubmit={handleAddRoute} className="space-y-3">
                <div className="flex gap-1.5">
                  <select
                    value={routeMethod}
                    onChange={(e) => setRouteMethod(e.target.value)}
                    className="bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none cursor-pointer"
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
                    className="flex-1 px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus size={16} /> Create Route
                </button>
              </form>
            </div>

            {/* Create UI Page */}
            <div className="bg-brand-bg/40 p-4 rounded-2xl border border-brand-border">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Monitor size={16} className="text-emerald-600" /> Add Frontend Page
              </h3>
              <form onSubmit={handleAddPage} className="space-y-3">
                <input
                  type="text"
                  placeholder="Page Title (e.g. Products)"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Route Path (e.g. /products)"
                  value={pagePath}
                  onChange={(e) => setPagePath(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Plus size={16} /> Create Page
                </button>
              </form>
            </div>
          </div>
        )}

        {/* INSPECT PANEL */}
        {activeTab === 'inspect' && selectedNode && (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-brand-bg p-3.5 rounded-2xl border border-brand-border">
              <div className="flex items-center gap-2">
                {selectedNode.type === 'database' && <Database size={18} className="text-indigo-600" />}
                {selectedNode.type === 'backend' && <Server size={18} className="text-purple-600" />}
                {selectedNode.type === 'frontend' && <Monitor size={18} className="text-emerald-600" />}
                <span className="text-xs font-bold text-brand-text uppercase tracking-wider">{selectedNode.type} Attributes</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-brand-muted hover:text-brand-text transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. DB Model Inspector */}
            {selectedNode.type === 'database' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Model Name</label>
                  <input
                    type="text"
                    value={selectedNode.data.name}
                    onChange={(e) => {
                      updateDatabaseModel(selectedNode.data.id, { name: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, name: e.target.value } });
                    }}
                    className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm font-semibold text-brand-text focus:outline-none"
                  />
                </div>

                {/* Fields list */}
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Fields Schema</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedNode.data.fields.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-brand-bg/30 rounded-xl border border-brand-border/60">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-mono font-bold text-brand-text">{f.name}</span>
                          <span className="text-xs text-brand-muted font-bold">
                            {f.type} {f.required && '• required'} {f.unique && '• unique'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteField(f.name)}
                          className="text-brand-muted hover:text-rose-500 p-1.5 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add field Form */}
                <form onSubmit={handleAddField} className="bg-brand-bg/40 p-4 rounded-2xl border border-brand-border space-y-3">
                  <span className="block text-xs font-bold text-brand-text uppercase tracking-wider">New Attribute</span>
                  <input
                    type="text"
                    placeholder="Field Name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full px-4 py-2 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none"
                  />
                  <div className="flex justify-between items-center gap-2">
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl px-3 py-1.5 text-xs text-brand-text focus:outline-none cursor-pointer"
                    >
                      <option>String</option>
                      <option>Number</option>
                      <option>Boolean</option>
                      <option>Date</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-brand-text font-bold">
                      <input
                        type="checkbox"
                        checked={newFieldReq}
                        onChange={(e) => setNewFieldReq(e.target.checked)}
                        className="rounded bg-brand-card border-brand-border text-brand-primary focus:ring-0"
                      />
                      Required
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg rounded-xl text-xs font-bold transition"
                  >
                    Add Field
                  </button>
                </form>

                <button
                  onClick={() => deleteDatabaseModel(selectedNode.data.id)}
                  className="w-full mt-4 py-3 border border-rose-200 hover:bg-rose-550 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={16} /> Delete Model
                </button>
              </div>
            )}

            {/* 2. Route Inspector */}
            {selectedNode.type === 'backend' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Route Path</label>
                  <input
                    type="text"
                    value={selectedNode.data.path}
                    onChange={(e) => {
                      updateBackendRoute(selectedNode.data.id, { path: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, path: e.target.value } });
                    }}
                    className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm font-semibold text-brand-text font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">HTTP Method</label>
                  <select
                    value={selectedNode.data.method}
                    onChange={(e) => {
                      updateBackendRoute(selectedNode.data.id, { method: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, method: e.target.value } });
                    }}
                    className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm font-bold text-brand-text focus:outline-none cursor-pointer"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-brand-bg/40 rounded-2xl border border-brand-border">
                  <span className="text-xs text-brand-text font-bold">Authentication Guard</span>
                  <input
                    type="checkbox"
                    checked={selectedNode.data.authRequired}
                    onChange={(e) => {
                      updateBackendRoute(selectedNode.data.id, { authRequired: e.target.checked });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, authRequired: e.target.checked } });
                    }}
                    className="h-4.5 w-4.5 rounded bg-brand-card border-brand-border text-brand-primary focus:ring-0"
                  />
                </div>

                <div>
                  <span className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Logic Pipeline</span>
                  <div className="space-y-2 pl-3 border-l-2 border-brand-primary">
                    {selectedNode.data.logicSteps.map((step, idx) => (
                      <div key={idx} className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border text-xs text-brand-text font-mono">
                        {idx + 1}. {step.type} {step.model ? `➔ ${step.model}` : ''}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteBackendRoute(selectedNode.data.id)}
                  className="w-full mt-4 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={16} /> Delete Endpoint
                </button>
              </div>
            )}

            {/* 3. Page Inspector */}
            {selectedNode.type === 'frontend' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Page Title</label>
                  <input
                    type="text"
                    value={selectedNode.data.title}
                    onChange={(e) => {
                      updateFrontendPage(selectedNode.data.id, { title: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, title: e.target.value } });
                    }}
                    className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm font-semibold text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Routing Path</label>
                  <input
                    type="text"
                    value={selectedNode.data.path}
                    onChange={(e) => {
                      updateFrontendPage(selectedNode.data.id, { path: e.target.value });
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, path: e.target.value } });
                    }}
                    className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text font-mono focus:outline-none"
                  />
                </div>

                {/* Sub components layout */}
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Component Template</label>
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
                    className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm font-bold text-brand-text focus:outline-none cursor-pointer"
                  >
                    <option>Form</option>
                    <option>List</option>
                  </select>
                </div>

                {/* Render submit mapping selector if Form type */}
                {selectedNode.data.components[0]?.type === 'Form' && (
                  <div>
                    <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wider">Button Action Trigger</label>
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
                      className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none font-mono cursor-pointer"
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
                  className="w-full mt-4 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 size={16} /> Delete Page
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
