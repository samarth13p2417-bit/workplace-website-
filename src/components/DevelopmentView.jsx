import React, { useState } from 'react';
import {
  Info,
  GitPullRequest,
  GitBranch,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ShieldAlert,
  Bug,
  Plus,
  ExternalLink,
  ChevronRight,
  Plug,
  Sparkles,
  RefreshCw,
  Check,
  Server,
  Layers,
  ArrowUpRight,
  Cpu
} from 'lucide-react';

export const DevelopmentView = ({ teamName = 'My Software Team', user, showNotification }) => {
  const [activeSubTab, setActiveSubTab] = useState('Connections');
  const [connectedTools, setConnectedTools] = useState({
    github: false,
    bitbucket: false,
    gitlab: false,
  });
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedToolToConnect, setSelectedToolToConnect] = useState(null);
  const [repoNameInput, setRepoNameInput] = useState('');
  const [hoveredMetric, setHoveredMetric] = useState(null);

  // Dynamic metrics that update when tools are connected
  const isAnyConnected = Object.values(connectedTools).some(Boolean);

  const metricsRow1 = [
    {
      id: 'work_items_completed',
      title: 'Work items',
      hasInfo: true,
      infoText: 'Total issues and user stories completed in the current sprint cycle.',
      value: isAnyConnected ? '8' : '0',
      subtitle: 'Completed this week',
    },
    {
      id: 'pr_cycle_time',
      title: 'Pull request cycle time',
      hasInfo: true,
      infoText: 'Median time from first commit on a branch to merged pull request.',
      value: isAnyConnected ? '3.2h' : '0',
      subtitle: 'Rolling 7-day median',
    },
    {
      id: 'lead_time',
      title: 'Lead time for changes',
      hasInfo: true,
      infoText: 'Average duration required for committed code to reach successful production deployment.',
      value: isAnyConnected ? '1.4d' : '0',
      subtitle: 'Rolling 12-week average',
    },
    {
      id: 'deploy_frequency',
      title: 'Deployment frequency',
      hasInfo: true,
      infoText: 'Frequency at which code is deployed to staging and production environments.',
      value: isAnyConnected ? '14/w' : '0',
      subtitle: 'Weekly average',
    },
  ];

  const metricsRow2 = [
    {
      id: 'work_items_overdue',
      title: 'Work items',
      hasInfo: true,
      infoText: 'Items past their scheduled target delivery date.',
      value: '0',
      subtitle: 'Overdue',
    },
    {
      id: 'work_items_reopened',
      title: 'Work items',
      hasInfo: true,
      infoText: 'Items previously marked done that required reopening.',
      value: '0',
      subtitle: 'Reopened',
    },
    {
      id: 'bugs_open',
      title: 'Bugs',
      hasInfo: true,
      infoText: 'Unresolved bug reports currently logged in backlog.',
      value: isAnyConnected ? '2' : '0',
      subtitle: 'Open',
    },
    {
      id: 'pull_requests_open',
      title: 'Pull requests',
      hasInfo: false,
      value: isAnyConnected ? '4' : '0',
      subtitle: 'Open',
    },
    {
      id: 'vulnerabilities_critical',
      title: 'Vulnerabilities',
      hasInfo: false,
      value: '0',
      subtitle: 'Critical',
    },
  ];

  const subTabs = [
    'Connections',
    'Pull requests',
    'Repositories',
    'Vulnerabilities',
    'Deployments',
    'Work suggestions',
  ];

  const handleConnectTool = (toolKey) => {
    setSelectedToolToConnect(toolKey);
    setRepoNameInput(`${teamName.toLowerCase().replace(/\s+/g, '-')}-core`);
    setIsConnectModalOpen(true);
  };

  const confirmToolConnection = () => {
    if (selectedToolToConnect) {
      setConnectedTools((prev) => ({ ...prev, [selectedToolToConnect]: true }));
      setIsConnectModalOpen(false);
      if (showNotification) {
        showNotification(
          `Successfully connected ${
            selectedToolToConnect.toUpperCase()
          } to ${teamName}!`
        );
      }
    }
  };

  const handleDisconnectTool = (toolKey) => {
    setConnectedTools((prev) => ({ ...prev, [toolKey]: false }));
    if (showNotification) {
      showNotification(`Disconnected ${toolKey.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-7 pb-12 animate-fadeIn select-none">
      {/* 1. KEY METRICS HEADER */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-[#172B4D] tracking-tight">Key metrics</h2>
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#F3F0FF] text-[#6554C0] rounded">
            Beta
          </span>
        </div>

        {/* First Row: 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {metricsRow1.map((metric) => (
            <div
              key={metric.id}
              className="bg-white border border-[#DFE1E6] rounded-md p-4 shadow-[0_1px_1px_rgba(9,30,66,0.08)] hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[105px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#172B4D] flex items-center gap-1.5">
                  {metric.title}
                  {metric.hasInfo && (
                    <span
                      className="relative cursor-help"
                      onMouseEnter={() => setHoveredMetric(metric.id)}
                      onMouseLeave={() => setHoveredMetric(null)}
                    >
                      <Info className="w-3.5 h-3.5 text-[#6B778C] hover:text-[#172B4D]" />
                      {hoveredMetric === metric.id && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-48 bg-[#172B4D] text-white text-[11px] p-2 rounded shadow-xl z-30 leading-snug">
                          {metric.infoText}
                        </div>
                      )}
                    </span>
                  )}
                </span>
              </div>

              <div className="mt-1">
                <span className="text-[28px] font-bold text-[#172B4D] leading-none tracking-tight">
                  {metric.value}
                </span>
              </div>

              <div className="mt-1">
                <span className="text-[12px] text-[#6B778C]">{metric.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Second Row: 5 Smaller Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {metricsRow2.map((metric) => (
            <div
              key={metric.id}
              className="bg-white border border-[#DFE1E6] rounded-md p-3.5 shadow-[0_1px_1px_rgba(9,30,66,0.08)] hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[96px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#172B4D] flex items-center gap-1.5 truncate">
                  {metric.title}
                  {metric.hasInfo && (
                    <span
                      className="relative cursor-help"
                      onMouseEnter={() => setHoveredMetric(metric.id)}
                      onMouseLeave={() => setHoveredMetric(null)}
                    >
                      <Info className="w-3.5 h-3.5 text-[#6B778C] hover:text-[#172B4D]" />
                      {hoveredMetric === metric.id && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-44 bg-[#172B4D] text-white text-[11px] p-2 rounded shadow-xl z-30 leading-snug">
                          {metric.infoText}
                        </div>
                      )}
                    </span>
                  )}
                </span>
              </div>

              <div className="mt-1">
                <span className="text-[24px] font-bold text-[#172B4D] leading-none">
                  {metric.value}
                </span>
              </div>

              <div className="mt-1">
                <span className="text-[12px] text-[#6B778C] truncate">{metric.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CONNECTIONS NAVIGATION & CONTENT */}
      <div className="space-y-4 pt-2">
        {/* Connections Header + Sub-Tabs Row */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#DFE1E6]/60">
          <h2 className="text-[17px] font-bold text-[#172B4D]">Connections</h2>

          {/* Sub-tab pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-[#F4F5F7] p-0.5 rounded-md border border-[#DFE1E6]/70">
              {subTabs.map((tab) => {
                const isActive = activeSubTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0052CC] shadow-xs border border-[#DFE1E6]'
                        : 'text-[#42526E] hover:text-[#172B4D] hover:bg-white/50 border border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Plug Icon Button */}
            <button
              onClick={() => handleConnectTool('github')}
              title="Add Integration"
              className="p-1.5 rounded border border-[#DFE1E6] hover:bg-[#FAFBFC] text-[#42526E] cursor-pointer shadow-xs"
            >
              <Plug className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SUBTAB 1: CONNECTIONS (MATCHING THE SCREENSHOT) */}
        {activeSubTab === 'Connections' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
            {/* Left 8 Columns: Source code management & tool connect cards */}
            <div className="lg:col-span-8 space-y-3">
              <div>
                <h3 className="text-[14px] font-bold text-[#172B4D]">Source code management</h3>
                <p className="text-xs text-[#6B778C] mt-0.5">
                  Link your tools to automatically map commits and pull requests to your work items.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 1. GitHub Card */}
                <div
                  onClick={() => handleConnectTool('github')}
                  className={`border-2 border-dashed rounded-lg p-7 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group bg-white ${
                    connectedTools.github
                      ? 'border-[#36B37E] bg-[#E3FCEF]/10'
                      : 'border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#FAFBFC]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#181717] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {/* GitHub SVG */}
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  </div>

                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[#172B4D] group-hover:text-[#0052CC]">
                      GitHub
                    </p>
                    <p className="text-[11px] text-[#6B778C]">
                      {connectedTools.github ? 'Connected to organization' : 'Connect repository'}
                    </p>
                  </div>

                  {connectedTools.github ? (
                    <span className="px-2 py-0.5 bg-[#E3FCEF] text-[#006644] text-[11px] font-bold rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#0052CC] group-hover:underline">
                      Link account →
                    </span>
                  )}
                </div>

                {/* 2. Bitbucket / GitLab Card (Matching the green icon in screenshot) */}
                <div
                  onClick={() => handleConnectTool('bitbucket')}
                  className={`border-2 border-dashed rounded-lg p-7 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group bg-white ${
                    connectedTools.bitbucket
                      ? 'border-[#36B37E] bg-[#E3FCEF]/10'
                      : 'border-[#DFE1E6] hover:border-[#0052CC] hover:bg-[#FAFBFC]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-[#2684FF] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-2">
                    {/* Bitbucket Icon */}
                    <svg className="w-8 h-8 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M2.583 3.417c-.473 0-.877.34-.963.805L.034 18.232a.987.987 0 00.963 1.168h18.29a.987.987 0 00.964-.813l2.716-14.365a.986.986 0 00-.964-1.172H2.583zm9.646 11.23H8.38l-1.025-5.59h6.897l-2.023 5.59z" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-[#172B4D] group-hover:text-[#0052CC]">
                      Bitbucket
                    </p>
                    <p className="text-[11px] text-[#6B778C]">
                      {connectedTools.bitbucket ? 'Connected workspace' : 'Connect cloud workspace'}
                    </p>
                  </div>

                  {connectedTools.bitbucket ? (
                    <span className="px-2 py-0.5 bg-[#E3FCEF] text-[#006644] text-[11px] font-bold rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#0052CC] group-hover:underline">
                      Link account →
                    </span>
                  )}
                </div>
              </div>

              {/* Extra integrations hint */}
              <div className="flex items-center justify-between p-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-md text-xs text-[#42526E]">
                <div className="flex items-center gap-2">
                  <Plug className="w-4 h-4 text-[#0052CC]" />
                  <span>Looking for GitLab, Azure DevOps, Jenkins or Snyk?</span>
                </div>
                <button
                  onClick={() => handleConnectTool('gitlab')}
                  className="font-semibold text-[#0052CC] hover:underline cursor-pointer"
                >
                  Explore apps
                </button>
              </div>
            </div>

            {/* Right 4 Columns: Onboarding / Status Checklist Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-[0_1px_2px_rgba(9,30,66,0.1)] space-y-3.5">
                {/* Step 1: Source code management */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <span className="text-[13px] font-semibold text-[#172B4D]">
                      Source code management
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                      isAnyConnected
                        ? 'bg-[#E3FCEF] text-[#006644]'
                        : 'bg-[#EBECF0] text-[#42526E]'
                    }`}
                  >
                    {isAnyConnected ? 'Connected' : 'Not set up'}
                  </span>
                </div>

                {/* Step 2: Coding agents */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#DEEBFF] text-[#0052CC] font-bold text-[11px] flex items-center justify-center">
                      2
                    </span>
                    <span className="text-[13px] font-semibold text-[#172B4D]">
                      Coding agents
                    </span>
                  </div>

                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#EBECF0] text-[#42526E] rounded">
                    Not set up
                  </span>
                </div>

                {/* Informational Callout Box (Blue highlight box matching screenshot) */}
                <div className="p-3 bg-[#DEEBFF]/60 border border-[#B3D4FF] rounded-lg flex items-start gap-2.5 text-[#0747A6] text-xs leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-[#0052CC] mt-0.5" />
                  <span>
                    Coding agents can't generate code or pull requests without source code management connected.
                  </span>
                </div>

                {/* Quick Action Button */}
                {!isAnyConnected ? (
                  <button
                    onClick={() => handleConnectTool('github')}
                    className="w-full py-2 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded-[3px] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Connect your first tool</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-center pt-1">
                    <button
                      onClick={() => handleConnectTool('github')}
                      className="text-xs text-[#0052CC] font-semibold hover:underline"
                    >
                      + Connect additional repository
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: DEPLOYMENTS VIEW (PIPELINES & ENVIRONMENTS) */}
        {activeSubTab === 'Deployments' && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-xs space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#172B4D]">Deployment Environments</h3>
                <p className="text-xs text-[#6B778C]">
                  Track pipeline health, releases, and rollback targets across all deployment tiers.
                </p>
              </div>
              <button
                onClick={() => showNotification('Triggering production deployment verification...')}
                className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white text-xs font-semibold rounded-[3px] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Deploy release</span>
              </button>
            </div>

            {/* Environments Pipeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Development Environment */}
              <div className="border border-[#DFE1E6] rounded-lg p-4 bg-[#FAFBFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">Development</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E3FCEF] text-[#006644] rounded-full">
                    Healthy
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#172B4D]">v2.14.0-dev.82</p>
                  <p className="text-xs text-[#6B778C]">Deployed 12m ago by Antigravity Agent</p>
                </div>
                <div className="text-xs text-[#0052CC] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                  <span>View build logs</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Staging Environment */}
              <div className="border border-[#DFE1E6] rounded-lg p-4 bg-[#FAFBFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">Staging</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E3FCEF] text-[#006644] rounded-full">
                    Passing tests
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#172B4D]">v2.13.9-rc.1</p>
                  <p className="text-xs text-[#6B778C]">Deployed 2h ago from main</p>
                </div>
                <div className="text-xs text-[#0052CC] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                  <span>Run E2E smoke tests</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Production Environment */}
              <div className="border border-[#DFE1E6] rounded-lg p-4 bg-[#FAFBFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5E6C84]">Production</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E3FCEF] text-[#006644] rounded-full">
                    99.98% uptime
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#172B4D]">v2.13.0 (Live)</p>
                  <p className="text-xs text-[#6B778C]">Active rollout across 3 clusters</p>
                </div>
                <div className="text-xs text-[#0052CC] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                  <span>View metrics & tracing</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: PULL REQUESTS */}
        {activeSubTab === 'Pull requests' && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#172B4D]">Active Pull Requests</h3>
              <span className="text-xs text-[#6B778C]">Mapped to Jira workspace tickets</span>
            </div>

            <div className="divide-y divide-[#DFE1E6]">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="w-4 h-4 text-[#36B37E]" />
                  <div>
                    <p className="text-xs font-bold text-[#172B4D] hover:text-[#0052CC] cursor-pointer">
                      fix(auth): implement SSO account chooser flow
                    </p>
                    <p className="text-[11px] text-[#6B778C]">
                      #42 opened 2 hours ago by <span className="font-semibold text-[#172B4D]">antigravity</span> · KAN-1
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E3FCEF] text-[#006644] rounded">
                  2 Approvals
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="w-4 h-4 text-[#0052CC]" />
                  <div>
                    <p className="text-xs font-bold text-[#172B4D] hover:text-[#0052CC] cursor-pointer">
                      feat(dev-view): add key metrics and connections panel
                    </p>
                    <p className="text-[11px] text-[#6B778C]">
                      #43 opened 45m ago by <span className="font-semibold text-[#172B4D]">lead-dev</span> · KAN-2
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC] rounded">
                  Review Requested
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: REPOSITORIES */}
        {activeSubTab === 'Repositories' && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-[#172B4D]">Linked Repositories</h3>
            <div className="p-4 border border-[#DFE1E6] rounded-lg flex items-center justify-between bg-[#FAFBFC]">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-[#0052CC]" />
                <div>
                  <p className="text-xs font-bold text-[#172B4D]">{teamName.toLowerCase().replace(/\s+/g, '-')}-service</p>
                  <p className="text-[11px] text-[#6B778C]">Default branch: main · 142 commits synced</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#36B37E] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Syncing Active
              </span>
            </div>
          </div>
        )}

        {/* SUBTAB 5: VULNERABILITIES */}
        {activeSubTab === 'Vulnerabilities' && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-[#172B4D]">Security & Vulnerability Scans</h3>
            <div className="p-6 bg-[#E3FCEF]/30 border border-[#36B37E]/40 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#36B37E]" />
              <div>
                <p className="text-xs font-bold text-[#006644]">No critical vulnerabilities detected</p>
                <p className="text-[11px] text-[#6B778C]">Dependabot & CodeQL scans passing on latest commit.</p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: WORK SUGGESTIONS */}
        {activeSubTab === 'Work suggestions' && (
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6554C0]" />
              <h3 className="text-base font-bold text-[#172B4D]">Atlassian Intelligence Work Suggestions</h3>
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-[#F3F0FF]/40 border border-[#6554C0]/20 rounded-md text-xs text-[#172B4D] flex items-center justify-between">
                <span>Map 2 unlinked commits in PR #42 to sprint issue KAN-1</span>
                <button 
                  onClick={() => showNotification('Applied AI commit mapping')}
                  className="px-2.5 py-1 bg-[#6554C0] text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. TOOL CONNECTION MODAL */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-[#DFE1E6] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <h3 className="font-bold text-[#172B4D] text-base">
                Connect {selectedToolToConnect === 'github' ? 'GitHub' : selectedToolToConnect === 'bitbucket' ? 'Bitbucket' : 'Source Control'}
              </h3>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-[#6B778C] hover:text-[#172B4D] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6B778C] leading-relaxed">
              Connect your repository to automatically sync commits, pull requests, deployments, and calculate cycle time metrics.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172B4D]">Repository Name / Organization</label>
              <input
                type="text"
                value={repoNameInput}
                onChange={(e) => setRepoNameInput(e.target.value)}
                className="w-full text-xs p-2 border border-[#DFE1E6] rounded focus:border-[#4C9AFF] focus:ring-1 focus:ring-[#4C9AFF]"
                placeholder="e.g. acme-inc/core-app"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE1E6]">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#42526E] hover:bg-[#FAFBFC] rounded font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmToolConnection}
                className="px-4 py-1.5 text-xs bg-[#0052CC] hover:bg-[#0065FF] text-white font-semibold rounded cursor-pointer shadow-xs"
              >
                Authorize & Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentView;
