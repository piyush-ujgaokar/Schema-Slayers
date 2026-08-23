const { GoogleGenerativeAI } = require('@google/generative-ai');

// Standard fallback responses if GEMINI_API_KEY is not defined or fails
const handleFallbackPrompt = (prompt, currentIR) => {
  const normalized = prompt.toLowerCase();
  const ir = JSON.parse(JSON.stringify(currentIR)); // deep copy

  if (normalized.includes('auth') || normalized.includes('register') || normalized.includes('login') || normalized.includes('user')) {
    // 1. Add User database model if not exists
    if (!ir.database.models.some(m => m.name === 'User')) {
      ir.database.models.push({
        id: 'model_user',
        name: 'User',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'email', type: 'String', required: true, unique: true },
          { name: 'password', type: 'String', required: true }
        ]
      });
    }

    // 2. Add Register and Login endpoints if not exists
    if (!ir.backend.routes.some(r => r.path === '/api/register')) {
      ir.backend.routes.push({
        id: 'route_register',
        path: '/api/register',
        method: 'POST',
        authRequired: false,
        logicSteps: [
          { type: 'validate' },
          { type: 'hash_password', field: 'password' },
          { type: 'db_create', model: 'User' }
        ]
      });
    }
    if (!ir.backend.routes.some(r => r.path === '/api/login')) {
      ir.backend.routes.push({
        id: 'route_login',
        path: '/api/login',
        method: 'POST',
        authRequired: false,
        logicSteps: [
          { type: 'validate' },
          { type: 'db_query', model: 'User' },
          { type: 'generate_jwt' }
        ]
      });
    }

    // 3. Add Frontend Screens
    if (!ir.frontend.pages.some(p => p.id === 'page_register')) {
      ir.frontend.pages.push({
        id: 'page_register',
        title: 'User Register',
        path: '/register',
        components: [{
          id: 'comp_register_form',
          type: 'Form',
          title: 'Register',
          fields: [
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'Email' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' }
          ],
          submitButton: { text: 'Register', routeId: 'route_register', onSuccess: { action: 'redirect', path: '/login' } }
        }]
      });
    }

    if (!ir.frontend.pages.some(p => p.id === 'page_login')) {
      ir.frontend.pages.push({
        id: 'page_login',
        title: 'User Login',
        path: '/login',
        components: [{
          id: 'comp_login_form',
          type: 'Form',
          title: 'Sign In',
          fields: [
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Email' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' }
          ],
          submitButton: { text: 'Sign In', routeId: 'route_login', onSuccess: { action: 'redirect', path: '/dashboard' } }
        }]
      });
    }
  } else if (normalized.includes('product') || normalized.includes('ecommerce') || normalized.includes('shop') || normalized.includes('crud')) {
    // 1. Add Product database model
    if (!ir.database.models.some(m => m.name === 'Product')) {
      ir.database.models.push({
        id: 'model_product',
        name: 'Product',
        fields: [
          { name: 'name', type: 'String', required: true },
          { name: 'price', type: 'Number', required: true },
          { name: 'description', type: 'String', required: false }
        ]
      });
    }

    // 2. Add GET and POST Product routes
    if (!ir.backend.routes.some(r => r.path === '/api/products' && r.method === 'GET')) {
      ir.backend.routes.push({
        id: 'route_get_products',
        path: '/api/products',
        method: 'GET',
        authRequired: false,
        logicSteps: [{ type: 'db_query', model: 'Product' }]
      });
    }
    if (!ir.backend.routes.some(r => r.path === '/api/products' && r.method === 'POST')) {
      ir.backend.routes.push({
        id: 'route_create_product',
        path: '/api/products',
        method: 'POST',
        authRequired: true,
        logicSteps: [
          { type: 'validate' },
          { type: 'db_create', model: 'Product' }
        ]
      });
    }

    // 3. Add Frontend Screens
    if (!ir.frontend.pages.some(p => p.id === 'page_products_list')) {
      ir.frontend.pages.push({
        id: 'page_products_list',
        title: 'Product Catalog',
        path: '/products',
        components: [{
          id: 'comp_product_list',
          type: 'List',
          title: 'Products List',
          dataSource: 'route_get_products'
        }]
      });
    }

    if (!ir.frontend.pages.some(p => p.id === 'page_add_product')) {
      ir.frontend.pages.push({
        id: 'page_add_product',
        title: 'Add New Product',
        path: '/products/new',
        components: [{
          id: 'comp_product_form',
          type: 'Form',
          title: 'New Product',
          fields: [
            { name: 'name', label: 'Product Name', type: 'text', placeholder: 'Enter product name' },
            { name: 'price', label: 'Price ($)', type: 'number', placeholder: '99.99' },
            { name: 'description', label: 'Description', type: 'text', placeholder: 'Enter details' }
          ],
          submitButton: { text: 'Save Product', routeId: 'route_create_product', onSuccess: { action: 'redirect', path: '/products' } }
        }]
      });
    }
  }

  return ir;
};

exports.processPrompt = async (req, res) => {
  const { prompt, ir } = req.body;
  if (!prompt || !ir) {
    return res.status(400).json({ message: 'Prompt and current IR structure are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('GEMINI_API_KEY not found in env, executing intelligent fallback rule engine');
    const updatedIR = handleFallbackPrompt(prompt, ir);
    return res.status(200).json({
      message: 'AI operation simulated successfully (fallback active)',
      ir: updatedIR
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemInstruction = `
      You are an expert full-stack web application architect.
      You will be given a JSON representing the Application's IR (Intermediate Representation) which consists of:
      1. database: { models: [ { id, name, fields: [ { name, type, required, unique } ] } ] }
      2. backend: { routes: [ { id, path, method, authRequired, logicSteps: [ { type, model } ] } ] }
      3. frontend: { pages: [ { id, title, path, components: [ { id, type, title, fields: [ { name, label, type, placeholder } ], submitButton: { text, routeId, onSuccess: { action, path } } } ] } ] }

      Your job is to modify this JSON based on the user's natural language prompt.
      Maintain correct relationships:
      - Forms on the frontend page submit to backend routes using a submitButton action that references the correct routeId.
      - Backend routes perform database actions referencing database model names.
      - Ensure database model ids start with "model_", route ids start with "route_", page ids start with "page_", and component ids start with "comp_". Use unique timestamps or slugs to generate these IDs.
      - Database field types are strictly limited to 'String', 'Number', 'Boolean', and 'Date'.
      - Keep existing models, routes, and pages intact unless the user explicitly asks to edit or delete them.

      CRITICAL: You must return ONLY the updated JSON schema representing the IR.
      Do not write any markdown codeblock tags (like \`\`\`json) and do not provide any explanation or prose. Output only raw JSON.
    `;

    const chatInput = `
      Current Application IR JSON:
      ${JSON.stringify(ir, null, 2)}

      User Command: "${prompt}"
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction + '\n\n' + chatInput }] }],
    });

    const text = response.response.text().trim();
    console.log("ai response ",text);
    
    // Parse the output (cleaning up any accidental markdown wrapper tags if returned)
    const jsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
    const updatedIR = JSON.parse(jsonStr);

    return res.status(200).json({
      message: 'AI update successful',
      ir: updatedIR
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Graceful fallback on API error
    const updatedIR = handleFallbackPrompt(prompt, ir);
    return res.status(200).json({
      message: 'AI update completed using local fallback rules (Gemini API failed)',
      ir: updatedIR,
      error: error.message
    });
  }
};
