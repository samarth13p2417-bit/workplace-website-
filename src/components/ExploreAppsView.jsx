import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  Star, 
  Download, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Check,
  ExternalLink,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const ExploreAppsView = ({ showNotification }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');
  const [installedApps, setInstalledApps] = useState(['xray']);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'pricing', 'categories', 'sort', null

  const apps = [
    {
      id: 'scriptrunner',
      name: 'ScriptRunner for Jira',
      vendor: 'The Adaptavist Group',
      tag: 'SPOTLIGHT',
      tagColor: 'bg-[#6554C0] text-white',
      category: 'Automation',
      pricing: 'Paid',
      description: 'The must-have app for Jira admins of every technical background: the ultimate toolkit for unlimited automation and customisation',
      rating: 4.6,
      reviewsCount: 826,
      installs: '34.5k',
      cloudFortified: true,
      icon: (
        <div className="w-12 h-12 rounded-[14px] bg-[#E91E63] text-white flex items-center justify-center shrink-0 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'jmwe',
      name: 'Jira Misc Workflow Extensions (JMWE)',
      vendor: 'Appfire',
      tag: 'SPOTLIGHT',
      tagColor: 'bg-[#6554C0] text-white',
      category: 'Workflow',
      pricing: 'Paid',
      description: 'Customize and automate workflows in Jira with JMWE. Built for advanced, unlimited automation and smarter workflow control',
      rating: 4.8,
      reviewsCount: 535,
      installs: '16.5k',
      cloudFortified: true,
      icon: (
        <div className="w-12 h-12 rounded-[14px] bg-[#172B4D] text-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#36B37E] to-[#00B8D9] opacity-90" />
          <div className="absolute w-4 h-4 rounded-full bg-[#0052CC] -bottom-1 -right-1 opacity-70" />
        </div>
      ),
    },
    {
      id: 'xray',
      name: 'Xray - Test Management for Jira',
      vendor: 'Xblend',
      tag: 'BESTSELLER',
      tagColor: 'bg-[#00875A] text-white',
      category: 'Testing',
      pricing: 'Free Trial',
      description: 'Jira-native Test Management. Plan, track, and release with confidence across DevOps workflows, powered by AI',
      rating: 4.3,
      reviewsCount: 553,
      installs: '25.2k',
      cloudFortified: true,
      icon: (
        <div className="w-12 h-12 rounded-[14px] bg-[#00C7E6] text-white flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-[#36B37E] to-[#00875A]">
          <Zap className="w-6 h-6 text-white fill-white" />
        </div>
      ),
    },
    {
      id: 'github',
      name: 'GitHub for Jira',
      vendor: 'Atlassian',
      tag: 'POPULAR',
      tagColor: 'bg-[#0052CC] text-white',
      category: 'Developer Tools',
      pricing: 'Free',
      description: 'Automatically link commits, branches, and pull requests to Jira issues for end-to-end visibility across deployments',
      rating: 4.5,
      reviewsCount: 1420,
      installs: '89.1k',
      cloudFortified: true,
      icon: (
        <div className="w-12 h-12 rounded-[14px] bg-[#24292e] text-white flex items-center justify-center shrink-0 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </div>
      ),
    },
    {
      id: 'tempo',
      name: 'Tempo Timesheets - Time Tracking',
      vendor: 'Tempo Software',
      tag: 'STAFF PICK',
      tagColor: 'bg-[#FFAB00] text-[#172B4D]',
      category: 'Time Tracking',
      pricing: 'Paid',
      description: 'Automated time tracking, resource planning, and financial cost reporting directly inside your Jira boards',
      rating: 4.4,
      reviewsCount: 712,
      installs: '42.8k',
      cloudFortified: true,
      icon: (
        <div className="w-12 h-12 rounded-[14px] bg-[#0052CC] text-white flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-tr from-[#0052CC] to-[#2684FF]">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        </div>
      ),
    },
    {
      id: 'slack',
      name: 'Slack for Jira Cloud',
      vendor: 'Atlassian',
      tag: 'POPULAR',
      tagColor: 'bg-[#0052CC] text-white',
      category: 'Integrations',
      pricing: 'Free',
      description: 'Receive issue notifications, create and transition tasks directly from your Slack team channels in real-time',
      rating: 4.7,
      reviewsCount: 980,
      installs: '64.2k',
      cloudFortified: true,
      icon: (
        <div className="w-12 h-12 rounded-[14px] bg-[#4A154B] text-white flex items-center justify-center shrink-0 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5zm2-8a2 2 0 1 1-2 2V7h2zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5zm8 2a2 2 0 1 1 2 2h-2V10zm-1 0a2 2 0 1 1-4 0V5a2 2 0 1 1 4 0v5zm-2 8a2 2 0 1 1 2-2v2h-2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z"/>
          </svg>
        </div>
      ),
    },
  ];

  // Filtering logic
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'All' || app.category === selectedCategory;

    const matchesPricing =
      selectedPricing === 'All' ||
      (selectedPricing === 'Free' && app.pricing === 'Free') ||
      (selectedPricing === 'Paid' && app.pricing !== 'Free');

    return matchesSearch && matchesCategory && matchesPricing;
  });

  const toggleInstall = (appId, appName) => {
    if (installedApps.includes(appId)) {
      setInstalledApps(installedApps.filter((id) => id !== appId));
      if (showNotification) showNotification(`Uninstalled ${appName}`);
    } else {
      setInstalledApps([...installedApps, appId]);
      if (showNotification) showNotification(`Successfully installed ${appName}!`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn select-none text-[#172B4D] pb-12 font-sans">
      
      {/* 1. TOP HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#172B4D]">
          Explore apps for Jira
        </h1>
        <p className="text-xs text-[#5E6C84]">
          Supercharge your team's workflow with apps and integrations from the Atlassian Marketplace.
        </p>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B778C]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for apps"
          className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-[#DFE1E6] rounded-[3px] focus:outline-none focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all placeholder:text-[#6B778C]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B778C] hover:text-[#172B4D]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. FILTER PILLS BAR matching screenshot */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Pricing filter */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'pricing' ? null : 'pricing')}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              selectedPricing !== 'All'
                ? 'bg-[#E9F2FF] border-[#0052CC] text-[#0052CC]'
                : 'bg-white border-[#DFE1E6] text-[#42526E] hover:bg-[#FAFBFC]'
            }`}
          >
            <span>Pricing {selectedPricing !== 'All' ? `(${selectedPricing})` : ''}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
          </button>

          {activeDropdown === 'pricing' && (
            <div className="absolute left-0 top-9 w-36 bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-30 animate-fadeIn">
              {['All', 'Free', 'Paid'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPricing(p);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#FAFBFC] flex items-center justify-between ${
                    selectedPricing === p ? 'text-[#0052CC] font-bold bg-blue-50/50' : 'text-[#172B4D]'
                  }`}
                >
                  <span>{p}</span>
                  {selectedPricing === p && <Check className="w-3 h-3 text-[#0052CC]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trust signals */}
        <button
          onClick={() => {
            if (showNotification) showNotification('Filtering by Cloud Fortified apps');
          }}
          className="px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#FAFBFC] rounded text-[#42526E] flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <span>Trust signals</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
        </button>

        {/* Categories filter */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'categories' ? null : 'categories')}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              selectedCategory !== 'All'
                ? 'bg-[#E9F2FF] border-[#0052CC] text-[#0052CC]'
                : 'bg-white border-[#DFE1E6] text-[#42526E] hover:bg-[#FAFBFC]'
            }`}
          >
            <span>Categories {selectedCategory !== 'All' ? `(${selectedCategory})` : ''}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
          </button>

          {activeDropdown === 'categories' && (
            <div className="absolute left-0 top-9 w-44 bg-white border border-[#DFE1E6] rounded shadow-lg py-1 z-30 animate-fadeIn">
              {['All', 'Automation', 'Workflow', 'Testing', 'Developer Tools', 'Time Tracking', 'Integrations'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#FAFBFC] flex items-center justify-between ${
                    selectedCategory === cat ? 'text-[#0052CC] font-bold bg-blue-50/50' : 'text-[#172B4D]'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3 h-3 text-[#0052CC]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use cases */}
        <button
          onClick={() => {
            if (showNotification) showNotification('Use cases: CI/CD, Agile, ITSM');
          }}
          className="px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#FAFBFC] rounded text-[#42526E] flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <span>Use cases</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
        </button>

        {/* More filters */}
        <button
          onClick={() => {
            if (showNotification) showNotification('More filters: Top rated, Free trial, Staff picks');
          }}
          className="px-3 py-1.5 bg-white border border-[#DFE1E6] hover:bg-[#FAFBFC] rounded text-[#42526E] flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <span>More filters</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
        </button>
      </div>

      {/* 4. META LINE: APP COUNT + SORT BY */}
      <div className="flex items-center justify-between pt-2 border-t border-[#DFE1E6]/70 text-xs text-[#6B778C]">
        <span className="font-semibold text-[#172B4D]">
          Showing over 1,000 apps
        </span>

        <div className="flex items-center gap-1.5">
          <span>Sort by:</span>
          <button
            onClick={() => {
              const next = sortBy === 'Relevance' ? 'Highest rated' : sortBy === 'Highest rated' ? 'Most popular' : 'Relevance';
              setSortBy(next);
            }}
            className="font-semibold text-[#172B4D] hover:text-[#0052CC] flex items-center gap-1 cursor-pointer"
          >
            <span>{sortBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B778C]" />
          </button>
        </div>
      </div>

      {/* 5. APP CARDS GRID matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => {
          const isInstalled = installedApps.includes(app.id);

          return (
            <div
              key={app.id}
              className="relative bg-white border border-[#DFE1E6] rounded-xl p-5 hover:shadow-md hover:border-[#B3BAC5] transition-all flex flex-col justify-between group overflow-hidden"
            >
              {/* Top Tag badge (SPOTLIGHT / BESTSELLER) */}
              {app.tag && (
                <div className="absolute top-0 right-0">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-bl-md shadow-2xs ${app.tagColor}`}>
                    {app.tag}
                  </span>
                </div>
              )}

              {/* Card Header: Icon + Title + Vendor */}
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  {app.icon}

                  <div className="min-w-0 pr-12">
                    <h3 className="font-bold text-base text-[#172B4D] group-hover:text-[#0052CC] transition-colors leading-snug">
                      {app.name}
                    </h3>

                    {/* Vendor line with blue Atlassian triangle */}
                    <p className="text-xs text-[#5E6C84] mt-1 flex items-center gap-1">
                      <span>by {app.vendor}</span>
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#0052CC] shrink-0" fill="currentColor">
                        <path d="M11.53 2c0 5.23 4.24 9.47 9.47 9.47H22V2h-10.47zM2 11.53c0 5.23 4.24 9.47 9.47 9.47h1.06v-9.47H2z" />
                      </svg>
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#42526E] leading-relaxed line-clamp-3 mb-4">
                  {app.description}
                </p>
              </div>

              {/* Card Footer: Rating + Installs + Cloud Fortified Badge */}
              <div className="pt-3 border-t border-[#DFE1E6]/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#5E6C84]">
                  {/* Rating + stars */}
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#172B4D]">{app.rating}</span>
                    <span className="text-[11px] text-[#6B778C]">/5</span>
                    <div className="flex items-center text-[#FFAB00] ml-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current text-[#FFAB00]" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#6B778C] ml-1">({app.reviewsCount})</span>
                  </div>

                  {/* Installs */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#6B778C]">
                    <Download className="w-3 h-3" />
                    <span>{app.installs}</span>
                  </div>
                </div>

                {/* Bottom line: Cloud Fortified + Action Button */}
                <div className="flex items-center justify-between pt-1">
                  {/* Cloud fortified emblem */}
                  {app.cloudFortified && (
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0052CC]">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0052CC]">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm-4 0h2v2H7V7zm8 0h2v2h-2V7zm-4 4h2v6h-2v-6zm-4 2h2v4H7v-4zm8 0h2v4h-2v-4z"/>
                      </svg>
                      <span>Cloud Fortified</span>
                    </div>
                  )}

                  <button
                    onClick={() => toggleInstall(app.id, app.name)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                      isInstalled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-[#0052CC] hover:bg-[#0065FF] text-white shadow-xs'
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <span>Install</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#DFE1E6] rounded-lg">
          <p className="text-sm font-semibold text-[#172B4D]">No apps found matching your filters</p>
          <p className="text-xs text-[#6B778C] mt-1">Try clearing your search query or changing category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedPricing('All');
            }}
            className="mt-3 px-3.5 py-1.5 bg-[#0052CC] text-white text-xs font-bold rounded cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreAppsView;
