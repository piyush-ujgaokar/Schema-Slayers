import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../application/context/AuthContext';
import { Box, Code, Layers, Zap, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans selection:bg-brand-primary/10">
      {/* Top Navigation Header */}
      <header className="bg-brand-card/85 backdrop-blur-md border-b border-brand-border/60 sticky top-0 z-50 transition px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-md shadow-brand-primary/10">
            <Box size={22} className="text-brand-bg" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-brand-text">SchemaSlayers</h1>
            <span className="text-[10px] text-brand-muted font-extrabold uppercase tracking-widest">MERN Canvas AI</span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-bold text-brand-text/80 hover:text-brand-primary transition">Features</a>
          <a href="#mockup" className="text-sm font-bold text-brand-text/80 hover:text-brand-primary transition">Workspace</a>
          <a href="#why-us" className="text-sm font-bold text-brand-text/80 hover:text-brand-primary transition">Why SchemaSlayers</a>
        </nav>

        {/* Action Button */}
        <div>
          <button
            onClick={handleLogin}
            className="px-4 py-2 border border-brand-border hover:bg-brand-border/60 text-brand-text text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            {user ? 'Launch Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 md:py-28 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Banner Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/5 text-brand-primary text-xs font-bold rounded-full mb-6 border border-brand-primary/10 animate-pulse">
          <Zap size={12} />
          <span>Powered by Gemini 3.6-Flash API</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-brand-text max-w-4xl leading-tight">
          Build MERN Stack Apps <br />
          <span className="text-brand-primary bg-gradient-to-r from-brand-primary via-brand-text to-brand-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-flow">
            Visually with AI
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-brand-muted max-w-3xl leading-relaxed font-medium">
          SchemaSlayers is a visual drag-and-drop builder equipped with real-time bidirectional code syncing. Design database models, Express routes, and screen page flows, then let AI write and edit the boilerplate code automatically.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <button
            onClick={handleCTA}
            className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-bg text-base font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10 transition hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{user ? 'Go to Workspace' : 'Get Started for Free'}</span>
            <ArrowRight size={18} />
          </button>
          
          <a
            href="#mockup"
            className="w-full sm:w-auto px-8 py-4 border border-brand-border hover:bg-brand-card text-brand-text text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition hover:-translate-y-0.5 cursor-pointer"
          >
            <span>See Workspace</span>
            <ChevronRight size={18} />
          </a>
        </div>
      </section>

      {/* Workspace Mockup Showcase */}
      <section id="mockup" className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="bg-brand-card border border-brand-border rounded-2xl shadow-xl overflow-hidden p-3 md:p-4 hover:shadow-2xl transition duration-500">
          {/* Mockup Topbar */}
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full inline-block"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full inline-block"></span>
              <span className="text-xs text-brand-muted font-bold ml-2">SchemaSlayers Workspace</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-bg px-3 py-1 rounded-lg border border-brand-border/40 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
              Live App Sandbox
            </div>
          </div>

          {/* Mockup Workspace Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[350px] md:h-[450px]">
            {/* Left sidebar Mock */}
            <div className="lg:col-span-3 bg-brand-bg rounded-xl border border-brand-border/60 p-3 flex flex-col gap-2.5 overflow-hidden">
              <span className="text-[10px] font-extrabold uppercase text-brand-muted tracking-wider">Workspace Explorer</span>
              <div className="space-y-1.5 text-xs font-bold text-brand-text/70">
                <div className="p-2 bg-brand-card border border-brand-border rounded-lg flex items-center gap-2">
                  <Box size={14} className="text-brand-primary" />
                  <span>models/Product.model.js</span>
                </div>
                <div className="p-2 hover:bg-brand-card/50 rounded-lg flex items-center gap-2 pl-4">
                  <Code size={14} className="text-brand-muted" />
                  <span>controllers/product.js</span>
                </div>
                <div className="p-2 hover:bg-brand-card/50 rounded-lg flex items-center gap-2 pl-4">
                  <Layers size={14} className="text-brand-muted" />
                  <span>pages/NewProduct.jsx</span>
                </div>
              </div>
            </div>

            {/* Center Canvas Mock */}
            <div className="lg:col-span-6 bg-brand-bg rounded-xl border border-brand-border/60 p-4 relative overflow-hidden flex flex-col items-center justify-center group bg-[radial-gradient(#8C8A82_1px,transparent_1px)] [background-size:16px_16px] [background-opacity:0.2]">
              {/* Database Node Mock */}
              <div className="bg-brand-card border border-brand-border rounded-xl shadow-md p-3.5 w-52 absolute left-4 top-8 hover:scale-102 transition">
                <div className="flex items-center justify-between border-b border-brand-border/50 pb-2 mb-2 bg-brand-primary/5 -mx-3.5 -mt-3.5 p-2 rounded-t-xl">
                  <span className="text-xs font-bold flex items-center gap-1.5"><Box size={14} /> Product Schema</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded">Mongoose</span>
                </div>
                <div className="space-y-1 text-[11px] font-bold text-brand-text/80">
                  <div className="flex justify-between"><span>name</span> <span className="text-blue-500 font-normal">String</span></div>
                  <div className="flex justify-between"><span>price</span> <span className="text-amber-500 font-normal">Number</span></div>
                  <div className="flex justify-between"><span>deletedAt</span> <span className="text-teal-500 font-normal">Date</span></div>
                </div>
              </div>

              {/* Route Node Mock */}
              <div className="bg-brand-card border border-brand-border rounded-xl shadow-md p-3.5 w-48 absolute right-4 bottom-8 hover:scale-102 transition">
                <div className="flex items-center justify-between border-b border-brand-border/50 pb-2 mb-2 bg-brand-primary/5 -mx-3.5 -mt-3.5 p-2 rounded-t-xl">
                  <span className="text-xs font-bold flex items-center gap-1.5"><Zap size={14} className="text-purple-500" /> POST /api/products</span>
                  <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded">API</span>
                </div>
                <div className="text-[10px] font-bold text-brand-muted">
                  <span>Logic Steps:</span>
                  <div className="mt-1 bg-brand-bg p-1 rounded border border-brand-border/40 text-purple-600">db_create: Product</div>
                </div>
              </div>

              {/* SVG connection path */}
              <svg className="w-full h-full absolute inset-0 pointer-events-none">
                <path
                  d="M 230 110 C 300 110, 200 350, 310 350"
                  fill="none"
                  stroke="#3f51b5"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                  className="animate-[dash_2s_linear_infinite]"
                />
              </svg>
            </div>

            {/* Right Suggestions Mock */}
            <div className="lg:col-span-3 bg-brand-bg rounded-xl border border-brand-border/60 p-3 flex flex-col gap-2.5 overflow-hidden">
              <span className="text-[10px] font-extrabold uppercase text-brand-muted tracking-wider">AI Suggestions</span>
              <div className="p-3 bg-brand-card border border-teal-200 rounded-lg shadow-sm hover:scale-102 transition flex flex-col gap-1 text-[11px] font-bold">
                <div className="text-teal-600 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  <span>Soft Delete Field</span>
                </div>
                <p className="text-brand-muted text-[10px]">Add deletedAt field and pre-find middleware</p>
                <div className="mt-2 text-right">
                  <span className="px-2 py-0.5 bg-brand-primary text-brand-bg text-[9px] font-bold rounded">Apply Suggestion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="bg-brand-card/50 border-y border-brand-border/60 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Everything you need to ship MERN stacks</h2>
            <p className="mt-4 text-brand-muted font-medium">SchemaSlayers handles Mongoose schemas, controllers, routing, page components, history collections, and live code compilation in a unified workspace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-brand-card border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-12 w-12 bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-extrabold">Drag-and-Drop Canvas</h3>
              <p className="mt-3 text-brand-muted text-sm leading-relaxed font-medium">
                Arrange database model schemas, link frontend templates to API routes, and establish logic dependencies manually using standard React Flow lines or dynamically with NLP prompts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-brand-card border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-12 w-12 bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <Code size={24} />
              </div>
              <h3 className="text-lg font-extrabold">Bidirectional Code Sync</h3>
              <p className="mt-3 text-brand-muted text-sm leading-relaxed font-medium">
                Write, inspect, or modify generated JavaScript code directly in the code editor panel. The visual canvas nodes and properties parser sync immediately to keep blocks in alignment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-brand-card border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-12 w-12 bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-extrabold">Gemini AI Templates</h3>
              <p className="mt-3 text-brand-muted text-sm leading-relaxed font-medium">
                Get dynamic, context-aware suggestions directly from Google Gemini based on your active code files. Apply regex validation, search indices, and security layers in a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aim & Helpfulness Section */}
      <section id="why-us" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">What type of helping is this?</h2>
            <p className="mt-5 text-brand-muted font-medium leading-relaxed">
              For developers, architects, and hackathon teams, getting a MERN stack boilerplates correctly configured (with Express, CORS, MongoDB Atlas, and React routers) takes hours. 
            </p>
            <p className="mt-4 text-brand-muted font-medium leading-relaxed">
              SchemaSlayers acts as your copilot: design the data models and page links visually, and our backend compiler renders clean, production-ready directories immediately. No typescript configurations, no dependency crashes, just direct MERN templates.
            </p>
            
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-brand-primary" />
                <span className="text-sm font-bold text-brand-text/90">Wipes code boilerplate creation times from hours to seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-brand-primary" />
                <span className="text-sm font-bold text-brand-text/90">Maintains absolute synchronization between graphics and code</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-brand-primary" />
                <span className="text-sm font-bold text-brand-text/90">Automatic MongoDB background saves and local reload state caches</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between h-[300px]">
            <div className="absolute right-0 top-0 w-36 h-36 bg-brand-primary/5 rounded-full filter blur-xl"></div>
            <div>
              <span className="text-xs text-brand-primary font-bold uppercase tracking-wider">Our Aim</span>
              <h3 className="text-2xl font-black mt-2 text-brand-text">Empower MERN stack developers to slayer schemas and launch products in minutes.</h3>
            </div>
            <div className="p-4 bg-brand-bg border border-brand-border/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
                <span className="text-xs font-bold text-brand-muted">MERN Stack sandbox compiler online</span>
              </div>
              <button
                onClick={handleCTA}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-bg text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Launch Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-auto bg-brand-card border-t border-brand-border/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Box size={20} className="text-brand-primary" />
            <span className="text-sm font-black text-brand-text">SchemaSlayers</span>
            <span className="text-[10px] text-brand-muted font-bold">© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-8 text-xs font-bold text-brand-muted">
            <a href="#features" className="hover:text-brand-primary transition">Features</a>
            <a href="#mockup" className="hover:text-brand-primary transition">Workspace</a>
            <a href="#why-us" className="hover:text-brand-primary transition">Our Aim</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
