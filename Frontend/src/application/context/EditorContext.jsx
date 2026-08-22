import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../../infrastructure/api/apiClient';

const EditorContext = createContext(null);

const initialIR = {
  projectInfo: {
    name: 'ecommerce-service',
    theme: 'modern-indigo'
  },
  database: {
    models: [
      {
        id: 'model_user',
        name: 'User',
        fields: [
          { name: 'name', type: 'String', required: true, unique: false },
          { name: 'email', type: 'String', required: true, unique: true },
          { name: 'password', type: 'String', required: true, unique: false }
        ]
      }
    ]
  },
  backend: {
    routes: [
      {
        id: 'route_register',
        path: '/api/register',
        method: 'POST',
        authRequired: false,
        logicSteps: [
          { type: 'validate' },
          { type: 'hash_password', field: 'password' },
          { type: 'db_create', model: 'User' }
        ]
      }
    ]
  },
  frontend: {
    pages: [
      {
        id: 'page_register',
        title: 'Sign Up',
        path: '/register',
        components: [
          {
            id: 'comp_register_form',
            type: 'Form',
            title: 'Create Account',
            fields: [
              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Name' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'Email' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' }
            ],
            submitButton: {
              text: 'Sign Up',
              routeId: 'route_register',
              onSuccess: { action: 'redirect', path: '/login' }
            }
          }
        ]
      }
    ]
  }
};

