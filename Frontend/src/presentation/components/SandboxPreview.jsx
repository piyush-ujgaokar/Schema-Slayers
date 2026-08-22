import React, { useState } from 'react';
import { useEditor } from '../../application/context/EditorContext';
import { Play, Database, CheckCircle, RefreshCw } from 'lucide-react';

export default function SandboxPreview() {
  const { ir, simulationDb, setSimulationDb } = useEditor();
  const [activePageId, setActivePageId] = useState(ir.frontend.pages[0]?.id || '');
  const [formData, setFormData] = useState({});
  const [logs, setLogs] = useState([]);

  // Get active page configuration
  const activePage = ir.frontend.pages.find(p => p.id === activePageId) || ir.frontend.pages[0];
  const comp = activePage?.components[0] || {};

  const handleInputChange = (fieldName, val) => {
    setFormData(prev => ({ ...prev, [fieldName]: val }));
  };

  const handleClearDb = () => {
    setSimulationDb([]);
    setLogs(['[System] Local database cleared.']);
  };

  const logMessage = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (comp.type !== 'Form') return;

    logMessage(`Frontend: Form submitted! Payload: ${JSON.stringify(formData)}`);

    const buttonConfig = comp.submitButton || {};
    if (!buttonConfig.routeId) {
      logMessage(`Warning: Submit button is not wired to any API Route Node!`);
      alert('Form submitted! (Note: This button is not connected to any backend endpoint on the canvas)');
      return;
    }

    // Find linked API route
    const route = ir.backend.routes.find(r => r.id === buttonConfig.routeId);
    if (!route) {
      logMessage(`Error: Connected API Route ${buttonConfig.routeId} not found.`);
      return;
    }

    logMessage(`HTTP Request: Sending ${route.method} ${route.path}`);

    // Simulate backend steps
    let currentPayload = { ...formData };
    let validationPassed = true;

    route.logicSteps.forEach((step) => {
      if (step.type === 'validate') {
        logMessage(`Middleware: Validating request payload...`);
        // Basic check
        const missing = comp.fields.filter(f => f.required && !currentPayload[f.name]);
        if (missing.length > 0) {
          validationPassed = false;
          logMessage(`Validation Fail: Missing fields [${missing.map(m=>m.name).join(', ')}]`);
        } else {
          logMessage(`Validation Success: All constraints met.`);
        }
      }

      if (step.type === 'hash_password') {
        logMessage(`Middleware: Hashing security field 'password' via bcryptjs...`);
        if (currentPayload.password) {
          currentPayload.password = '★bcrypt_hashed_sha256_token★';
        }
      }

      if (step.type === 'db_create' && validationPassed) {
        logMessage(`Database: Executing Mongoose ${step.model}.create() operation...`);
        const newRecord = {
          _id: `mock_id_${Math.random().toString(36).substr(2, 9)}`,
          __model: step.model,
          ...currentPayload,
          createdAt: new Date().toISOString()
        };
        setSimulationDb(prev => [...prev, newRecord]);
        logMessage(`Database: Success! 1 record written to ${step.model} collection.`);
      }
    });

    if (validationPassed) {
      logMessage(`HTTP Response: 201 Created.`);
      alert(`Success! Simulated server response: 201 Created.\nSaved to in-memory Mongoose database.`);
      setFormData({});
      
      // Perform redirect action
      if (buttonConfig.onSuccess && buttonConfig.onSuccess.action === 'redirect') {
        const targetPage = ir.frontend.pages.find(p => p.path === buttonConfig.onSuccess.path);
        if (targetPage) {
          setTimeout(() => {
            setActivePageId(targetPage.id);
            logMessage(`Navigation: Redirecting to ${targetPage.title} (${targetPage.path})`);
          }, 1500);
        }
      }
    } else {
      logMessage(`HTTP Response: 400 Bad Request.`);
      alert('Validation Error: Please fill in all required fields.');
    }
  };

  return (
    <div className="flex h-full text-brand-text bg-brand-bg font-sans">
      {/* Simulation Screen */}
      <div className="flex-1 p-6 border-r border-brand-border flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <Play size={18} className="text-brand-primary fill-brand-primary shrink-0" />
            <h3 className="text-base font-bold">Simulator Viewport</h3>
          </div>
          <div className="flex items-center gap-2 bg-brand-card border border-brand-border rounded-xl px-4 py-2 shadow-sm">
            <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Target Screen:</span>
            <select
              value={activePageId}
              onChange={(e) => setActivePageId(e.target.value)}
              className="bg-transparent border-none text-sm text-brand-text font-bold focus:outline-none cursor-pointer"
            >
              {ir.frontend.pages.map((p) => (
                <option key={p.id} value={p.id} className="bg-brand-card">
                  {p.title} ({p.path})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Viewport Card */}
        {activePage ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-brand-card border border-brand-border rounded-3xl shadow-md relative">
            <div className="max-w-md w-full bg-brand-bg/50 border border-brand-border rounded-2xl shadow-sm overflow-hidden">
              {/* Header bar */}
              <div className="bg-brand-card px-4 py-3 border-b border-brand-border flex items-center gap-2 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs text-brand-muted font-mono ml-4 select-none">localhost:3000{activePage.path}</span>
              </div>

              {/* Render Forms */}
              {comp.type === 'Form' ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <h4 className="text-xl font-extrabold text-brand-text mb-4">{comp.title}</h4>
                  {comp.fields?.map((f, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                        {f.label} {f.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={formData[f.name] || ''}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        className="w-full px-4 py-2.5 bg-brand-card border border-brand-border focus:border-brand-primary rounded-xl text-sm text-brand-text focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-brand-primary hover:bg-brand-primary-hover font-bold rounded-xl text-sm text-brand-bg transition active:scale-[0.98] cursor-pointer"
                  >
                    {comp.submitButton?.text || 'Submit'}
                  </button>
                </form>
              ) : (
                /* Render Lists */
                <div className="p-6">
                  <h4 className="text-xl font-bold text-brand-text mb-4">{comp.title}</h4>
                  
                  {simulationDb.length === 0 ? (
                    <div className="py-10 text-center text-brand-muted text-sm italic">
                      No records returned. Submit a wired form to populate rows!
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto">
                      {simulationDb.map((row, idx) => (
                        <div key={idx} className="p-4 bg-brand-card border border-brand-border rounded-xl flex flex-col gap-2 text-xs shadow-sm">
                          <div className="flex justify-between items-center text-xs text-brand-muted pb-1.5 border-b border-brand-border/40">
                            <span className="font-mono text-brand-text font-bold">ID: {row._id}</span>
                            <span>{new Date(row.createdAt).toLocaleTimeString()}</span>
                          </div>
                          {Object.entries(row)
                            .filter(([k]) => k !== '_id' && k !== '__model' && k !== 'createdAt')
                            .map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-brand-muted font-mono font-medium">{k}:</span>
                                <span className="text-brand-text font-bold">{v}</span>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-brand-muted text-sm italic">
            Create a Frontend page to begin testing.
          </div>
        )}
      </div>

      {/* Simulator logs & database viewer */}
      <div className="w-80 p-5 flex flex-col h-full bg-brand-card border-l border-brand-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
            <Database size={16} className="text-brand-primary" /> In-Memory Database
          </h4>
          <button
            onClick={handleClearDb}
            className="text-xs text-brand-muted hover:text-rose-500 font-bold flex items-center gap-1 transition"
          >
            <RefreshCw size={12} /> Reset
          </button>
        </div>

        {/* Dynamic DB rows list */}
        <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto bg-brand-bg/50 border border-brand-border rounded-2xl p-3.5 text-xs font-mono space-y-2.5 mb-4">
          {simulationDb.length === 0 ? (
            <span className="text-brand-muted italic block py-4 text-center">Collection records are empty.</span>
          ) : (
            simulationDb.map((row, idx) => (
              <div key={idx} className="bg-brand-card p-2.5 rounded-xl border border-brand-border">
                <span className="text-brand-text font-bold block mb-1">Mongoose: {row.__model}</span>
                <pre className="text-xs text-brand-muted overflow-x-auto">{JSON.stringify(row, null, 2)}</pre>
              </div>
            ))
          )}
        </div>

        {/* Runtime Console Logs */}
        <div className="flex-[1.5] flex flex-col min-h-[180px]">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
            Server Console Output
          </h4>
          <div className="flex-1 overflow-y-auto bg-[#1E1E1C] border border-brand-border rounded-2xl p-3.5 text-xs font-mono text-lime-400 space-y-2 shadow-inner">
            {logs.length === 0 ? (
              <span className="text-[#6E6E6A] italic">[Console] Server runtime log listener initialized.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
