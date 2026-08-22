import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Server, Monitor } from 'lucide-react';

export const DbModelNode = ({ data, selected }) => {
  const { title, model, isNew } = data;
  return (
    <div className={`w-72 bg-brand-card border-2 rounded-2xl shadow-md overflow-hidden transition-all duration-250 ${
      selected ? 'border-brand-primary ring-4 ring-brand-accent/15' : isNew ? 'border-emerald-500 animate-pulse' : 'border-brand-border hover:border-brand-accent/50'
    }`}>
      {/* Target handle connecting API to DB Model */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3.5 h-3.5 bg-brand-primary border-2 border-brand-card"
      />

      <div className="bg-brand-bg/60 px-4 py-3.5 border-b border-brand-border flex items-center gap-2.5">
        <Database size={18} className="text-brand-primary shrink-0" />
        <span className="font-bold text-sm text-brand-text">{title} Schema</span>
        {isNew && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-lg border border-emerald-200">New</span>}
      </div>

      <div className="p-4 space-y-2 bg-brand-card max-h-64 overflow-y-auto">
        {model.fields.map((field, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm px-3 py-2 bg-brand-bg/40 rounded-xl border border-brand-border/40">
            <span className="text-brand-text font-mono font-semibold">{field.name}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold ${
              field.type === 'String' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
              field.type === 'Number' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
              field.type === 'Boolean' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
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
    GET: 'bg-blue-50 text-blue-600 border-blue-200',
    POST: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    PUT: 'bg-amber-50 text-amber-600 border-amber-200',
    DELETE: 'bg-rose-55 text-rose-600 border-rose-200',
  };

  return (
    <div className={`w-72 bg-brand-card border-2 rounded-2xl shadow-md overflow-hidden transition-all duration-250 ${
      selected ? 'border-brand-primary ring-4 ring-brand-accent/15' : isNew ? 'border-emerald-500 animate-pulse' : 'border-brand-border hover:border-brand-accent/50'
    }`}>
      {/* Target handle from UI page trigger */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-3.5 h-3.5 bg-brand-primary border-2 border-brand-card"
      />

      {/* Source handle connecting API to DB Model */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3.5 h-3.5 bg-brand-primary border-2 border-brand-card"
      />

      <div className="bg-brand-bg/60 px-4 py-3.5 border-b border-brand-border flex items-center gap-2.5">
        <Server size={18} className="text-brand-primary shrink-0" />
        <span className="font-bold text-sm text-brand-text">API Endpoint</span>
        {isNew && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-lg border border-emerald-200">New</span>}
      </div>

      <div className="p-4 space-y-3.5 bg-brand-card">
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${methodColors[route.method] || 'bg-slate-100 text-slate-600'}`}>
            {route.method}
          </span>
          <span className="text-sm font-mono text-brand-text font-bold truncate">{route.path}</span>
        </div>

        <div className="text-xs text-brand-muted space-y-2 pt-2 border-t border-brand-border/40">
          <div className="flex justify-between">
            <span>Auth Middleware:</span>
            <span className={route.authRequired ? 'text-amber-600 font-bold' : 'text-brand-muted'}>
              {route.authRequired ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="block mb-1.5 font-bold text-brand-text">Controller Logic:</span>
            <div className="flex flex-wrap gap-1.5">
              {route.logicSteps.map((step, idx) => (
                <span key={idx} className="bg-brand-bg px-2.5 py-0.5 rounded-lg border border-brand-border text-xs text-brand-primary font-mono font-semibold">
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
    <div className={`w-72 bg-brand-card border-2 rounded-2xl shadow-md overflow-hidden transition-all duration-250 ${
      selected ? 'border-brand-primary ring-4 ring-brand-accent/15' : isNew ? 'border-emerald-500 animate-pulse' : 'border-brand-border hover:border-brand-accent/50'
    }`}>
      {/* Source handle connecting UI Form submit to API */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-3.5 h-3.5 bg-brand-primary border-2 border-brand-card"
      />

      <div className="bg-brand-bg/60 px-4 py-3.5 border-b border-brand-border flex items-center gap-2.5">
        <Monitor size={18} className="text-brand-primary shrink-0" />
        <span className="font-bold text-sm text-brand-text">{title} Page</span>
        {isNew && <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-lg border border-emerald-200">New</span>}
      </div>

      <div className="p-4 bg-brand-card text-sm space-y-3">
        <div className="flex justify-between border-b border-brand-border/40 pb-2">
          <span className="text-brand-muted">Path:</span>
          <span className="font-mono text-brand-text font-bold">{page.path}</span>
        </div>

        {comp.type === 'Form' ? (
          <div>
            <div className="text-xs text-emerald-600 font-bold mb-2 uppercase tracking-wide">Form: {comp.title}</div>
            <div className="space-y-2 pl-2 border-l-2 border-brand-border">
              {comp.fields?.slice(0, 3).map((f, idx) => (
                <div key={idx} className="text-xs text-brand-text">
                  📄 {f.label} <span className="text-brand-muted font-mono font-medium">({f.type})</span>
                </div>
              ))}
              {comp.fields?.length > 3 && (
                <div className="text-xs text-brand-muted italic">+{comp.fields.length - 3} more fields</div>
              )}
            </div>
            <div className="mt-3.5 px-2 py-2 bg-emerald-50 border border-emerald-100 text-center rounded-xl text-xs text-emerald-600 font-bold">
              Submit triggers API
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-brand-primary font-bold mb-2 uppercase tracking-wide">List View: {comp.title}</div>
            <div className="text-xs text-brand-muted bg-brand-bg/40 p-3 rounded-xl border border-brand-border/40">
              Displays fetched collection records dynamically in grid container.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
