import React, { useState } from 'react';
import { X, Check, ExternalLink, Sparkles } from 'lucide-react';

export const SeePlansModal = ({ isOpen, onClose, onSelectPlan }) => {
  const [showBanner, setShowBanner] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('standard');
  const [notification, setNotification] = useState('');

  if (!isOpen) return null;

  const handlePlanAction = (planName) => {
    setNotification(`Successfully selected the ${planName} plan!`);
    setTimeout(() => {
      setNotification('');
      if (onSelectPlan) onSelectPlan(planName);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl border border-[#DFE1E6] overflow-hidden my-6 text-[#172B4D] relative">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header & Trial Notice Banner */}
        <div className="p-6 sm:p-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172B4D] tracking-tight mb-3">
            Choose the right plan for your team
          </h1>

          {/* Trial Banner */}
          {showBanner && (
            <div className="relative p-3.5 bg-gray-50 border border-gray-200 rounded text-xs text-[#172B4D] flex items-start justify-between gap-3 leading-relaxed mb-6">
              <div>
                Congrats - we've given you <span className="font-semibold">Premium access</span> with all our best features to get started. Your trial ends on November 1, 2026. Choose a plan by then, or you'll be auto-downgraded to Free.{' '}
                <a
                  href="#features"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#0052CC] hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  <span>Learn more about your features</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-700 p-0.5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toast Notification */}
          {notification && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded text-center font-semibold animate-fadeIn">
              {notification}
            </div>
          )}
        </div>

        {/* 3 PRICING PLAN CARDS */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* 1. FREE CARD */}
            <div className="border border-[#DFE1E6] rounded-lg p-6 sm:p-7 flex flex-col justify-between hover:border-gray-400 transition-all bg-white shadow-xs">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[#172B4D]">Free</h2>
                  <p className="text-xs text-[#5E6C84] mt-1 min-h-[32px] leading-snug">
                    For individuals or teams learning the Abc basics
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5 pt-2">
                  <span className="text-3xl font-extrabold text-[#172B4D]">$0</span>
                  <span className="text-xs text-[#5E6C84]">per user / month</span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanAction('Free')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#DFE1E6] hover:border-gray-400 text-[#172B4D] font-bold text-xs rounded transition-colors shadow-xs cursor-pointer"
                >
                  Select Free
                </button>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-[#172B4D]">Free includes:</h3>
                  <ul className="space-y-2.5 text-xs text-[#172B4D]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                      <span>Limited to 10 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                      <span>100 automations / month</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. STANDARD CARD (RECOMMENDED) */}
            <div className="border-2 border-[#0052CC] rounded-lg flex flex-col justify-between relative shadow-lg bg-white overflow-hidden">
              {/* RECOMMENDED TOP BLACK BANNER */}
              <div className="bg-[#253858] text-white text-[11px] font-bold uppercase tracking-widest text-center py-1.5 w-full">
                RECOMMENDED
              </div>

              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#172B4D]">Standard</h2>
                    <p className="text-xs text-[#5E6C84] mt-1 min-h-[32px] leading-snug">
                      For small & growing teams needing better control and automation
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-2">
                    <span className="text-3xl font-extrabold text-[#172B4D]">$9.05</span>
                    <span className="text-xs text-[#5E6C84]">per user / month</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanAction('Standard')}
                    className="w-full py-2.5 px-4 bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] text-white font-bold text-xs rounded transition-colors shadow-sm cursor-pointer"
                  >
                    Buy Standard
                  </button>

                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="text-xs font-bold text-[#172B4D]">Get everything in Free, plus:</h3>
                    <ul className="space-y-2.5 text-xs text-[#172B4D]">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                        <span>Unlimited users, 250 GB storage & 1,700 automations / month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                        <span>Project & user permissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                        <span>Give project access to external customers and clients</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PREMIUM CARD */}
            <div className="border border-[#DFE1E6] rounded-lg p-6 sm:p-7 flex flex-col justify-between hover:border-gray-400 transition-all bg-white shadow-xs">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#172B4D]">Premium</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#6554C0] text-[#6554C0] bg-[#F3F0FF]">
                      30 DAYS LEFT
                    </span>
                  </div>
                  <p className="text-xs text-[#5E6C84] mt-1 min-h-[32px] leading-snug">
                    For alignment & planning across teams and AI-powered productivity
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5 pt-2">
                  <span className="text-3xl font-extrabold text-[#172B4D]">$18.30</span>
                  <span className="text-xs text-[#5E6C84]">per user / month</span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanAction('Premium')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#DFE1E6] hover:border-gray-400 text-[#172B4D] font-bold text-xs rounded transition-colors shadow-xs cursor-pointer"
                >
                  Add payment
                </button>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-[#172B4D]">Get everything in Standard, plus:</h3>
                  <ul className="space-y-2.5 text-xs text-[#172B4D]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                      <span>Brainstorm & summarize work with Atlassian Intelligence (AI)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                      <span>Advanced planning across teams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                      <span>24/7 support from experts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                      <span>Advanced admin controls & insights</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SeePlansModal;
