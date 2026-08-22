import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditor } from '../../application/context/EditorContext';
import { DbModelNode, ApiRouteNode, UiPageNode } from './CustomNodes';

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, setSelectedNode } = useEditor();

  const nodeTypes = useMemo(() => ({
    dbModel: DbModelNode,
    apiRoute: ApiRouteNode,
    uiPage: UiPageNode,
  }), []);

  const onNodeClick = (event, node) => {
    // Determine target entity type
    if (node.type === 'dbModel') {
      setSelectedNode({ type: 'database', data: node.data.model });
    } else if (node.type === 'apiRoute') {
      setSelectedNode({ type: 'backend', data: node.data.route });
    } else if (node.type === 'uiPage') {
      setSelectedNode({ type: 'frontend', data: node.data.page });
    }
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="text-white"
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#334155" gap={16} size={1} variant="dots" />
        <Controls className="bg-slate-900 border border-slate-800 text-white fill-white rounded-lg [&_button]:bg-slate-900 [&_button]:border-slate-800 [&_button:hover]:bg-slate-800" />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'dbModel') return '#6366f1';
            if (node.type === 'apiRoute') return '#8b5cf6';
            if (node.type === 'uiPage') return '#10b981';
            return '#64748b';
          }}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}