export const EditorProvider = ({ children }) => {
  const [ir, setIr] = useState(initialIR);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // Node details for inspector panel
  const [compiledFiles, setCompiledFiles] = useState({});
  const [isCompiling, setIsCompiling] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [simulationDb, setSimulationDb] = useState([]); // Simulated backend in-memory database records
  const [diffAddedNodes, setDiffAddedNodes] = useState(new Set()); // Nodes marked as new from AI changes
  const [projectsList, setProjectsList] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  // Fetch projects on mount
  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjectsList(response.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Convert IR schema to React Flow Nodes & Edges
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    // Grid coordinates multipliers
    let dbY = 50;
    let apiY = 50;
    let uiY = 50;

    // 1. Add DB Model Nodes
    ir.database.models.forEach((model) => {
      newNodes.push({
        id: model.id,
        type: 'dbModel',
        position: { x: 50, y: dbY },
        data: { 
          title: model.name, 
          model,
          isNew: diffAddedNodes.has(model.id)
        },
      });
      dbY += 280;
    });

    // 2. Add Backend Route Nodes
    ir.backend.routes.forEach((route) => {
      newNodes.push({
        id: route.id,
        type: 'apiRoute',
        position: { x: 450, y: apiY },
        data: { 
          title: `${route.method} ${route.path}`, 
          route,
          isNew: diffAddedNodes.has(route.id)
        },
      });

      // Find DB model connection based on steps
      const dbStep = route.logicSteps?.find(s => s.type === 'db_create' || s.type === 'db_query');
      if (dbStep) {
        const modelObj = ir.database.models.find(m => m.name === dbStep.model);
        if (modelObj) {
          newEdges.push({
            id: `edge_${route.id}_to_${modelObj.id}`,
            source: route.id,
            target: modelObj.id,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
          });
        }
      }

      apiY += 280;
    });

    // 3. Add Frontend Page Nodes
    ir.frontend.pages.forEach((page) => {
      newNodes.push({
        id: page.id,
        type: 'uiPage',
        position: { x: 850, y: uiY },
        data: { 
          title: page.title, 
          page,
          isNew: diffAddedNodes.has(page.id)
        },
      });

      // Form submit action API trigger connection
      page.components.forEach((comp) => {
        if (comp.submitButton && comp.submitButton.routeId) {
          newEdges.push({
            id: `edge_${page.id}_to_${comp.submitButton.routeId}`,
            source: page.id,
            target: comp.submitButton.routeId,
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 },
          });
        }
      });

      uiY += 280;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [ir, diffAddedNodes]);

  // Sync / compile IR into code files on backend
  const triggerCompilation = async () => {
    setIsCompiling(true);
    try {
      const response = await apiClient.post('/compile', { ir });
      setCompiledFiles(response.data.files);
    } catch (error) {
      console.error('Compilation backend error:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  // Compile code initially and when IR changes
  useEffect(() => {
    triggerCompilation();
  }, [ir]);

  // AI assistant prompt processor
  const sendAIPrompt = async (prompt) => {
    setAiLoading(true);
    try {
      const response = await apiClient.post('/ai', { prompt, ir });
      const updatedIR = response.data.ir;
      
      // Calculate which nodes are added to highlight with green diff
      const newIds = new Set();
      const currentIds = new Set([
        ...ir.database.models.map(m => m.id),
        ...ir.backend.routes.map(r => r.id),
        ...ir.frontend.pages.map(p => p.id)
      ]);

      const updatedIds = [
        ...updatedIR.database.models.map(m => m.id),
        ...updatedIR.backend.routes.map(r => r.id),
        ...updatedIR.frontend.pages.map(p => p.id)
      ];

      updatedIds.forEach(id => {
        if (!currentIds.has(id)) {
          newIds.add(id);
        }
      });

      setDiffAddedNodes(newIds);
      setIr(updatedIR);

      // Auto clear diff after 8 seconds
      setTimeout(() => {
        setDiffAddedNodes(new Set());
      }, 8000);

      return { success: true };
    } catch (error) {
      console.error('AI assistant processing failed:', error);
      return { success: false, message: error.message };
    } finally {
      setAiLoading(false);
    }
  };

  // CRUD Modification hooks
  const updateDatabaseModel = (id, updatedModel) => {
    setIr(prev => {
      const models = prev.database.models.map(m => m.id === id ? { ...m, ...updatedModel } : m);
      return { ...prev, database: { ...prev.database, models } };
    });
  };

  const addDatabaseModel = (name) => {
    const id = `model_${Date.now()}`;
    const newModel = {
      id,
      name,
      fields: [
        { name: 'id', type: 'String', required: true, unique: true },
        { name: 'createdAt', type: 'Date', required: false, unique: false }
      ]
    };
    setIr(prev => ({
      ...prev,
      database: { ...prev.database, models: [...prev.database.models, newModel] }
    }));
  };

  const deleteDatabaseModel = (id) => {
    setIr(prev => {
      const models = prev.database.models.filter(m => m.id !== id);
      return { ...prev, database: { ...prev.database, models } };
    });
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const updateBackendRoute = (id, updatedRoute) => {
    setIr(prev => {
      const routes = prev.backend.routes.map(r => r.id === id ? { ...r, ...updatedRoute } : r);
      return { ...prev, backend: { ...prev.backend, routes } };
    });
  };

  const addBackendRoute = (method, path) => {
    const id = `route_${Date.now()}`;
    const newRoute = {
      id,
      method,
      path,
      authRequired: false,
      logicSteps: [{ type: 'validate' }]
    };
    setIr(prev => ({
      ...prev,
      backend: { ...prev.backend, routes: [...prev.backend.routes, newRoute] }
    }));
  };

  const deleteBackendRoute = (id) => {
    setIr(prev => {
      const routes = prev.backend.routes.filter(r => r.id !== id);
      return { ...prev, backend: { ...prev.backend, routes } };
    });
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const updateFrontendPage = (id, updatedPage) => {
    setIr(prev => {
      const pages = prev.frontend.pages.map(p => p.id === id ? { ...p, ...updatedPage } : p);
      return { ...prev, frontend: { ...prev.frontend, pages } };
    });
  };

  const addFrontendPage = (title, path) => {
    const id = `page_${Date.now()}`;
    const newPage = {
      id,
      title,
      path,
      components: [
        {
          id: `comp_${Date.now()}`,
          type: 'List',
          title: `${title} Overview`,
          dataSource: ''
        }
      ]
    };
    setIr(prev => ({
      ...prev,
      frontend: { ...prev.frontend, pages: [...prev.frontend.pages, newPage] }
    }));
  };

  const deleteFrontendPage = (id) => {
    setIr(prev => {
      const pages = prev.frontend.pages.filter(p => p.id !== id);
      return { ...prev, frontend: { ...prev.frontend, pages } };
    });
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const saveProject = async (name) => {
    try {
      const response = await apiClient.post('/projects', {
        id: currentProject?.id,
        name,
        ir
      });
      const saved = response.data.project;
      setCurrentProject({ id: saved.id, name: saved.name });
      await fetchProjects();
      return { success: true };
    } catch (error) {
      console.error('Failed to save project:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const loadProject = (project) => {
    setIr(project.ir);
    setCurrentProject({ id: project.id, name: project.name });
  };

  const deleteSavedProject = async (id) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      await fetchProjects();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete project:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  return (
    <EditorContext.Provider value={{
      ir,
      nodes,
      edges,
      selectedNode,
      setSelectedNode,
      compiledFiles,
      isCompiling,
      aiLoading,
      sendAIPrompt,
      updateDatabaseModel,
      addDatabaseModel,
      deleteDatabaseModel,
      updateBackendRoute,
      addBackendRoute,
      deleteBackendRoute,
      updateFrontendPage,
      addFrontendPage,
      deleteFrontendPage,
      simulationDb,
      setSimulationDb,
      projectsList,
      currentProject,
      saveProject,
      loadProject,
      deleteSavedProject,
      fetchProjects
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
