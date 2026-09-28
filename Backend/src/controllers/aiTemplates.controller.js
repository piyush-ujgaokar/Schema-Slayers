const { GoogleGenerativeAI } = require('@google/generative-ai');

// Standard static fallback suggestion presets if Gemini is inactive or fails
const getFallbackTemplates = (filename, code) => {
  const lowercaseFile = filename.toLowerCase();

  if (lowercaseFile.includes('model.js')) {
    return [
      {
        title: 'Add Email Regex Validation',
        description: 'Enforces standard email format check prior to persisting to MongoDB.',
        targetSnippet: "email: {\n    type: String,\n    required: true,\n    unique: true\n  }",
        replacementSnippet: "email: {\n    type: String,\n    required: true,\n    unique: true,\n    match: [/^\\S+@\\S+\\.\\S+$/, 'Please enter a valid email address']\n  }"
      },
      {
        title: 'Add Soft Delete Field',
        description: 'Appends a deletedAt timestamp to enable logical records disposal.',
        targetSnippet: "timestamps: true\n});",
        replacementSnippet: "timestamps: true\n});\n\n// Soft Delete Schema extension\nUserSchema.add({\n  deletedAt: {\n    type: Date,\n    default: null\n  }\n});"
      },
      {
        title: 'Add Auto-Indexing',
        description: 'Applies index tags to email and name properties for accelerated query retrieval.',
        targetSnippet: "email: {\n    type: String,\n    required: true,\n    unique: true\n  }",
        replacementSnippet: "email: {\n    type: String,\n    required: true,\n    unique: true,\n    index: true\n  }"
      }
    ];
  }

  if (lowercaseFile.includes('controller.js')) {
    return [
      {
        title: 'Add Pagination Support',
        description: 'Parses page and limit query parameters for segmented records fetching.',
        targetSnippet: "const items = await Product.find({});",
        replacementSnippet: "const page = parseInt(req.query.page) || 1;\n    const limit = parseInt(req.query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const items = await Product.find({}).skip(skip).limit(limit);"
      },
      {
        title: 'Add Regex Title Search',
        description: 'Filters list responses based on case-insensitive title search tags.',
        targetSnippet: "const items = await Product.find({});",
        replacementSnippet: "const query = {};\n    if (req.query.q) {\n      query.name = { $regex: req.query.q, $options: 'i' };\n    }\n    const items = await Product.find(query);"
      }
    ];
  }

  if (lowercaseFile.includes('.jsx')) {
    return [
      {
        title: 'Add Confirm Dialog on Submit',
        description: 'Halts submission with a confirmation dialog box for critical operations.',
        targetSnippet: "handleSubmit = (e) => {",
        replacementSnippet: "handleSubmit = (e) => {\n    if (!window.confirm('Are you sure you want to proceed with this submission?')) {\n      return;\n    }"
      },
      {
        title: 'Add Loading Button Status',
        description: 'Disables submit button clicking states while transaction runs.',
        targetSnippet: "type=\"submit\"",
        replacementSnippet: "type=\"submit\" disabled={isSubmitting}"
      }
    ];
  }

  // Generic fallback if extension doesn't match
  return [
    {
      title: 'Inject Developer Header Comment',
      description: 'Places boilerplate header block documentation at the start of source file.',
      targetSnippet: "const ",
      replacementSnippet: "/**\n * Auto-generated Stack Component\n * Custom templates injected dynamically\n */\nconst "
    }
  ];
};

exports.generateTemplates = async (req, res) => {
  const { filename, code, prompt } = req.body;

  if (!filename || !code) {
    return res.status(400).json({ message: 'Filename and code content are required parameters.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('GEMINI_API_KEY not found in env, serving static mock suggestions');
    const suggestions = getFallbackTemplates(filename, code);
    return res.status(200).json({
      message: 'AI templates generated (simulation active)',
      templates: suggestions
    });
  }

// Resilient multi-model cascade to handle Google 503 transient spikes
const CASCADE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

async function callGeminiWithCascade(genAI, contents) {
  let lastError = null;

  for (const modelName of CASCADE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const response = await model.generateContent({ contents });
      const text = response.response.text().trim();
      if (text) {
        return text;
      }
    } catch (err) {
      console.warn(`[AI Template Cascade] Model ${modelName} returned error: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError;
}

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    let systemInstruction = '';
    if (prompt) {
      systemInstruction = `
        You are an expert AI developer coach.
        Analyze the given source code file (named "${filename}"):
        
        CODE:
        \`\`\`
        ${code}
        \`\`\`

        The user has requested the following custom change to this code:
        "${prompt}"
        
        Generate exactly 2-3 specific, useful template suggestions/upgrades that implement this request.
        For each suggestion, identify an EXACT substring (with matching indentation/whitespace) in the code that can be replaced, and provide a replacement snippet that satisfies the request.
        
        CRITICAL RULES:
        - The "targetSnippet" must exist EXACTLY in the provided code, including all newlines and indentation. If it does not match exactly, the replace function will fail!
        - Keep targetSnippet concise (e.g. 1-4 lines containing the target section) and the replacementSnippet must be a complete drop-in replacement.
        - Return ONLY a JSON array of suggestions. No markdown prose.

        Conform strictly to this JSON format:
        [
          {
            "title": "Clear, short title (e.g. Add Email Validation)",
            "description": "Short explanation of why this upgrade helps.",
            "targetSnippet": "Exact code block from the above source file that will be replaced",
            "replacementSnippet": "The new replacement code block containing the changes"
          }
        ]
      `;
    } else {
      systemInstruction = `
        You are an expert AI developer coach.
        Analyze the given source code file (named "${filename}"):
        
        CODE:
        \`\`\`
        ${code}
        \`\`\`

        Generate 3 specific, useful template suggestions/upgrades that can be applied to this code.
        For each suggestion, identify an EXACT substring (with matching indentation/whitespace) in the code that can be replaced, and provide a replacement snippet.
        
        CRITICAL RULES:
        - The "targetSnippet" must exist EXACTLY in the provided code, including all newlines and indentation. If it does not match exactly, the replace function will fail!
        - Keep targetSnippet concise (e.g. 1-4 lines containing the target section) and the replacementSnippet must be a complete drop-in replacement.
        - Return ONLY a JSON array of suggestions. No markdown prose.

        Conform strictly to this JSON format:
        [
          {
            "title": "Clear, short title (e.g. Add Email Validation)",
            "description": "Short explanation of why this upgrade helps.",
            "targetSnippet": "Exact code block from the above source file that will be replaced",
            "replacementSnippet": "The new replacement code block containing the changes"
          }
        ]
      `;
    }

    const contents = [{ role: 'user', parts: [{ text: systemInstruction }] }];
    const text = await callGeminiWithCascade(genAI, contents);
    
    // Parse the output (cleaning up any accidental markdown wrapper tags if returned)
    const jsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
    const suggestions = JSON.parse(jsonStr);

    return res.status(200).json({
      message: 'AI templates generated successfully',
      templates: suggestions
    });
  } catch (error) {
    console.error('Gemini API code-template error after cascade:', error);
    const suggestions = getFallbackTemplates(filename, code);
    return res.status(200).json({
      message: 'AI templates generated via fallback rules (API error)',
      templates: suggestions,
      error: error.message
    });
  }
};
