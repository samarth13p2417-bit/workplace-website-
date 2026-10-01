import React, { useState } from 'react';
import { 
  Code2, 
  Megaphone, 
  Users, 
  LayoutGrid, 
  Palette, 
  Briefcase, 
  Headphones, 
  TrendingUp, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const OnboardingRoleSelector = ({ user, onCompleteOnboarding, onCancel }) => {
  const [selectedWorkType, setSelectedWorkType] = useState('software');
  const [selectedRole, setSelectedRole] = useState('team_lead');
  const [workspaceName, setWorkspaceName] = useState('My Software Team');
  const [step, setStep] = useState(1); // 1: Work Type, 2: Role & Team Name

  const workTypes = [
    {
      id: 'software',
      title: 'Software Development',
      desc: 'Agile sprints, backlog grooming, issue tracking & code releases',
      icon: <Code2 className="w-6 h-6 text-blue-600" />,
      badge: 'Popular',
      color: 'border-blue-500 bg-blue-50/50',
    },
    {
      id: 'marketing',
      title: 'Marketing & Campaigns',
      desc: 'Campaign management, content calendars, launches & analytics',
      icon: <Megaphone className="w-6 h-6 text-amber-500" />,
      badge: null,
      color: 'border-amber-500 bg-amber-50/50',
    },
    {
      id: 'hr',
      title: 'Human Resources (HR)',
      desc: 'Talent recruitment, candidate pipeline, onboarding & policies',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      badge: null,
      color: 'border-purple-500 bg-purple-50/50',
    },
    {
      id: 'product',
      title: 'Product Management',
      desc: 'Roadmaps, feature specs, user story mapping & OKRs',
      icon: <LayoutGrid className="w-6 h-6 text-emerald-600" />,
      badge: null,
      color: 'border-emerald-500 bg-emerald-50/50',
    },
    {
      id: 'design',
      title: 'Design & Creative',
      desc: 'UI/UX design systems, creative assets, prototyping & reviews',
      icon: <Palette className="w-6 h-6 text-pink-500" />,
      badge: null,
      color: 'border-pink-500 bg-pink-50/50',
    },
    {
      id: 'operations',
      title: 'Finance & Operations',
      desc: 'Budgets, compliance, procurement, and process optimization',
      icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
      badge: null,
      color: 'border-indigo-500 bg-indigo-50/50',
    },
    {
      id: 'support',
      title: 'Customer Support / IT',
      desc: 'Service desks, ticket queues, SLA tracking & IT ops',
      icon: <Headphones className="w-6 h-6 text-cyan-600" />,
      badge: null,
      color: 'border-cyan-500 bg-cyan-50/50',
    },
    {
      id: 'sales',
      title: 'Sales & Business Dev',
      desc: 'Lead generation, client pipeline, deal closing & partnerships',
      icon: <TrendingUp className="w-6 h-6 text-teal-600" />,
      badge: null,
      color: 'border-teal-500 bg-teal-50/50',
    },
  ];

  const roles = [
    { id: 'team_lead', label: 'Team Lead / Manager' },
    { id: 'individual', label: 'Specialist / Individual Contributor' },
    { id: 'project_manager', label: 'Project / Product Manager' },
    { id: 'director', label: 'Executive / Director / Founder' },
  ];

  const handleFinish = (e) => {
    e.preventDefault();
    const chosenWork = workTypes.find(w => w.id === selectedWorkType);
    onCompleteOnboarding({
      ...user,
      workType: selectedWorkType,
      workTypeTitle: chosenWork?.title || 'Software Development',
      role: selectedRole,
      workspaceName: workspaceName.trim() || 'My Workspace',
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-[#DFE1E6] overflow-hidden my-6 text-[#172B4D]">
        
        {/* Header Bar */}
        <div className="bg-[#0052CC] text-white p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-bold block mb-0.5">
                Welcome to Abc, {user?.name || 'there'}!
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {step === 1 ? 'What type of work do you do?' : 'Tell us about your role & team'}
              </h2>
            </div>
          </div>

          <div className="text-right text-xs text-blue-200 font-medium">
            Step {step} of 2
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            <>
              <p className="text-sm text-[#5E6C84]">
                We'll personalize your workspace and recommend the right templates based on your team's workflow.
              </p>

              {/* Grid of Work Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                {workTypes.map((item) => {
                  const isSelected = selectedWorkType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedWorkType(item.id)}
                      className={`relative p-4 rounded-md border-2 transition-all cursor-pointer flex flex-col justify-between text-left group ${
                        isSelected
                          ? `${item.color} border-[#0052CC] shadow-sm`
                          : 'border-[#DFE1E6] hover:border-[#B3BAC5] hover:bg-[#FAFBFC]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="p-2 bg-white rounded-md shadow-xs border border-gray-100">
                            {item.icon}
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              {item.badge}
                            </span>
                          )}
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#0052CC] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-[#172B4D] group-hover:text-[#0052CC]">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#5E6C84] mt-1 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#DFE1E6]">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-bold text-xs rounded transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Next: Choose Role</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleFinish} className="space-y-6">
              {/* Selected Type Recap */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md flex items-center gap-3">
                <div className="p-2 bg-white rounded shadow-xs">
                  {workTypes.find(w => w.id === selectedWorkType)?.icon}
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-blue-700 block">Chosen Category</span>
                  <p className="text-sm font-bold text-[#172B4D]">
                    {workTypes.find(w => w.id === selectedWorkType)?.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-[#0052CC] hover:underline font-semibold"
                >
                  Change
                </button>
              </div>

              {/* Workspace Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-1.5">
                  Workspace / Team Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Engineering Squad, Growth Marketing"
                  required
                  className="w-full px-3.5 py-2.5 text-sm text-[#172B4D] border border-[#DFE1E6] rounded bg-[#FAFBFC] focus:bg-white focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all font-medium"
                />
              </div>

              {/* Primary Role Selector */}
              <div>
                <label className="block text-xs font-bold text-[#5E6C84] uppercase tracking-wider mb-2">
                  What is your primary role?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {roles.map((r) => {
                    const isRoleSelected = selectedRole === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-3 text-left rounded-md border text-xs font-semibold transition-all flex items-center justify-between ${
                          isRoleSelected
                            ? 'border-[#0052CC] bg-blue-50/60 text-[#0052CC]'
                            : 'border-[#DFE1E6] hover:bg-gray-50 text-[#172B4D]'
                        }`}
                      >
                        <span>{r.label}</span>
                        {isRoleSelected && <Check className="w-4 h-4 text-[#0052CC]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#DFE1E6]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0052CC] hover:bg-[#0065FF] text-white font-bold text-xs rounded transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Launch Workspace</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingRoleSelector;
