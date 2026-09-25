import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Bookmark,
  Clock,
  User,
  ArrowRight,
  Filter,
  Zap,
  Layers,
  Sparkles,
  Command,
} from 'lucide-react';
import kanbanApi from '../services/kanbanApi';

export const SearchEngineModal = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isFromCache, setIsFromCache] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      performSearch(query, statusFilter, priorityFilter);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const performSearch = async (q, status, priority) => {
    try {
      setIsLoading(true);
      const res = await kanbanApi.searchCards({
        q,
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        limit: 25,
      });

      if (res && res.cards) {
        setResults(res.cards);
        setTotalMatches(res.totalMatches || res.cards.length);
        setIsFromCache(!!res._fromCache);
        setSelectedIndex(0);
      }
    } catch (err) {
      console.warn('Search query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(val, statusFilter, priorityFilter);
    }, 220);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    performSearch(query, status, priorityFilter);
  };

  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    performSearch(query, statusFilter, priority);
  };

  // Keyboard navigation: Arrow Up, Arrow Down, Enter to open, Escape to close
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectTask(results[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-[#DFE1E6] overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="relative border-b border-[#DFE1E6] flex items-center px-4 py-3 bg-white">
          <Search className="w-5 h-5 text-[#6B778C] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search tasks, descriptions, keys, or assignees..."
            className="w-full text-[14px] text-[#172B4D] placeholder-[#6B778C] outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="p-1 text-[#6B778C] hover:text-[#172B4D] rounded mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[#6B778C] bg-[#EBECF0] rounded border border-[#DFE1E6]">
            ESC
          </kbd>
        </div>

        {/* Filter Chips Bar */}
        <div className="px-4 py-2 border-b border-[#EBECF0] bg-[#FAFBFC] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#6B778C] font-semibold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Status:
          </span>
          {['all', 'To Do', 'In Progress', 'Done'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-[#0052CC] text-white'
                  : 'bg-[#EBECF0] text-[#42526E] hover:bg-[#DFE1E6]'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}

          <span className="text-[#DFE1E6] mx-1">|</span>

          <span className="text-[#6B778C] font-semibold text-[11px] uppercase tracking-wider shrink-0">
            Priority:
          </span>
          {['all', 'Urgent', 'High', 'Medium', 'Low'].map((pr) => (
            <button
              key={pr}
              onClick={() => handlePriorityFilterChange(pr)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                priorityFilter === pr
                  ? 'bg-[#172B4D] text-white'
                  : 'bg-[#EBECF0] text-[#42526E] hover:bg-[#DFE1E6]'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F4F5F7] max-h-[460px]">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-[#6B778C] gap-2">
              <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Querying tasks database & cache engine...</span>
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="py-14 text-center text-[#6B778C]">
              <Layers className="w-8 h-8 mx-auto text-[#A5B2C6] mb-2" />
              <p className="text-sm font-medium text-[#172B4D]">No matching tasks found</p>
              <p className="text-xs text-[#6B778C] mt-1">
                Try searching by task key (e.g., KAN-1) or different keywords.
              </p>
            </div>
          )}

          {!isLoading &&
            results.map((task, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#E9F2FF] border-l-4 border-l-[#0052CC]' : 'hover:bg-[#FAFBFC]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">
                      {task.iconType === 'story' ? (
                        <Bookmark className="w-4 h-4 text-[#36B37E]" />
                      ) : (
                        <CheckSquare className="w-4 h-4 text-[#0052CC]" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0052CC] tracking-wide shrink-0">
                          {task.key || task.id}
                        </span>
                        <h4 className="text-sm font-medium text-[#172B4D] truncate">
                          {task.title}
                        </h4>
                      </div>
                      {task.description && (
                        <p className="text-xs text-[#6B778C] truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        task.status === 'Done'
                          ? 'bg-[#E3FCEF] text-[#006644]'
                          : task.status === 'In Progress'
                          ? 'bg-[#DEEBFF] text-[#0747A6]'
                          : 'bg-[#EBECF0] text-[#42526E]'
                      }`}
                    >
                      {task.status}
                    </span>

                    {task.assignedTo ? (
                      <div
                        className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                        title={task.assignedTo.name}
                      >
                        {task.assignedTo.initials || 'US'}
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-[#EBECF0] text-[#6B778C] text-[10px] flex items-center justify-center shrink-0"
                        title="Unassigned"
                      >
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#0052CC] translate-x-1' : 'text-[#A5B2C6]'}`} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer with Cache Engine & Shortcut Status */}
        <div className="px-4 py-2.5 bg-[#F4F5F7] border-t border-[#DFE1E6] flex items-center justify-between text-xs text-[#6B778C]">
          <div className="flex items-center gap-2">
            <span>
              Matches: <strong className="text-[#172B4D]">{totalMatches}</strong>
            </span>
            {isFromCache ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#006644] bg-[#E3FCEF] px-1.5 py-0.5 rounded">
                <Zap className="w-3 h-3 text-[#36B37E]" />
                Redis Cache Hit
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0747A6] bg-[#DEEBFF] px-1.5 py-0.5 rounded">
                <Layers className="w-3 h-3 text-[#0052CC]" />
                MongoDB Query
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span>Navigate: <kbd className="font-mono bg-white px-1 rounded border border-[#DFE1E6]">↑</kbd> <kbd className="font-mono bg-white px-1 rounded border border-[#DFE1E6]">↓</kbd></span>
            <span>Open: <kbd className="font-mono bg-white px-1 rounded border border-[#DFE1E6]">↵</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchEngineModal;
