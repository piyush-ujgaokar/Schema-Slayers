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
    <div className="flex h-full text-white bg-slate-950">
      {/* Simulation Screen */}
      <div className="flex-1 p-5 border-r border-slate-900 flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-emerald-400 fill-emerald-400" />
            <h3 className="text-sm font-semibold">Simulator Viewport</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <span className="text-[10px] text-slate-400">Target Screen:</span>
            <select
              value={activePageId}
              onChange={(e) => setActivePageId(e.target.value)}
              className="bg-transparent border-none text-xs text-indigo-400 font-semibold focus:outline-none cursor-pointer"
            >
              {ir.frontend.pages.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.title} ({p.path})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Viewport Card */}
        {activePage ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-900/40 rounded-xl border border-slate-850 relative">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              {/* Header bar */}
              <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-slate-400 font-mono ml-4 select-none">localhost:3000{activePage.path}</span>
              </div>

              {/* Render Forms */}
              {comp.type === 'Form' ? (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <h4 className="text-lg font-bold text-slate-100 mb-4">{comp.title}</h4>
                  {comp.fields?.map((f, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        {f.label} {f.required && <span className="text-rose-400">*</span>}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={formData[f.name] || ''}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded text-xs text-white focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded text-xs text-white transition active:scale-[0.98]"
                  >
                    {comp.submitButton?.text || 'Submit'}
                  </button>
                </form>
              ) : (
                /* Render Lists */
                <div className="p-5">
                  <h4 className="text-lg font-bold text-slate-100 mb-4">{comp.title}</h4>
                  
                  {simulationDb.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs italic">
                      No records returned. Submit a wired form to populate rows!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {simulationDb.map((row, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/40 rounded border border-slate-850 flex flex-col gap-1 text-[11px]">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 pb-1 border-b border-slate-850/30">
                            <span className="font-mono text-indigo-400">ID: {row._id}</span>
                            <span>{new Date(row.createdAt).toLocaleTimeString()}</span>
                          </div>
                          {Object.entries(row)
                            .filter(([k]) => k !== '_id' && k !== '__model' && k !== 'createdAt')
                            .map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-slate-400 font-mono">{k}:</span>
                                <span className="text-slate-200 font-semibold">{v}</span>
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
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
            Create a Frontend page to begin testing.
          </div>
        )}
      </div>

      {/* Simulator logs & database viewer */}
      <div className="w-80 p-5 flex flex-col h-full bg-slate-950/60 border-l border-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database size={14} className="text-indigo-400" /> In-Memory Database
          </h4>
          <button
            onClick={handleClearDb}
            className="text-[10px] text-slate-500 hover:text-rose-400 font-semibold flex items-center gap-1"
          >
            <RefreshCw size={10} /> Reset
          </button>
        </div>

        {/* Dynamic DB rows list */}
        <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-[10px] font-mono space-y-2 mb-4">
          {simulationDb.length === 0 ? (
            <span className="text-slate-600 italic block py-4 text-center">Collection records are empty.</span>
          ) : (
            simulationDb.map((row, idx) => (
              <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-850/80">
                <span className="text-indigo-400 font-bold block mb-1">Mongoose Entity: {row.__model}</span>
                <pre className="text-[9px] text-slate-300 overflow-x-auto">{JSON.stringify(row, null, 2)}</pre>
              </div>
            ))
          )}
        </div>

        {/* Runtime Console Logs */}
        <div className="flex-[1.5] flex flex-col min-h-[180px]">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Server Console Output
          </h4>
          <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-900 rounded-lg p-3 text-[10px] font-mono text-emerald-400 space-y-1.5">
            {logs.length === 0 ? (
              <span className="text-slate-600 italic">[Sandbox Console] Log listener initialized.</span>
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
