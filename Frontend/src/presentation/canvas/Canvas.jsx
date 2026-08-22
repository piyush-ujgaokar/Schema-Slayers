import React, { useMemo, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditor } from '../../application/context/EditorContext';
import { DbModelNode, ApiRouteNode, UiPageNode } from './CustomNodes';

export default function Canvas() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    setSelectedNode,
    bindNodesManual,
    unbindNodesManual
  } = useEditor();

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

  const onConnect = useCallback((connection) => {
    bindNodesManual(connection.source, connection.target);
  }, [bindNodesManual]);

  const onEdgesDelete = useCallback((deletedEdges) => {
    deletedEdges.forEach(edge => {
      unbindNodesManual(edge.source, edge.target);
    });
  }, [unbindNodesManual]);

  const onEdgeDoubleClick = useCallback((event, edge) => {
    unbindNodesManual(edge.source, edge.target);
  }, [unbindNodesManual]);

  return (
    <div className="w-full h-full bg-brand-bg relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="text-brand-text"
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#8C8A82" gap={16} size={1.2} variant="dots" opacity={0.35} />
        <Controls className="bg-brand-card border border-brand-border text-brand-text fill-brand-text rounded-xl shadow-sm [&_button]:bg-brand-card [&_button]:border-brand-border [&_button:hover]:bg-brand-bg [&_button_svg]:fill-brand-text" />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'dbModel') return '#6366f1';
            if (node.type === 'apiRoute') return '#8b5cf6';
            if (node.type === 'uiPage') return '#10b981';
            return '#64748b';
          }}
          maskColor="rgba(245, 242, 234, 0.6)"
          className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
