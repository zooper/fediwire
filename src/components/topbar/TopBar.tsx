import { useStore } from '../../store/useStore';

export default function TopBar() {
  const { currentAccount, instanceUrl, notifications, theme, toggleTheme, logout, setShowNotifications, lastReadNotificationId } = useStore();

  // Count unread notifications (newer than last read)
  const unreadCount = notifications.findIndex(n => n.id === lastReadNotificationId);
  const unreadNotifications = unreadCount === -1 ? notifications.length : unreadCount;

  return (
    <header className="mirc-panel px-3 py-2 text-[12px] flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <span className="font-bold text-mirc-blue dark:text-blue-400">FediWire</span>
        {instanceUrl && (
          <span className="text-mirc-gray dark:text-gray-400">
            → {new URL(instanceUrl).hostname}
          </span>
        )}
      </div>

      {currentAccount && (
        <div className="flex items-center gap-3">
          <span className="text-mirc-gray dark:text-gray-400">{currentAccount.username}</span>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative px-2 py-1 text-[11px] text-mirc-gray dark:text-gray-400 hover:text-mirc-text dark:hover:text-white transition-colors"
            title="Notifications"
          >
            🔔
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] min-w-[16px] text-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="px-2 py-1 text-[11px] text-mirc-gray dark:text-gray-400 hover:text-mirc-text dark:hover:text-white transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 text-[11px] text-mirc-gray dark:text-gray-400 hover:text-mirc-text dark:hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
