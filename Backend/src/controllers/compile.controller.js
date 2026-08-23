const fs = require('fs');
const path = require('path');

// Helper functions for code generation templates
const generateMongooseModel = (model) => {
  const fieldsStr = model.fields.map(f => {
    let typeStr = f.type;
    if (typeStr === 'String') typeStr = 'String';
    else if (typeStr === 'Number') typeStr = 'Number';
    else if (typeStr === 'Boolean') typeStr = 'Boolean';
    else if (typeStr === 'Date') typeStr = 'Date';

    return `  ${f.name}: {
    type: ${typeStr},
    required: ${f.required ? 'true' : 'false'},
    unique: ${f.unique ? 'true' : 'false'}
  }`;
  }).join(',\n');

  return `const mongoose = require('mongoose');

const ${model.name}Schema = new mongoose.Schema({
${fieldsStr}
}, {
  timestamps: true
});

module.exports = mongoose.model('${model.name}', ${model.name}Schema);
`;
};

const generateExpressController = (route, modelName) => {
  const isPost = route.method === 'POST';
  const isGet = route.method === 'GET';
  const isPut = route.method === 'PUT';
  const isDelete = route.method === 'DELETE';

  let actionCode = '';

  if (isPost) {
    actionCode = `    const entity = new ${modelName}(req.body);
    await entity.save();
    res.status(201).json({ message: '${modelName} created successfully', data: entity });`;
  } else if (isGet) {
    if (route.path.includes('/:id')) {
      actionCode = `    const entity = await ${modelName}.findById(req.params.id);
    if (!entity) return res.status(404).json({ message: '${modelName} not found' });
    res.status(200).json(entity);`;
    } else {
      actionCode = `    const entities = await ${modelName}.find({});
    res.status(200).json(entities);`;
    }
  } else if (isPut) {
    actionCode = `    const entity = await ${modelName}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entity) return res.status(404).json({ message: '${modelName} not found' });
    res.status(200).json({ message: '${modelName} updated successfully', data: entity });`;
  } else if (isDelete) {
    actionCode = `    const entity = await ${modelName}.findByIdAndDelete(req.params.id);
    if (!entity) return res.status(404).json({ message: '${modelName} not found' });
    res.status(200).json({ message: '${modelName} deleted successfully' });`;
  }

  return `const ${modelName} = require('../models/${modelName}');

exports.handleRequest = async (req, res) => {
  try {
${actionCode}
  } catch (error) {
    console.error('Error handling ${route.path}:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
`;
};

