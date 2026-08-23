import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
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
  const [ir, setIr] = useState(() => {
    const saved = localStorage.getItem('visual_builder_current_ir');
    return saved ? JSON.parse(saved) : initialIR;
  });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // Node details for inspector panel
  const [compiledFiles, setCompiledFiles] = useState({});
  const [isCompiling, setIsCompiling] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [simulationDb, setSimulationDb] = useState([]); // Simulated backend in-memory database records
  const [diffAddedNodes, setDiffAddedNodes] = useState(new Set()); // Nodes marked as new from AI changes
  const [projectsList, setProjectsList] = useState([]);
  const [currentProject, setCurrentProject] = useState(() => {
    const saved = localStorage.getItem('visual_builder_current_project');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist IR and currentProject to localStorage on changes
  useEffect(() => {
    localStorage.setItem('visual_builder_current_ir', JSON.stringify(ir));
  }, [ir]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('visual_builder_current_project', JSON.stringify(currentProject));
    } else {
      localStorage.removeItem('visual_builder_current_project');
    }
  }, [currentProject]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

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

  // Compile code after a short delay (debounce) to prevent cursor jumping while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerCompilation();
    }, 1000);
    return () => clearTimeout(timer);
  }, [ir]);

  // Auto-save changes to the database in the background if a project is open
  useEffect(() => {
    if (currentProject) {
      const timer = setTimeout(async () => {
        try {
          await apiClient.post('/projects', {
            name: currentProject.name,
            ir
          });
          console.log('Background auto-save to MongoDB succeeded.');
        } catch (error) {
          console.error('Background auto-save failed:', error);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ir, currentProject]);

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

  const createNewProject = () => {
    const blankIR = {
      projectInfo: {
        name: 'new-visual-stack',
        theme: 'modern-indigo'
      },
      database: { models: [] },
      backend: { routes: [] },
      frontend: { pages: [] }
    };
    setIr(blankIR);
    setCurrentProject(null);
    setSelectedNode(null);
    setDiffAddedNodes(new Set());
    localStorage.removeItem('visual_builder_current_project');
    localStorage.setItem('visual_builder_current_ir', JSON.stringify(blankIR));
  };

  const updateCompiledFile = (filepath, content) => {
    // 1. Update local compiledFiles state
    setCompiledFiles(prev => ({
      ...prev,
      [filepath]: content
    }));

    // 2. Bidirectional sync: Parse Mongoose Model fields back to visual IR models list
    if (filepath.startsWith('backend/src/models/') && filepath.endsWith('.model.js')) {
      const filename = filepath.split('/').pop();
      const modelName = filename.replace('.model.js', '');

      try {
        const schemaRegex = /new\s+mongoose\.Schema\s*\(\s*\{/i;
        const match = content.match(schemaRegex);
        const parsedFields = [];

        if (match) {
          const startBraceIndex = content.indexOf('{', match.index);
          if (startBraceIndex !== -1) {
            let braceCount = 1;
            let endBraceIndex = -1;
            for (let i = startBraceIndex + 1; i < content.length; i++) {
              if (content[i] === '{') braceCount++;
              else if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                  endBraceIndex = i;
                  break;
                }
              }
            }
            
            if (endBraceIndex !== -1) {
              const fieldsBlock = content.substring(startBraceIndex + 1, endBraceIndex);
              const fieldRegex = /(\w+)\s*:\s*(?:\{([\s\S]*?)\}|(\w+))/g;
              let fieldMatch;
              
              while ((fieldMatch = fieldRegex.exec(fieldsBlock)) !== null) {
                const fieldName = fieldMatch[1];
                let fieldType = 'String';
                let required = false;
                let unique = false;

                if (fieldMatch[2]) {
                  const innerProps = fieldMatch[2];
                  const typeMatch = innerProps.match(/type\s*:\s*(\w+)/);
                  if (typeMatch) fieldType = typeMatch[1];
                  if (innerProps.match(/required\s*:\s*true/i)) required = true;
                  if (innerProps.match(/unique\s*:\s*true/i)) unique = true;
                } else if (fieldMatch[3]) {
                  fieldType = fieldMatch[3];
                }

                if (['String', 'Number', 'Boolean', 'Date'].includes(fieldType)) {
                  parsedFields.push({
                    name: fieldName,
                    type: fieldType,
                    required,
                    unique
                  });
                }
              }
            }
          }
        }

        // Also check for any .add({ ... }) blocks (e.g. soft delete extensions)
        const addRegex = /\.add\s*\(\s*\{/gi;
        let addMatch;
        while ((addMatch = addRegex.exec(content)) !== null) {
          const startBraceIndex = content.indexOf('{', addMatch.index);
          if (startBraceIndex !== -1) {
            let braceCount = 1;
            let endBraceIndex = -1;
            for (let i = startBraceIndex + 1; i < content.length; i++) {
              if (content[i] === '{') braceCount++;
              else if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                  endBraceIndex = i;
                  break;
                }
              }
            }
            if (endBraceIndex !== -1) {
              const addBlock = content.substring(startBraceIndex + 1, endBraceIndex);
              const fieldRegex = /(\w+)\s*:\s*(?:\{([\s\S]*?)\}|(\w+))/g;
              let fieldMatch;
              
              while ((fieldMatch = fieldRegex.exec(addBlock)) !== null) {
                const fieldName = fieldMatch[1];
                let fieldType = 'String';
                let required = false;
                let unique = false;

                if (fieldMatch[2]) {
                  const innerProps = fieldMatch[2];
                  const typeMatch = innerProps.match(/type\s*:\s*(\w+)/);
                  if (typeMatch) fieldType = typeMatch[1];
                  if (innerProps.match(/required\s*:\s*true/i)) required = true;
                  if (innerProps.match(/unique\s*:\s*true/i)) unique = true;
                } else if (fieldMatch[3]) {
                  fieldType = fieldMatch[3];
                }

                if (['String', 'Number', 'Boolean', 'Date'].includes(fieldType)) {
                  if (!parsedFields.some(f => f.name === fieldName)) {
                    parsedFields.push({
                      name: fieldName,
                      type: fieldType,
                      required,
                      unique
                    });
                  }
                }
              }
            }
          }
        }

        const targetModel = ir.database.models.find(m => m.name === modelName);
        if (targetModel) {
          const fieldsChanged = JSON.stringify(targetModel.fields) !== JSON.stringify(parsedFields);
          if (fieldsChanged) {
            setIr(prev => {
              const updatedModels = prev.database.models.map(m => {
                if (m.name === modelName) {
                  return { ...m, fields: parsedFields };
                }
                return m;
              });
              return {
                ...prev,
                database: { ...prev.database, models: updatedModels }
              };
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync code edits back to visual models:', err);
      }
    }

    // 3. Bidirectional sync: Parse React Page form fields back to frontend page components
    if (filepath.startsWith('frontend/src/pages/') && filepath.endsWith('.jsx')) {
      const filename = filepath.split('/').pop();
      const pageId = filename.replace('.jsx', '');

      try {
        const registerRegex = /register\(\s*['"](\w+)['"]\s*(?:,\s*\{([\s\S]*?)\})?\)/g;
        let regMatch;
        const parsedFields = [];

        while ((regMatch = registerRegex.exec(content)) !== null) {
          const fieldName = regMatch[1];
          let required = false;
          if (regMatch[2] && regMatch[2].includes('required: true')) {
            required = true;
          }

          let inputType = 'text';
          if (fieldName.toLowerCase().includes('password')) inputType = 'password';
          if (fieldName.toLowerCase().includes('email')) inputType = 'email';
          if (fieldName.toLowerCase().includes('price') || fieldName.toLowerCase().includes('quantity') || fieldName.toLowerCase().includes('age')) inputType = 'number';

          parsedFields.push({
            name: fieldName,
            label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            type: inputType,
            placeholder: `Enter ${fieldName}`,
            required
          });
        }

        const targetPage = ir.frontend.pages.find(p => p.id === pageId);
        if (targetPage && targetPage.components && targetPage.components[0]) {
          const currentFields = targetPage.components[0].fields || [];
          const fieldsChanged = JSON.stringify(currentFields) !== JSON.stringify(parsedFields);
          
          if (fieldsChanged) {
            setIr(prev => {
              const updatedPages = prev.frontend.pages.map(p => {
                if (p.id === pageId) {
                  const updatedComp = { ...p.components[0], fields: parsedFields };
                  return { ...p, components: [updatedComp] };
                }
                return p;
              });
              return {
                ...prev,
                frontend: { ...prev.frontend, pages: updatedPages }
              };
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync React page edits back to frontend IR:', err);
      }
    }
  };

  const applySuggestionFuzzy = (originalCode, targetSnippet, replacementSnippet) => {
    if (originalCode.includes(targetSnippet)) {
      return originalCode.replace(targetSnippet, replacementSnippet);
    }

    const normalize = (str) => str.replace(/\s+/g, '');
    const normalizedOriginal = normalize(originalCode);
    const normalizedTarget = normalize(targetSnippet);

    let matchIndex = normalizedOriginal.indexOf(normalizedTarget);
    
    if (matchIndex === -1) {
      let adjustedTarget = targetSnippet;
      if (targetSnippet.includes('items = await')) {
        adjustedTarget = targetSnippet.replace('items = await', 'entities = await');
      } else if (targetSnippet.includes('entities = await')) {
        adjustedTarget = targetSnippet.replace('entities = await', 'items = await');
      }

      if (originalCode.includes(adjustedTarget)) {
        return originalCode.replace(adjustedTarget, replacementSnippet);
      }

      const normalizedAdjusted = normalize(adjustedTarget);
      const adjustedMatchIndex = normalizedOriginal.indexOf(normalizedAdjusted);
      if (adjustedMatchIndex !== -1) {
        matchIndex = adjustedMatchIndex;
      }
    }

    if (matchIndex !== -1) {
      let origStart = -1;
      let origEnd = -1;
      let normalizedPos = 0;

      for (let i = 0; i < originalCode.length; i++) {
        if (!/\s/.test(originalCode[i])) {
          if (normalizedPos === matchIndex) {
            origStart = i;
          }
          if (normalizedPos === matchIndex + normalizedTarget.length - 1) {
            origEnd = i + 1;
            break;
          }
          normalizedPos++;
        }
      }

      if (origStart !== -1 && origEnd !== -1) {
        return originalCode.substring(0, origStart) + replacementSnippet + originalCode.substring(origEnd);
      }
    }

    return null;
  };

  const bindNodesManual = (sourceId, targetId) => {
    // A. Page Node (source) ➔ Route Node (target)
    if (sourceId.startsWith('page_') && targetId.startsWith('route_')) {
      setIr(prev => {
        const updatedPages = prev.frontend.pages.map(p => {
          if (p.id === sourceId) {
            const updatedComp = { ...p.components[0] };
            if (updatedComp.submitButton) {
              updatedComp.submitButton = { ...updatedComp.submitButton, routeId: targetId };
            }
            return { ...p, components: [updatedComp] };
          }
          return p;
        });
        return {
          ...prev,
          frontend: { ...prev.frontend, pages: updatedPages }
        };
      });
    }

    // B. Route Node (source) ➔ DB Model Node (target)
    if (sourceId.startsWith('route_') && targetId.startsWith('model_')) {
      setIr(prev => {
        const targetModel = prev.database.models.find(m => m.id === targetId);
        if (!targetModel) return prev;
        const modelName = targetModel.name;

        const updatedRoutes = prev.backend.routes.map(r => {
          if (r.id === sourceId) {
            const stepType = r.method === 'POST' ? 'db_create' : 'db_query';
            const updatedSteps = [...r.logicSteps];
            const dbStepIdx = updatedSteps.findIndex(s => s.type === 'db_create' || s.type === 'db_query');
            if (dbStepIdx !== -1) {
              updatedSteps[dbStepIdx] = { ...updatedSteps[dbStepIdx], model: modelName };
            } else {
              updatedSteps.push({ type: stepType, model: modelName });
            }
            return { ...r, logicSteps: updatedSteps };
          }
          return r;
        });
        return {
          ...prev,
          backend: { ...prev.backend, routes: updatedRoutes }
        };
      });
    }
  };

  const unbindNodesManual = (sourceId, targetId) => {
    // A. Page Node (source) ➔ Route Node (target)
    if (sourceId.startsWith('page_') && targetId.startsWith('route_')) {
      setIr(prev => {
        const updatedPages = prev.frontend.pages.map(p => {
          if (p.id === sourceId) {
            const updatedComp = { ...p.components[0] };
            if (updatedComp.submitButton) {
              updatedComp.submitButton = { ...updatedComp.submitButton, routeId: "" };
            }
            return { ...p, components: [updatedComp] };
          }
          return p;
        });
        return {
          ...prev,
          frontend: { ...prev.frontend, pages: updatedPages }
        };
      });
    }

    // B. Route Node (source) ➔ DB Model Node (target)
    if (sourceId.startsWith('route_') && targetId.startsWith('model_')) {
      setIr(prev => {
        const targetModel = prev.database.models.find(m => m.id === targetId);
        if (!targetModel) return prev;
        const modelName = targetModel.name;

        const updatedRoutes = prev.backend.routes.map(r => {
          if (r.id === sourceId) {
            const updatedSteps = r.logicSteps.map(s => {
              if (s.model === modelName) {
                const { model, ...rest } = s;
                return rest;
              }
              return s;
            });
            return { ...r, logicSteps: updatedSteps };
          }
          return r;
        });
        return {
          ...prev,
          backend: { ...prev.backend, routes: updatedRoutes }
        };
      });
    }
  };

  const fetchAICodeTemplates = async (filename, code, prompt = '') => {
    try {
      const response = await apiClient.post('/ai/code-templates', { filename, code, prompt });
      return { success: true, templates: response.data.templates };
    } catch (error) {
      console.error('Failed to generate code templates:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  return (
    <EditorContext.Provider value={{
      ir,
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
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
      fetchProjects,
      updateCompiledFile,
      fetchAICodeTemplates,
      createNewProject,
      bindNodesManual,
      unbindNodesManual,
      applySuggestionFuzzy
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
