import TrendingTags from './TrendingTags';
import { useStore } from '../../store/useStore';

export default function RightSidebar() {
  const { instance, instanceUrl } = useStore();

  return (
    <aside className="w-56 flex flex-col gap-1" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Server info window */}
      <div className="irc-window overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mirc-titlebar text-[11px] bg-blue-700 dark:bg-blue-900 text-white">Server Info</div>
        <div className="mirc-panel p-1 text-[10px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {instance ? (
            <>
              <div className="font-bold text-mirc-blue dark:text-blue-400">{instance.title}</div>
              <div className="text-mirc-gray dark:text-gray-400 mt-1">
                Users: {instance.stats.user_count.toLocaleString()}
              </div>
              <div className="text-mirc-gray dark:text-gray-400">
                Posts: {instance.stats.status_count.toLocaleString()}
              </div>
              <div className="mt-1 text-mirc-green dark:text-green-400">● Online</div>
            </>
          ) : instanceUrl ? (
            <>
              <div className="font-bold text-mirc-blue dark:text-blue-400">{new URL(instanceUrl).hostname}</div>
              <div className="mt-1 text-mirc-gray dark:text-gray-400">○ Connecting...</div>
            </>
          ) : (
            <div className="text-mirc-gray dark:text-gray-400">○ No server</div>
          )}
        </div>
      </div>

      {/* Trending tags window */}
      <div className="irc-window overflow-hidden flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mirc-titlebar text-[11px] bg-blue-700 dark:bg-blue-900 text-white">Trending</div>
        <div className="mirc-panel h-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <TrendingTags />
        </div>
      </div>
    </aside>
  );
}
