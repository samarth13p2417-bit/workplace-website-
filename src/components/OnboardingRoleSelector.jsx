import React, { useState } from 'react';
import { 
  Code2, 
  Megaphone, 
  Users, 
  Palette, 
  Briefcase, 
  Headphones, 
  Check, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  DollarSign,
  Layers,
  Compass,
  Cpu,
  Award,
  Terminal,
  CheckCircle2
} from 'lucide-react';

export const OnboardingRoleSelector = ({ user, onCompleteOnboarding, onCancel }) => {
  // Step 1: Role, Step 2: Branch / Department & Workspace Setup
  const [step, setStep] = useState(1);
  
  // Selected Role
  const [selectedRole, setSelectedRole] = useState('Developer');
  
  // Selected Branch (hr, finance, marketing, software development)
  const [selectedBranch, setSelectedBranch] = useState('Software Development');

  // Custom Workspace Name
  const [workspaceName, setWorkspaceName] = useState(
    user?.workspaceName || 'Samarth Workplace'
  );

  // 1. Roles list (Manager, Developer, QA, etc.)
  const roles = [
    {
      id: 'Developer',
      title: 'Developer / Software Engineer',
      desc: 'Writing code, fixing bugs, creating PRs, and delivering sprint stories',
      badge: 'Popular',
      badgeColor: 'bg-blue-100 text-blue-700',
      icon: <Code2 className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'Manager',
      title: 'Manager / Team Lead',
      desc: 'Sprint planning, resource management, team velocity, and project delivery',
      badge: 'Leadership',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: <Briefcase className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 'Product Manager',
      title: 'Product Manager / Owner',
      desc: 'Defining requirements, roadmap planning, user stories, and OKRs',
      badge: 'Strategy',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      icon: <Compass className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'QA Tester',
      title: 'QA / Quality Assurance Tester',
      desc: 'Writing test cases, regression testing, bug validation, and QA sign-offs',
      badge: 'Quality',
      badgeColor: 'bg-amber-100 text-amber-700',
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'UI/UX Designer',
      title: 'UI / UX Designer',
      desc: 'Wireframing, UI kits, design systems, and user experience flows',
      badge: 'Creative',
      badgeColor: 'bg-pink-100 text-pink-700',
      icon: <Palette className="w-5 h-5 text-pink-600" />,
    },
    {
      id: 'DevOps Engineer',
      title: 'DevOps / Cloud Architect',
      desc: 'CI/CD automation, server uptime, Kubernetes, and cloud security',
      badge: 'Infra',
      badgeColor: 'bg-cyan-100 text-cyan-700',
      icon: <Cpu className="w-5 h-5 text-cyan-600" />,
    },
    {
      id: 'Intern',
      title: 'Intern / Associate Contributor',
      desc: 'Learning workflows, pairing with seniors, and executing starter tasks',
      badge: 'Entry',
      badgeColor: 'bg-slate-100 text-slate-700',
      icon: <Award className="w-5 h-5 text-slate-600" />,
    },
    {
      id: 'Executive / Director',
      title: 'Executive / Director / Founder',
      desc: 'Cross-functional oversight, portfolio health, budgets, and reporting',
      badge: 'Executive',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
    },
  ];

  // 2. Branches / Departments list (HR, Finance, Marketing, Software Development)
  const branches = [
    {
      id: 'Software Development',
      title: 'Software Development',
      desc: 'Agile Kanban/Scrum, bug backlog, code repositories & release deployments',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: <Terminal className="w-6 h-6 text-blue-600" />,
      defaultBoardTitle: 'KAN - Software Board',
      themeBorder: 'border-blue-500 bg-blue-50/40',
    },
    {
      id: 'Human Resources (HR)',
      title: 'Human Resources (HR)',
      desc: 'Recruitment pipelines, candidate interviews, onboarding & employee policies',
      badge: 'People Ops',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      defaultBoardTitle: 'HR - People & Hiring Board',
      themeBorder: 'border-purple-500 bg-purple-50/40',
    },
    {
      id: 'Finance & Accounting',
      title: 'Finance & Accounts',
      desc: 'Budgeting, payroll processing, tax compliance, audits, and expense tracking',
      badge: 'Finance',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      defaultBoardTitle: 'FIN - Accounts & Budgeting',
      themeBorder: 'border-emerald-500 bg-emerald-50/40',
    },
    {
      id: 'Marketing & Growth',
      title: 'Marketing & Campaigns',
      desc: 'Brand marketing, SEO campaigns, product launch schedules & ad analytics',
      badge: 'Growth',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: <Megaphone className="w-6 h-6 text-amber-500" />,
      defaultBoardTitle: 'MKT - Growth & Brand Board',
      themeBorder: 'border-amber-500 bg-amber-50/40',
    },
    {
      id: 'Operations & IT',
      title: 'Operations & IT Support',
      desc: 'Internal service desks, vendor management, hardware inventory & SLAs',
      badge: 'Operations',
      badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      icon: <Headphones className="w-6 h-6 text-cyan-600" />,
      defaultBoardTitle: 'OPS - Service Desk & Ops',
      themeBorder: 'border-cyan-500 bg-cyan-50/40',
    },
    {
      id: 'Product & Design',
      title: 'Product & Design',
      desc: 'Feature ideation, user research, wireframes, prototypes & usability testing',
      badge: 'Design',
      badgeColor: 'bg-pink-100 text-pink-700 border-pink-200',
      icon: <Layers className="w-6 h-6 text-pink-600" />,
      defaultBoardTitle: 'PRD - Product Discovery Board',
      themeBorder: 'border-pink-500 bg-pink-50/40',
    },
  ];

  const handleFinish = (e) => {
    if (e) e.preventDefault();
    onCompleteOnboarding({
      ...user,
      role: selectedRole,
      workTypeTitle: selectedBranch,
      workspaceName: workspaceName.trim() || `${selectedBranch} Workspace`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col justify-between text-[#172B4D] select-none font-sans">
      
      {/* 1. TOP BRAND HEADER */}
      <header className="h-14 border-b border-[#DFE1E6] bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
              <path fill="#0052CC" d="M11.53 2c0 5.23 4.24 9.47 9.47 9.47H22V2h-10.47z"/>
              <path fill="#2684FF" d="M2 11.53c0 5.23 4.24 9.47 9.47 9.47h1.06v-9.47H2z"/>
              <path fill="#0052CC" d="M11.53 11.53c0 5.23 4.24 9.47 9.47 9.47H22v-9.47h-10.47z"/>
            </svg>
            <span className="font-extrabold text-[18px] tracking-tight text-[#172B4D]">
              Samarth Workplace
            </span>
          </div>
          <span className="text-[#DFE1E6]">|</span>
          <span className="text-xs font-semibold text-[#5E6C84]">
            Workspace Setup & Onboarding
          </span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-[#0052CC] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </span>
            <span className={`text-xs font-semibold hidden sm:inline ${
              step === 1 ? 'text-[#0052CC]' : 'text-[#6B778C]'
            }`}>
              Select Role
            </span>
          </div>

          <div className="w-8 h-0.5 bg-[#DFE1E6]" />

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-[#0052CC] text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </span>
            <span className={`text-xs font-semibold hidden sm:inline ${
              step === 2 ? 'text-[#0052CC]' : 'text-[#6B778C]'
            }`}>
              Select Branch
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-10">
        
        {/* ===================================================================== */}
        {/* STEP 1: SELECT ROLE (Manager, Developer, QA, Designer, etc.) */}
        {/* ===================================================================== */}
        {step === 1 && (
          <div className="animate-fadeIn">
            {/* Header info */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0052CC] text-xs font-bold uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                Step 1 of 2: Role Selection
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
                What is your primary role, {user?.name?.split(' ')[0] || 'there'}?
              </h1>
              <p className="text-sm text-[#5E6C84] mt-2">
                Select your job role to customize your board views, permissions, and default task assignments.
              </p>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#0052CC] bg-blue-50/50 shadow-md ring-2 ring-[#0052CC]/20'
                        : 'border-[#DFE1E6] bg-white hover:border-[#4C9AFF] hover:bg-[#FAFBFC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-md ${isSelected ? 'bg-white shadow-xs' : 'bg-[#F4F5F7]'}`}>
                          {r.icon}
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${r.badgeColor}`}>
                            {r.badge}
                          </span>
                        )}
                      </div>

                      <h3 className={`font-bold text-sm tracking-tight ${isSelected ? 'text-[#0052CC]' : 'text-[#172B4D]'}`}>
                        {r.title}
                      </h3>
                      <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-[#0052CC]">
                      <span>{isSelected ? 'Selected' : 'Click to select'}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Actions Bar */}
            <div className="max-w-xl mx-auto flex items-center justify-between pt-6 border-t border-[#DFE1E6]">
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] cursor-pointer"
                >
                  Skip for now
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-bold text-xs rounded transition-all flex items-center gap-2 shadow-sm hover:shadow cursor-pointer"
              >
                <span>Continue to Branch Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: SELECT BRANCH (Software Dev, HR, Finance, Marketing, etc.) */}
        {/* ===================================================================== */}
        {step === 2 && (
          <div className="animate-fadeIn">
            {/* Header info */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                Step 2 of 2: Branch / Department
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight">
                Which branch or department are you in?
              </h1>
              <p className="text-sm text-[#5E6C84] mt-2">
                Select your branch to configure the right department board, issue categories, and workflow templates.
              </p>
            </div>

            {/* Selected Role Quick Pill */}
            <div className="max-w-2xl mx-auto mb-6 p-3 bg-white border border-[#DFE1E6] rounded-md shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-[#0052CC] rounded">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B778C] block">
                    Your Selected Role
                  </span>
                  <span className="text-xs font-bold text-[#172B4D]">
                    {roles.find(r => r.id === selectedRole)?.title || selectedRole}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#0052CC] hover:underline cursor-pointer"
              >
                Change Role
              </button>
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {branches.map((b) => {
                const isSelected = selectedBranch === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBranch(b.id);
                      setWorkspaceName(`Samarth Workplace - ${b.title}`);
                    }}
                    className={`relative p-5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? `${b.themeBorder} shadow-md ring-2 ring-[#0052CC]/20`
                        : 'border-[#DFE1E6] bg-white hover:border-[#4C9AFF] hover:bg-[#FAFBFC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 bg-white rounded-md shadow-xs border border-gray-100">
                          {b.icon}
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${b.badgeColor}`}>
                            {b.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#0052CC] tracking-tight">
                        {b.title}
                      </h3>
                      <p className="text-xs text-[#5E6C84] mt-1.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-[#6B778C]">
                      <span className="font-medium">Board: {b.defaultBoardTitle}</span>
                      {isSelected && (
                        <span className="font-bold text-[#0052CC] flex items-center gap-1">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Workspace Name customization */}
            <div className="max-w-2xl mx-auto bg-white p-5 rounded-lg border border-[#DFE1E6] shadow-xs mb-8">
              <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2">
                Workspace / Team Name
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Samarth Software Squad"
                  className="flex-1 px-3.5 py-2 text-sm text-[#172B4D] border border-[#DFE1E6] rounded bg-[#FAFBFC] focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all font-medium"
                />
              </div>
              <p className="text-[11px] text-[#6B778C] mt-2">
                Your workspace will be initialized with a project board optimized for {selectedBranch}.
              </p>
            </div>

            {/* Step 2 Actions Bar */}
            <div className="max-w-2xl mx-auto flex items-center justify-between pt-4 border-t border-[#DFE1E6]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Role</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-bold text-xs rounded transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Launch Samarth Workplace</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="py-4 border-t border-[#DFE1E6] bg-white text-center text-xs text-[#6B778C]">
        <span>Samarth Workplace • Agile Project Management & Real-time Collaboration</span>
      </footer>
    </div>
  );
};

export default OnboardingRoleSelector;
