import Navigation from './Navigation';
import { useStore } from '../../store/useStore';

export default function LeftSidebar() {
  const { currentAccount } = useStore();

  return (
    <aside className="w-48 flex flex-col gap-1" style={{ height: 'calc(100vh - 80px)' }}>
      {/* User window */}
      <div className="irc-window overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mirc-titlebar text-[11px] bg-blue-700 dark:bg-blue-900 text-white">User Info</div>
        <div className="mirc-panel p-1 text-[10px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {currentAccount ? (
            <>
              <div className="font-bold text-mirc-blue dark:text-blue-400">{currentAccount.display_name}</div>
              <div className="text-mirc-gray dark:text-gray-400">@{currentAccount.username}</div>
              <div className="mt-1 text-mirc-green dark:text-green-400">● Connected</div>
            </>
          ) : (
            <div className="text-mirc-gray dark:text-gray-400">○ Not connected</div>
          )}
        </div>
      </div>

      {/* Channels window */}
      <div className="irc-window overflow-hidden flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mirc-titlebar text-[11px] bg-blue-700 dark:bg-blue-900 text-white">Channels</div>
        <div className="mirc-panel h-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <Navigation />
        </div>
      </div>
    </aside>
  );
}
