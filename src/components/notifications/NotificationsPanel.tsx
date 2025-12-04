import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getAPI } from '../../api/mastodon';
import type { Notification } from '../../types';

export default function NotificationsPanel() {
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    setNotifications,
    setLoadingNotifications,
    isLoadingNotifications,
    accessToken,
    instanceUrl,
    currentAccount,
    markNotificationsAsRead,
  } = useStore();

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNotifications) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showNotifications, setShowNotifications]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!accessToken || !instanceUrl || !currentAccount || !showNotifications) return;

      setLoadingNotifications(true);
      try {
        const api = getAPI(instanceUrl, accessToken);
        const notifs = await api.getNotifications({ limit: 20 });
        setNotifications(notifs);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    if (showNotifications) {
      loadNotifications();
      // Mark as read when panel is opened
      if (notifications.length > 0) {
        markNotificationsAsRead();
      }
    }
  }, [showNotifications, accessToken, instanceUrl, currentAccount, setNotifications, setLoadingNotifications, markNotificationsAsRead, notifications.length]);

  if (!showNotifications) return null;

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case 'mention':
        return `mentioned you`;
      case 'status':
        return `posted a status`;
      case 'reblog':
        return `boosted your post`;
      case 'follow':
        return `followed you`;
      case 'follow_request':
        return `requested to follow you`;
      case 'favourite':
        return `favourited your post`;
      case 'poll':
        return `poll has ended`;
      case 'update':
        return `edited a post`;
      default:
        return `interacted with you`;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return '💬';
      case 'reblog':
        return '🔁';
      case 'favourite':
        return '⭐';
      case 'follow':
        return '👤';
      case 'follow_request':
        return '❓';
      case 'poll':
        return '📊';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16"
      onClick={() => setShowNotifications(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">Notifications</h2>
          <button
            onClick={() => setShowNotifications(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingNotifications ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
              >
                <div className="flex gap-2">
                  <span className="text-lg flex-shrink-0">{getNotificationIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
                          {notif.account.display_name || notif.account.username}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          {getNotificationText(notif)}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-500 flex-shrink-0">
                        {formatTime(notif.created_at)}
                      </span>
                    </div>
                    {notif.status && (
                      <div className="mt-1 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                        {notif.status.content.replace(/<[^>]*>/g, '')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
