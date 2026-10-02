import React, { useState } from 'react';
import { AbcLogo } from './AbcLogo';
import feature1Img from '../assets/feature1.png';
import feature2Img from '../assets/feature2.png';
import { 
  Search, 
  ChevronDown, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  Sparkles,
  Layers,
  Zap,
  Globe,
  Users,
  BarChart3,
  Columns,
  Code2,
  Terminal,
  Paperclip,
  CheckSquare,
  Bookmark,
  Calendar,
  Sliders,
  Plus,
  Table,
  Target,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  TrendingUp,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const AbcLandingPage = ({ onNavigateToLogin, onOpenGoogle, onOpenPlans }) => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onNavigateToLogin(email.trim());
    } else {
      onNavigateToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172B4D] font-sans antialiased selection:bg-[#DEEBFF] selection:text-[#0747A6] flex flex-col justify-between">
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <header className="h-16 border-b border-[#DFE1E6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        {/* Left Brand & Menu Links */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <AbcLogo size="md" />
            <span className="font-extrabold text-[22px] tracking-tight text-[#172B4D]">Abc</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-[14px] font-semibold text-[#42526E]">
            <a href="#features-section" className="flex items-center gap-1 hover:text-[#0052CC] transition-colors cursor-pointer py-2">
              <span>Features</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#plan-section" className="flex items-center gap-1 hover:text-[#0052CC] transition-colors cursor-pointer py-2">
              <span>Solutions</span>
              <ChevronDown className="w-4 h-4" />
            </a>
            <a href="#guides" onClick={(e) => e.preventDefault()} className="hover:text-[#0052CC] transition-colors py-2">
              Guides
            </a>
            <button className="flex items-center gap-1 hover:text-[#0052CC] transition-colors cursor-pointer py-2">
              <span>Templates</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button onClick={onOpenPlans} className="hover:text-[#0052CC] transition-colors cursor-pointer py-2">
              Pricing
            </button>
          </nav>
        </div>

        {/* Right Search, Sign in, Get it free */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 text-[#42526E] transition-colors cursor-pointer hidden sm:block">
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigateToLogin()}
            className="text-[14px] font-semibold text-[#172B4D] hover:text-[#0052CC] px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            Sign in
          </button>

          <button
            onClick={() => onNavigateToLogin(email)}
            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white text-[14px] font-bold rounded-[3px] transition-colors shadow-xs cursor-pointer"
          >
            Get it free
          </button>
        </div>
      </header>

      {/* 2. MAIN PAGE FLOW */}
      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-12 sm:pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start mb-16">
            
            <div className="lg:col-span-7 space-y-6 pt-2">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-[#172B4D] tracking-tight leading-[1.12]">
                Turn plans into agent-ready tasks
              </h1>
              <p className="text-lg sm:text-xl text-[#42526E] max-w-xl leading-relaxed font-normal">
                Then build. Orchestrate work across your team and agents, with complete context.
              </p>
            </div>

            <div className="lg:col-span-5 max-w-md w-full lg:ml-auto">
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#172B4D] mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 text-[14px] text-[#172B4D] border border-[#DFE1E6] rounded-[4px] bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all placeholder:text-gray-400"
                  />
                </div>

                <p className="text-[11px] text-[#5E6C84] leading-tight">
                  Use a work email to find teammates and get access to Rovo AI
                </p>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white font-bold text-[14px] rounded-[4px] transition-colors shadow-sm cursor-pointer"
                >
                  Sign up
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-[#DFE1E6]" />
                  <span className="px-3 text-[12px] text-[#5E6C84]">Or continue with</span>
                  <div className="flex-1 border-t border-[#DFE1E6]" />
                </div>

                <button
                  type="button"
                  onClick={onOpenGoogle}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 border border-[#DFE1E6] text-[#172B4D] font-bold text-[14px] rounded-[4px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span>Google</span>
                </button>
              </form>
            </div>

          </div>

          {/* Product Showcase Board Preview */}
          <div 
            onClick={() => onNavigateToLogin()}
            className="relative max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-[#1D2125] text-slate-100 cursor-pointer group transition-all duration-300 hover:shadow-indigo-500/10"
          >
            <div className="bg-[#161A1D] px-4 py-2.5 border-b border-[#282E33] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#E34935]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#E2B203]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#22A06B]/80" />
                </div>
                <div className="flex items-center gap-1.5 ml-2 font-bold text-white text-xs">
                  <AbcLogo size="sm" />
                  <span>Abc</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#22272B] px-3 py-1 rounded text-slate-400 text-xs w-60">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </div>

              <div className="text-[11px] text-blue-400 font-semibold group-hover:underline">
                Click to launch interactive workspace ↗
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Spaces</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-sm shadow-sm">
                      🚀
                    </div>
                    <h3 className="text-xl font-bold text-white">Feature Launch</h3>
                    <span className="text-slate-500">•••</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <img className="w-6 h-6 rounded-full ring-2 ring-[#1D2125]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <img className="w-6 h-6 rounded-full ring-2 ring-[#1D2125]" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-[#1D2125]">+3</div>
                    </div>
                    <button className="px-2.5 py-1 text-xs font-semibold bg-[#282E33] hover:bg-[#333C43] rounded text-slate-300">
                      Filter ⌵
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 border-b border-[#282E33] pb-2 text-xs font-medium text-slate-400">
                <span className="hover:text-white cursor-pointer">Summary</span>
                <span className="text-blue-400 font-semibold border-b-2 border-blue-400 pb-2 cursor-pointer flex items-center gap-1">
                  <Columns className="w-3.5 h-3.5" /> Board
                </span>
                <span className="hover:text-white cursor-pointer">Timeline</span>
                <span className="hover:text-white cursor-pointer">Forms</span>
                <span className="hover:text-white cursor-pointer">Approvals</span>
                <span className="hover:text-white cursor-pointer">Attachments</span>
                <span className="hover:text-white cursor-pointer">+</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#161A1D] p-3 rounded border border-[#282E33] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1">
                    <span>TO DO (3)</span>
                  </div>
                  <div className="bg-[#22272B] p-2.5 rounded text-xs space-y-1.5 shadow-sm border border-[#282E33]">
                    <p className="font-medium text-slate-200">Rovo AI prompt automation agent</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="text-blue-400 font-bold">KAN-12</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">High</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#161A1D] p-3 rounded border border-[#282E33] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1">
                    <span>IN PROGRESS (4)</span>
                  </div>
                  <div className="bg-[#22272B] p-2.5 rounded text-xs space-y-1.5 shadow-sm border border-[#282E33]">
                    <p className="font-medium text-slate-200">Orchestrate task context sync</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="text-blue-400 font-bold">KAN-14</span>
                      <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">Urgent</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#161A1D] p-3 rounded border border-[#282E33] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1">
                    <span>IN REVIEW (1)</span>
                  </div>
                  <div className="bg-[#22272B] p-2.5 rounded text-xs space-y-1.5 shadow-sm border border-[#282E33]">
                    <p className="font-medium text-slate-200">Design system token handoff</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="text-blue-400 font-bold">KAN-15</span>
                      <span className="px-1.5 py-0.2 rounded bg-green-500/20 text-green-300">Low</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#161A1D] p-3 rounded border border-[#282E33] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-1">
                    <span>DONE (2)</span>
                  </div>
                  <div className="bg-[#22272B] p-2.5 rounded text-xs space-y-1.5 shadow-sm border border-[#282E33] opacity-80">
                    <p className="font-medium text-slate-300 line-through">Security audit approval</p>
                    <div className="flex justify-between items-center text-[10px] text-emerald-400">
                      <span>KAN-10</span>
                      <span>✓ Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* NEW SECTION 2: "Get to know Abc's project management features" (IMAGE 1) */}
        {/* ========================================================================= */}
        <section id="features-section" className="py-20 px-6 sm:px-10 bg-white border-t border-[#DFE1E6]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#172B4D] tracking-tight leading-tight">
                Get to know Abc's project management features
              </h2>
              <p className="text-base sm:text-lg text-[#42526E] leading-relaxed font-normal">
                Built to help every team go from big idea to launch faster.
              </p>
              <button
                onClick={() => onNavigateToLogin()}
                className="px-6 py-3 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white text-sm font-bold rounded-full transition-colors shadow-sm cursor-pointer"
              >
                Try Abc free
              </button>
            </div>

            {/* Right Column: Actual Feature Screenshot */}
            <div className="lg:col-span-7 relative">
              {/* Feature 1 Screenshot */}
              <div className="relative group cursor-pointer" onClick={() => onNavigateToLogin()}>
                <div className="absolute -inset-1 bg-gradient-to-r from-[#36B37E] to-[#0052CC] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <img
                  src={feature1Img}
                  alt="Abc project management features - List view with tasks, priorities, and team members"
                  className="relative w-full rounded-2xl shadow-2xl border border-gray-200 group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-[#0052CC] text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Launch workspace ↗
                </div>
                
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* NEW SECTION 3: BLUE BANNER "PLAN - Kick-off your next project" (IMAGE 2) */}
        {/* ========================================================================= */}
        <section id="plan-section" className="py-16 px-6 sm:px-10 bg-white">
          <div className="max-w-7xl mx-auto rounded-3xl bg-[#0052CC] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden">
            
            {/* Background Decorative Sparkles */}
            <div className="absolute top-6 right-10 opacity-20 pointer-events-none">
              <Sparkles className="w-32 h-32 text-white" />
            </div>

            {/* Banner Header */}
            <div className="space-y-4 max-w-3xl mb-12 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-black text-lg">彡</span>
                <span className="font-mono text-xs uppercase tracking-widest font-extrabold text-blue-200">
                  PLAN
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Kick-off your next project
              </h2>
              <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed">
                Prioritize high-impact work, break down big projects into clear tasks, and cultivate ownership.
              </p>
            </div>

            {/* Feature 2 Screenshot */}
            <div className="relative z-10 group cursor-pointer" onClick={() => onNavigateToLogin()}>
              <div className="absolute -inset-1 bg-white/10 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <img
                src={feature2Img}
                alt="Abc plan section - kick-off your next project with goals and AI task breakdown"
                className="relative w-full rounded-2xl shadow-2xl group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white text-[#0052CC] text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Start planning ↗
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: DARK THEME "Abc for the AI era > in your CLI" */}
        {/* ========================================================================= */}
        <section className="bg-[#0B0D0E] text-white py-20 px-6 sm:px-10 border-t border-b border-slate-800/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2428_1px,transparent_1px),linear-gradient(to_bottom,#1f2428_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          <div className="max-w-6xl mx-auto space-y-14 relative z-10">
            
            <div className="inline-block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-amber-500 rounded-xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative bg-[#161A1D] border border-slate-700/80 rounded-xl px-8 py-6 shadow-2xl space-y-2">
                <p className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-white">
                  Abc for the AI era
                </p>
                <p className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-slate-200">
                  <span className="text-slate-400">&gt; in your </span>
                  <span className="text-[#FACC15]">CLI</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                WORKS WITH
              </span>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161A1D] border border-slate-800 rounded-md">
                  <span className="text-amber-500 font-black text-sm">✹</span>
                  <span>Claude</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161A1D] border border-slate-800 rounded-md">
                  <span className="text-cyan-400 font-bold">◇</span>
                  <span>Cursor</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161A1D] border border-slate-800 rounded-md">
                  <span className="text-emerald-400 font-bold">☺</span>
                  <span>Codex</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161A1D] border border-slate-800 rounded-md">
                  <span className="text-purple-400 font-bold">🐙</span>
                  <span>GitHub Copilot</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161A1D] border border-slate-800 rounded-md">
                  <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                  <span>Any MCP agent</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-xl font-bold">
                  @
                </div>
                <h3 className="text-lg font-bold text-white">
                  Embed agents in your existing workflow
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Assign work to your favorite coding agent from Abc or bring context to your AI stack with our MCP and CLI.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-lg font-bold">
                  &lt;/&gt;
                </div>
                <h3 className="text-lg font-bold text-white">
                  Teamwork Graph CLI
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Give AI coding agents terminal access to your Teamwork Graph so they can move from context to action.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-xl font-bold">
                  ❖
                </div>
                <h3 className="text-lg font-bold text-white">
                  Scale AI responsibly
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Stay in control with an audit trail that keeps teams and agents moving faster and in the same direction.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: LIGHT THEME "Every team works better in Abc" */}
        {/* ========================================================================= */}
        <section className="bg-white text-[#172B4D] py-20 px-6 sm:px-10">
          <div className="max-w-6xl mx-auto space-y-10">
            
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#172B4D] tracking-tight">
                Every team works better in Abc
              </h2>
              <p className="text-base sm:text-lg text-[#42526E] leading-relaxed">
                Bring design, marketing, HR, operations, and engineering into one shared place to plan work, track progress, and move faster together.
              </p>

              <button
                onClick={() => onNavigateToLogin()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#172B4D] hover:bg-[#172B4D] hover:text-white text-xs font-bold transition-colors cursor-pointer shadow-xs mt-2"
              >
                <span>Get started for free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* "Summer campaign" Multi-Team Kanban Showcase */}
            <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-xl overflow-hidden text-[#172B4D]">
              
              <div className="h-12 border-b border-[#DFE1E6] px-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-0.5 h-0.5 bg-gray-500 rounded-full" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs">
                    <AbcLogo size="sm" />
                    <span>Abc</span>
                  </div>
                  <div className="relative ml-2 hidden sm:block">
                    <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="pl-7 pr-3 py-0.5 text-xs border border-gray-200 rounded w-36 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToLogin()}
                    className="px-2.5 py-1 bg-[#0052CC] text-white font-semibold text-xs rounded hover:bg-[#0065FF]"
                  >
                    + Create
                  </button>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded text-xs font-medium">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Ask Rovo</span>
                  </div>
                  <img
                    className="w-6 h-6 rounded-full"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="User"
                  />
                </div>
              </div>

              <div className="p-5 bg-[#FAFBFC] border-b border-[#DFE1E6]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#172B4D] mb-3">
                  <div className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center text-xs">
                    🌱
                  </div>
                  <span>Summer campaign</span>
                </div>

                <div className="flex items-center gap-6 text-xs font-medium text-[#42526E]">
                  <span>Summary</span>
                  <span className="text-[#0052CC] font-bold border-b-2 border-[#0052CC] pb-1 flex items-center gap-1">
                    <Columns className="w-3 h-3" /> Board
                  </span>
                  <span>List view</span>
                  <span>Timeline</span>
                  <span>Capacity</span>
                  <span>+</span>
                </div>
              </div>

              <div className="p-5 bg-[#F4F5F7] overflow-x-auto">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 min-w-[800px] items-start relative">
                  
                  {/* Column 1: To do */}
                  <div className="bg-[#EBECF0] rounded p-2.5 space-y-2">
                    <span className="text-[11px] font-bold text-[#5E6C84] uppercase">To do 1</span>
                    <button className="w-full py-1.5 text-xs text-[#0052CC] bg-white hover:bg-gray-50 border border-gray-200 rounded font-semibold text-left px-2">
                      + Create
                    </button>
                    
                    <div className="bg-white p-2.5 rounded shadow-xs border border-gray-200 text-xs space-y-2 relative">
                      <p className="text-gray-400">What needs to be done?</p>
                      <div className="flex justify-between items-center text-gray-400">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <div className="w-4 h-4 rounded-full bg-gray-200" />
                      </div>
                      
                      <div className="absolute -bottom-3 -right-2 flex items-center gap-1 bg-[#6554C0] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md animate-bounce">
                        <span className="w-3 h-3 rounded-full bg-white/20 text-center text-[8px]">D</span>
                        <span>Design</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In design */}
                  <div className="bg-[#EBECF0] rounded p-2.5 space-y-2">
                    <span className="text-[11px] font-bold text-[#5E6C84] uppercase">In design 3</span>
                    
                    <div className="bg-white p-2.5 rounded shadow-xs border border-gray-200 text-xs space-y-2">
                      <p className="font-semibold text-[#172B4D]">Design hero banner variants for campaign landing page</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="font-mono">BSC-385</span>
                        <div className="flex -space-x-1">
                          <img className="w-4 h-4 rounded-full" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                          <img className="w-4 h-4 rounded-full" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded shadow-xs border border-gray-200 text-xs space-y-2">
                      <p className="font-semibold text-[#172B4D]">Draft launch-day social copy</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="font-mono">BSC-356</span>
                        <span className="font-bold text-blue-600">≡</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: In development */}
                  <div className="bg-[#EBECF0] rounded p-2.5 space-y-2">
                    <span className="text-[11px] font-bold text-[#5E6C84] uppercase">In development 4</span>

                    <div className="bg-white p-2.5 rounded shadow-xs border border-gray-200 text-xs space-y-2">
                      <p className="font-semibold text-[#172B4D]">Implement UTM parameter routing for campaign CTAs</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="font-mono">BSC-454</span>
                        <img className="w-4 h-4 rounded-full" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded shadow-xs border border-blue-400 text-xs space-y-2 relative">
                      <p className="font-semibold text-[#172B4D]">Build animated product embed component</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="font-mono">BSC-852</span>
                        <span className="text-amber-500 font-bold">✹</span>
                      </div>

                      <div className="absolute -top-3 -right-2 flex items-center gap-1 bg-[#0052CC] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                        <span className="text-amber-400 font-black">✹</span>
                        <span>Claude Agent</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: GTM Launch */}
                  <div className="bg-[#EBECF0] rounded p-2.5 space-y-2">
                    <span className="text-[11px] font-bold text-[#5E6C84] uppercase">GTM Launch 1</span>

                    <div className="bg-white p-2.5 rounded shadow-xs border border-gray-200 text-xs space-y-2">
                      <p className="font-semibold text-[#172B4D]">Create paid social ad set for campaign launch</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span className="font-mono">BSC-358</span>
                        <span className="text-amber-600 font-bold">=</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 5: Done */}
                  <div className="bg-[#EBECF0] rounded p-2.5 space-y-2 relative">
                    <span className="text-[11px] font-bold text-[#5E6C84] uppercase">Done 3</span>

                    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 space-y-2.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Select an agent</span>
                      
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search agents"
                          className="w-full pl-6 pr-2 py-1 text-[11px] border border-blue-400 rounded focus:outline-none"
                          readOnly
                        />
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded">
                          <span className="text-cyan-600 font-bold">◇</span>
                          <div>
                            <p className="font-bold text-[11px]">Cursor</p>
                            <p className="text-[9px] text-gray-400">by Atlassian</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded">
                          <span className="text-purple-600 font-bold">🐙</span>
                          <div>
                            <p className="font-bold text-[11px]">GitHub Copilot</p>
                            <p className="text-[9px] text-gray-400">by Atlassian</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-blue-50/60 rounded">
                          <span className="text-blue-500 font-bold">🎨</span>
                          <div>
                            <p className="font-bold text-[11px]">Canva</p>
                            <p className="text-[9px] text-gray-400">by Atlassian</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded">
                          <span className="text-pink-500 font-bold">❖</span>
                          <div>
                            <p className="font-bold text-[11px]">Figma</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-1">
                        <div className="flex items-center gap-1 bg-[#36B37E] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                          <span className="w-3 h-3 rounded-full bg-white/20 text-center text-[8px]">M</span>
                          <span>Marketing</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>
      </main>

      {/* Floating Chat / Support Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => onNavigateToLogin()}
          className="w-12 h-12 rounded-full bg-[#0052CC] hover:bg-[#0065FF] text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-all"
          title="Chat with support"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#DFE1E6] bg-[#FAFBFC] py-8 px-6 sm:px-10 text-xs text-[#5E6C84] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AbcLogo size="sm" />
          <span className="font-bold text-[#172B4D]">Abc Agile Platform</span>
          <span>© 2026 Abc Technologies</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy Policy</a>
          <span>•</span>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Terms</a>
          <span>•</span>
          <a href="#security" onClick={(e) => e.preventDefault()} className="hover:underline">Security</a>
        </div>
      </footer>
    </div>
  );
};

export default AbcLandingPage;