const generateExpressRoutes = (routes, models) => {
  let routesCode = `const express = require('express');
const router = express.Router();
`;

  // Add controller imports
  routes.forEach(route => {
    const cleanPath = route.path.replace(/\/:id/g, '').replace(/\/api\//g, '');
    const nameSlug = cleanPath.replace(/\//g, '_');
    routesCode += `const controller_${nameSlug}_${route.method.toLowerCase()} = require('../controllers/${nameSlug}_${route.method.toLowerCase()}.controller');\n`;
  });

  routesCode += `\n`;

  // Attach routes
  routes.forEach(route => {
    const cleanPath = route.path.replace(/\/:id/g, '').replace(/\/api\//g, '');
    const nameSlug = cleanPath.replace(/\//g, '_');
    const routerMethod = route.method.toLowerCase();
    
    // Auth middleware if required
    const middlewareStr = route.authRequired ? 'authMiddleware, ' : '';
    
    routesCode += `router.${routerMethod}('${route.path}', ${middlewareStr}controller_${nameSlug}_${routerMethod}.handleRequest);\n`;
  });

  routesCode += `\nmodule.exports = router;\n`;
  return routesCode;
};

const generateReactPage = (page, routes) => {
  const comp = page.components[0] || {};
  const isForm = comp.type === 'Form';
  
  let jsxCode = '';
  if (isForm) {
    const formFields = comp.fields || [];
    const route = routes.find(r => r.id === comp.submitButton?.routeId) || { path: '/api/items', method: 'POST' };

    jsxCode = `import React from 'react';
import { useForm } from 'react-hook-form';

export default function ${page.id.replace(/[^a-zA-Z]/g, '')}() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('${route.path}', {
        method: '${route.method}',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok) {
        alert('${comp.title || 'Form submitted'} successfully!');
        reset();
      } else {
        alert(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">${comp.title || 'Form'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        ${formFields.map(f => `
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">${f.label}</label>
          <input
            type="${f.type}"
            placeholder="${f.placeholder || ''}"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            {...register('${f.name}', { required: true })}
          />
        </div>`).join('\n        ')}
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition"
        >
          ${comp.submitButton?.text || 'Submit'}
        </button>
      </form>
    </div>
  );
}
`;
  } else {
    // List component fallback
    jsxCode = `import React, { useEffect, useState } from 'react';

export default function ${page.id.replace(/[^a-zA-Z]/g, '')}() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-400">${page.title || 'Overview'}</h2>
      {loading ? (
        <p className="text-center text-slate-400">Loading details...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-slate-400">No items available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 bg-slate-900 border border-slate-700 rounded">
              <pre className="text-xs overflow-auto text-indigo-300">{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
  }

  return jsxCode;
};

exports.compileCode = async (req, res) => {
  try {
    const { ir, existingFiles } = req.body;
    if (!ir) {
      return res.status(400).json({ message: 'Missing IR structure to compile' });
    }

    const files = {};

    // 1. Compile Database Models
    if (ir.database && ir.database.models) {
      ir.database.models.forEach(model => {
        const filepath = `backend/src/models/${model.name}.model.js`;
        let modelCode = generateMongooseModel(model);

        if (existingFiles && existingFiles[filepath]) {
          const oldCode = existingFiles[filepath];
          const schemaRegex = /new\s+mongoose\.Schema\s*\(\s*\{/i;
          const match = oldCode.match(schemaRegex);
          
          if (match) {
            const startBraceIndex = oldCode.indexOf('{', match.index);
            if (startBraceIndex !== -1) {
              let braceCount = 1;
              let endBraceIndex = -1;
              for (let i = startBraceIndex + 1; i < oldCode.length; i++) {
                if (oldCode[i] === '{') braceCount++;
                else if (oldCode[i] === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    endBraceIndex = i;
                    break;
                  }
                }
              }
              
              if (endBraceIndex !== -1) {
                const fieldsStr = model.fields.map(f => {
                  let typeStr = f.type;
                  return `  ${f.name}: {
    type: ${typeStr},
    required: ${f.required ? 'true' : 'false'},
    unique: ${f.unique ? 'true' : 'false'}
  }`;
                }).join(',\n');
                
                modelCode = oldCode.substring(0, startBraceIndex + 1) + '\n' + fieldsStr + '\n' + oldCode.substring(endBraceIndex);
              }
            }
          }
        }
        files[filepath] = modelCode;
      });
    }

    // 2. Compile Backend Controllers & Routes
    if (ir.backend && ir.backend.routes) {
      ir.backend.routes.forEach(route => {
        const modelStep = route.logicSteps?.find(s => s.type === 'db_create' || s.type === 'db_query');
        const modelName = modelStep ? modelStep.model : (ir.database?.models?.[0]?.name || 'Item');
        
        const cleanPath = route.path.replace(/\/:id/g, '').replace(/\/api\//g, '');
        const nameSlug = cleanPath.replace(/\//g, '_');
        const filename = `backend/src/controllers/${nameSlug}_${route.method.toLowerCase()}.controller.js`;
        
        // Preserve existing controller code if it exists to keep custom edits
        if (existingFiles && existingFiles[filename]) {
          files[filename] = existingFiles[filename];
        } else {
          files[filename] = generateExpressController(route, modelName);
        }
      });

      // Unified router
      files['backend/src/routes/app.routes.js'] = generateExpressRoutes(ir.backend.routes, ir.database?.models || []);
    }

    // 3. Compile Frontend Pages
    if (ir.frontend && ir.frontend.pages) {
      ir.frontend.pages.forEach(page => {
        const filepath = `frontend/src/pages/${page.id}.jsx`;
        let pageCode = generateReactPage(page, ir.backend?.routes || []);

        if (existingFiles && existingFiles[filepath]) {
          const oldCode = existingFiles[filepath];
          const formRegex = /<form[\s\S]*?>([\s\S]*?)<\/form>/i;
          const formMatch = oldCode.match(formRegex);
          
          if (formMatch) {
            const innerCode = formMatch[1];
            const comp = page.components[0] || {};
            const formFields = comp.fields || [];
            const newFieldsJSX = formFields.map(f => `
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">${f.label}</label>
          <input
            type="${f.type}"
            placeholder="${f.placeholder || ''}"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            {...register('${f.name}', { required: true })}
          />
        </div>`).join('\n        ');
            
            const newButtonJSX = `\n        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition"
        >
          ${comp.submitButton?.text || 'Submit'}
        </button>`;
            
            const newFormContents = '\n        ' + newFieldsJSX + '\n        ' + newButtonJSX + '\n      ';
            pageCode = oldCode.replace(innerCode, newFormContents);
          }
        }
        files[filepath] = pageCode;
      });
    }

    return res.status(200).json({
      message: 'Compilation complete',
      files
    });
  } catch (error) {
    console.error('Compilation error:', error);
    return res.status(500).json({ message: 'Compilation failed', error: error.message });
  }
};
