import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  UserCheck,
  ArrowRight,
  Clock,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';
import kanbanApi from '../services/kanbanApi';
import { getSocket } from '../services/socket';

export const NotificationCenter = ({
  user,
  onOpenTask,
  showNotificationToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Load initial notifications & subscribe to live socket notifications
  useEffect(() => {
    loadNotifications();

    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        if (showNotificationToast) {
          showNotificationToast(`🔔 ${notif.title}: ${notif.message}`);
        }
      };

      socket.on('notification:new', handleNewNotification);

      return () => {
        socket.off('notification:new', handleNewNotification);
      };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await kanbanApi.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Could not load notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await kanbanApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await kanbanApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.cardId && onOpenTask) {
      onOpenTask(notif.cardId);
      setIsOpen(false);
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-full hover:bg-[#EBECF0] text-[#42526E] cursor-pointer transition-colors"
        title="Notifications"
        id="notification-bell-btn"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#DE350B] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white border border-[#DFE1E6] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px] animate-fadeIn text-xs">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#DFE1E6] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#172B4D]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#DEEBFF] text-[#0747A6] px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#0052CC] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-1.5 border-b border-[#EBECF0] bg-[#FAFBFC] flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#0052CC] text-white font-semibold'
                  : 'text-[#42526E] hover:bg-[#EBECF0]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#0052CC] text-white font-semibold'
                  : 'text-[#42526E] hover:bg-[#EBECF0]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F4F5F7]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-[#6B778C]">
                <Bell className="w-8 h-8 mx-auto text-[#A5B2C6] mb-2 opacity-50" />
                <p className="font-medium text-[#172B4D]">No notifications to show</p>
                <p className="text-[11px] text-[#6B778C] mt-0.5">
                  You're all caught up on tasks and comments!
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    !n.isRead
                      ? 'bg-[#F4F8FD] hover:bg-[#E9F2FF]'
                      : 'hover:bg-[#FAFBFC]'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#0052CC] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {n.sender?.initials || 'SY'}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-[#172B4D] truncate text-xs">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0052CC] shrink-0" />
                      )}
                    </div>
                    <p className="text-[#42526E] text-xs mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#6B778C]">
                      <span>
                        {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {n.cardKey && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#0052CC]">
                            {n.cardKey}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="p-1 text-[#6B778C] hover:text-[#0052CC] hover:bg-white rounded cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-[#F4F5F7] border-t border-[#DFE1E6] text-center text-[11px] text-[#6B778C]">
            Real-time synchronization powered by Socket.io
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
