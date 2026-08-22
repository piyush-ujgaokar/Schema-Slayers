import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Server, Monitor } from 'lucide-react';

export const DbModelNode = ({ data, selected }) => {
  const { title, model, isNew } = data;
  return (
    <div className={`w-64 bg-slate-900 border-2 rounded-xl shadow-xl overflow-hidden transition-all duration-250 ${
      selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : isNew ? 'border-emerald-500 animate-pulse' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Target handle connecting API to DB Model */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-indigo-500 border-2 border-slate-950"
      />

      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
        <Database size={16} className="text-indigo-400" />
        <span className="font-bold text-sm text-slate-100">{title} Schema</span>
        {isNew && <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/30">New</span>}
      </div>

      <div className="p-3 space-y-2 bg-slate-900/60 max-h-56 overflow-y-auto">
        {model.fields.map((field, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs px-2 py-1 bg-slate-950/40 rounded border border-slate-800/40">
            <span className="text-slate-300 font-mono">{field.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              field.type === 'String' ? 'bg-blue-500/10 text-blue-400' :
              field.type === 'Number' ? 'bg-amber-500/10 text-amber-400' :
              field.type === 'Boolean' ? 'bg-teal-500/10 text-teal-400' : 'bg-purple-500/10 text-purple-400'
            }`}>
              {field.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ApiRouteNode = ({ data, selected }) => {
  const { title, route, isNew } = data;
  const methodColors = {
    GET: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    POST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    DELETE: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  return (
    <div className={`w-64 bg-slate-900 border-2 rounded-xl shadow-xl overflow-hidden transition-all duration-250 ${
      selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : isNew ? 'border-emerald-500 animate-pulse' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Target handle from UI page trigger */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-950"
      />

      {/* Source handle connecting API to DB Model */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-indigo-500 border-2 border-slate-950"
      />

      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
        <Server size={16} className="text-indigo-400" />
        <span className="font-bold text-sm text-slate-100">API Endpoint</span>
        {isNew && <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/30">New</span>}
      </div>

      <div className="p-3 space-y-2.5 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${methodColors[route.method] || 'bg-slate-500/10 text-slate-400'}`}>
            {route.method}
          </span>
          <span className="text-xs font-mono text-slate-200 truncate">{route.path}</span>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Auth Required:</span>
            <span className={route.authRequired ? 'text-amber-400' : 'text-slate-500'}>
              {route.authRequired ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="block mb-1">Logic sequence:</span>
            <div className="flex flex-wrap gap-1">
              {route.logicSteps.map((step, idx) => (
                <span key={idx} className="bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/80 text-[10px] text-indigo-300 font-mono">
                  {step.type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UiPageNode = ({ data, selected }) => {
  const { title, page, isNew } = data;
  const comp = page.components[0] || {};

  return (
    <div className={`w-64 bg-slate-900 border-2 rounded-xl shadow-xl overflow-hidden transition-all duration-250 ${
      selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : isNew ? 'border-emerald-500 animate-pulse' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Source handle connecting UI Form submit to API */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-950"
      />

      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
        <Monitor size={16} className="text-indigo-400" />
        <span className="font-bold text-sm text-slate-100">{title} Page</span>
        {isNew && <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/30">New</span>}
      </div>

      <div className="p-3 bg-slate-900/60 text-xs space-y-2">
        <div className="flex justify-between border-b border-slate-850 pb-1.5">
          <span className="text-slate-400">Path:</span>
          <span className="font-mono text-slate-200">{page.path}</span>
        </div>

        {comp.type === 'Form' ? (
          <div>
            <div className="text-[10px] text-emerald-400 font-semibold mb-1 uppercase tracking-wide">Form: {comp.title}</div>
            <div className="space-y-1.5 pl-1.5 border-l border-slate-800">
              {comp.fields?.slice(0, 3).map((f, idx) => (
                <div key={idx} className="text-[10px] text-slate-300">
                  📄 {f.label} <span className="text-slate-500 font-mono">({f.type})</span>
                </div>
              ))}
              {comp.fields?.length > 3 && (
                <div className="text-[9px] text-slate-500 italic">+{comp.fields.length - 3} more fields</div>
              )}
            </div>
            <div className="mt-2.5 px-2 py-1 bg-emerald-950/30 border border-emerald-900/30 text-center rounded text-[10px] text-emerald-400 font-medium">
              Submit triggers API
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[10px] text-indigo-400 font-semibold mb-1 uppercase tracking-wide">List View: {comp.title}</div>
            <div className="text-[10px] text-slate-400 bg-slate-950/30 p-2 rounded border border-slate-800/40">
              Displays fetched collection records dynamically in grid container.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
