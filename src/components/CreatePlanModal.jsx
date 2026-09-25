import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles,
  Check,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CreatePlanModal = ({ isOpen, onClose, onPlanCreated, showNotification }) => {
  const [planName, setPlanName] = useState('');
  const [access, setAccess] = useState('Open');
  const [workSources, setWorkSources] = useState([
    { id: 1, type: 'Space', name: 'My Software Team' }
  ]);
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [availableSpaces] = useState([
    'My Software Team',
    '(Example) Billing System Dev',
    'HR & People Operations',
    'Marketing Growth Squad',
  ]);

  if (!isOpen) return null;

  const handleAddWorkSource = () => {
    setWorkSources([
      ...workSources,
      { id: Date.now(), type: 'Space', name: '(Example) Billing System Dev' }
    ]);
  };

  const handleRemoveWorkSource = (id) => {
    if (workSources.length > 1) {
      setWorkSources(workSources.filter((s) => s.id !== id));
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!planName.trim()) return;

    if (showNotification) {
      showNotification(`Plan "${planName.trim()}" created successfully!`);
    }

    if (onPlanCreated) {
      onPlanCreated({
        name: planName.trim(),
        access,
        workSources,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn select-none overflow-y-auto text-[#172B4D] font-sans">
      
      {/* 1. TOP NAV / CLOSE BUTTON */}
      <div className="p-4 sm:p-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[#EBECF0] text-[#42526E] transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. SPLIT LAYOUT: FORM (LEFT) + ROADMAP GRAPHIC (RIGHT) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-6 sm:px-12 pb-12 gap-10 items-stretch">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN: CREATE YOUR PLAN FORM */}
        {/* ===================================================================== */}
        <div className="w-full lg:w-[48%] flex flex-col justify-between py-2">
          <div>
            {/* Jira Logo */}
            <div className="flex items-center gap-2 mb-6">
              <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
                <path fill="#0052CC" d="M11.53 2c0 5.23 4.24 9.47 9.47 9.47H22V2h-10.47z"/>
                <path fill="#2684FF" d="M2 11.53c0 5.23 4.24 9.47 9.47 9.47h1.06v-9.47H2z"/>
                <path fill="#0052CC" d="M11.53 11.53c0 5.23 4.24 9.47 9.47 9.47H22v-9.47h-10.47z"/>
              </svg>
              <span className="text-[22px] font-bold text-[#172B4D] tracking-tight">Jira</span>
            </div>

            {/* Title & Description */}
            <h1 className="text-3xl sm:text-[32px] font-extrabold text-[#172B4D] tracking-tight mb-2">
              Create your plan
            </h1>
            <p className="text-sm text-[#42526E] leading-relaxed mb-6">
              Visualize, plan, track, and report on work across multiple spaces, boards or teams.
            </p>
            <p className="text-xs text-[#6B778C] mb-6">
              Required fields are marked with an asterisk <span className="text-red-500">*</span>
            </p>

            {/* Form Fields */}
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Plan Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Enter a plan name"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2 text-sm text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-white focus:outline-none focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all font-medium placeholder:text-[#6B778C]"
                />
              </div>

              {/* Access Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">
                  Access <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccessDropdownOpen(!isAccessDropdownOpen)}
                    className="w-full px-3.5 py-2 text-sm text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-white hover:bg-[#FAFBFC] focus:outline-none focus:border-[#4C9AFF] flex items-center justify-between cursor-pointer font-medium"
                  >
                    <span>{access}</span>
                    <ChevronDown className="w-4 h-4 text-[#6B778C]" />
                  </button>

                  {isAccessDropdownOpen && (
                    <div className="absolute left-0 top-10 w-full bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-30 animate-fadeIn">
                      <div
                        onClick={() => {
                          setAccess('Open');
                          setIsAccessDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-xs hover:bg-[#FAFBFC] cursor-pointer flex items-center justify-between ${
                          access === 'Open' ? 'text-[#0052CC] font-bold bg-blue-50/50' : 'text-[#172B4D]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">Open</p>
                          <p className="text-[11px] text-[#6B778C]">Anyone with access to the site can view and edit this plan</p>
                        </div>
                        {access === 'Open' && <Check className="w-4 h-4 text-[#0052CC]" />}
                      </div>

                      <div
                        onClick={() => {
                          setAccess('Restricted');
                          setIsAccessDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-xs hover:bg-[#FAFBFC] cursor-pointer flex items-center justify-between border-t border-gray-100 ${
                          access === 'Restricted' ? 'text-[#0052CC] font-bold bg-blue-50/50' : 'text-[#172B4D]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">Restricted</p>
                          <p className="text-[11px] text-[#6B778C]">Only specified users and groups can view or edit this plan</p>
                        </div>
                        {access === 'Restricted' && <Check className="w-4 h-4 text-[#0052CC]" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Work Section */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-[#172B4D]">
                    Add work
                  </h3>
                  <p className="text-xs text-[#6B778C] mt-0.5">
                    Include work items from multiple spaces, boards, or using filters.
                  </p>
                </div>

                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Work <span className="text-red-500">*</span>
                </label>

                {/* Work sources rows */}
                <div className="space-y-2">
                  {workSources.map((source, idx) => (
                    <div key={source.id} className="flex items-center gap-2">
                      {/* Source Type (Space) */}
                      <div className="w-36 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px] px-3 py-2 text-xs font-semibold text-[#172B4D] flex items-center justify-between">
                        <span>{source.type}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
                      </div>

                      {/* Source Search/Name selector */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={source.name}
                          onChange={(e) => {
                            const updated = [...workSources];
                            updated[idx].name = e.target.value;
                            setWorkSources(updated);
                          }}
                          placeholder="Enter space name"
                          className="w-full pl-3 pr-8 py-2 text-xs text-[#172B4D] border border-[#DFE1E6] rounded-[3px] bg-white focus:outline-none focus:border-[#4C9AFF] font-medium"
                        />
                        <Search className="w-3.5 h-3.5 text-[#6B778C] absolute right-3 top-2.5" />
                      </div>

                      {/* Remove button if more than 1 */}
                      {workSources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkSource(source.id)}
                          className="p-2 text-[#6B778C] hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* + Add more work button */}
                <button
                  type="button"
                  onClick={handleAddWorkSource}
                  className="mt-1 px-3 py-1.5 border border-[#DFE1E6] hover:bg-[#FAFBFC] text-xs font-semibold text-[#172B4D] rounded-[3px] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6B778C]" />
                  <span>Add more work</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-8">
                <button
                  type="submit"
                  disabled={!planName.trim()}
                  className={`px-6 py-2 rounded-[3px] text-xs font-bold transition-all shadow-xs ${
                    planName.trim()
                      ? 'bg-[#0052CC] hover:bg-[#0065FF] text-white cursor-pointer'
                      : 'bg-[#091E42]/5 text-[#A5ADBA] cursor-not-allowed'
                  }`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: ROADMAP TIMELINE PREVIEW GRAPHIC */}
        {/* ===================================================================== */}
        <div className="w-full lg:w-[52%] bg-gradient-to-br from-[#DEEBFF]/40 via-[#E9F2FF]/60 to-[#F4F5F7] rounded-2xl p-6 sm:p-10 flex items-center justify-center relative overflow-hidden border border-[#DFE1E6]/50">
          
          {/* Subtle background decorative shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

          {/* Elevated Jira Roadmap Card */}
          <div className="w-full bg-white rounded-xl shadow-[0_8px_30px_rgba(9,30,66,0.12)] border border-[#DFE1E6] overflow-hidden text-xs">
            
            {/* Card Header Nav */}
            <div className="p-3.5 border-b border-[#DFE1E6] flex items-center justify-between bg-white">
              <div className="flex items-center gap-4 overflow-x-auto text-[11px] font-semibold text-[#6B778C]">
                {/* Squiggly Roadmap Icon */}
                <div className="text-[#172B4D]">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                    <path d="M4 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
                  </svg>
                </div>
                <span>Summary</span>
                <span className="text-[#172B4D] font-bold border-b-2 border-[#172B4D] pb-1">
                  Timeline
                </span>
                <span>Program</span>
                <span>Calendar</span>
                <span>Teams</span>
                <span>Dependencies</span>
              </div>

              {/* Three dots placeholder */}
              <div className="flex items-center gap-1 opacity-40">
                <div className="w-2 h-2 rounded-xs bg-[#6B778C]" />
                <div className="w-2 h-2 rounded-xs bg-[#6B778C]" />
                <div className="w-2 h-2 rounded-xs bg-[#6B778C]" />
              </div>
            </div>

            {/* Split Header Table Mockup */}
            <div className="grid grid-cols-2 p-2.5 bg-[#FAFBFC] border-b border-[#DFE1E6]">
              <div className="w-24 h-2.5 bg-[#DFE1E6] rounded-xs" />
              <div className="w-24 h-2.5 bg-[#DFE1E6] rounded-xs" />
            </div>

            {/* Timeline Rows Body with colored Gantt bars matching screenshot */}
            <div className="p-3 space-y-4">
              
              {/* Group 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
                  <div className="w-28 h-2 bg-[#DFE1E6] rounded-xs" />
                </div>

                {/* Row 1 */}
                <div className="flex items-center justify-between pl-6 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-32 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-32 h-3.5 rounded-sm bg-[#79F2C0] shadow-xs" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between pl-6 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-28 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-24 h-3.5 rounded-sm bg-[#79F2C0] ml-6 shadow-xs" />
                  </div>
                </div>

                {/* Row 3 with Dependency curve connecting to green bar */}
                <div className="flex items-center justify-between pl-6 relative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-24 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4 relative">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-20 h-3.5 rounded-sm bg-[#B388FF] shadow-xs relative">
                      {/* Curved dependency arrow SVG */}
                      <svg className="absolute -bottom-4 right-2 w-6 h-6 overflow-visible pointer-events-none" viewBox="0 0 24 24" fill="none">
                        <path d="M0 0 v8 c0 4 4 8 8 8 h6" stroke="#998DD9" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 4 (Dependent bar) */}
                <div className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-20 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-16 h-3.5 rounded-sm bg-[#79F2C0] ml-16 shadow-xs" />
                  </div>
                </div>
              </div>

              {/* Group 2 */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
                  <div className="w-24 h-2 bg-[#DFE1E6] rounded-xs" />
                </div>

                {/* Row 1 (Blue bar) */}
                <div className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-32 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-36 h-3.5 rounded-sm bg-[#4C9AFF] shadow-xs" />
                  </div>
                </div>

                {/* Row 2 (Purple bar with curved line) */}
                <div className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-28 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4 relative">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-20 h-3.5 rounded-sm bg-[#B388FF] shadow-xs relative">
                      <svg className="absolute -bottom-4 right-2 w-6 h-6 overflow-visible pointer-events-none" viewBox="0 0 24 24" fill="none">
                        <path d="M0 0 v8 c0 4 4 8 8 8 h6" stroke="#998DD9" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 3 (Connected blue bar) */}
                <div className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-20 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-14 h-3.5 rounded-sm bg-[#4C9AFF] ml-20 shadow-xs" />
                  </div>
                </div>
              </div>

              {/* Group 3 */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
                  <div className="w-24 h-2 bg-[#DFE1E6] rounded-xs" />
                </div>
                <div className="flex items-center justify-between pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-300 rounded-xs" />
                    <div className="w-28 h-2 bg-[#EBECF0] rounded-xs" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-[#DFE1E6]" />
                    <div className="w-32 h-3.5 rounded-sm bg-[#79F2C0] shadow-xs" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreatePlanModal;
