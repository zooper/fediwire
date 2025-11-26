import { useStore } from '../../store/useStore';

export default function TrendingTags() {
  const { trendingTags, setCurrentTimeline } = useStore();

  const getTotalActivity = (tag: any) => {
    if (!tag.history || tag.history.length === 0) return { accounts: 0, uses: 0 };

    // Sum up activity from the past 2 days (history array contains daily stats)
    const recentHistory = tag.history.slice(0, 2);
    const accounts = recentHistory.reduce((sum: number, day: any) => sum + parseInt(day.accounts || 0), 0);
    const uses = recentHistory.reduce((sum: number, day: any) => sum + parseInt(day.uses || 0), 0);

    return { accounts, uses };
  };

  return (
    <div className="text-[13px] p-2">
      {trendingTags.length === 0 ? (
        <div className="text-mirc-gray dark:text-gray-400 p-2">No trending tags</div>
      ) : (
        trendingTags.slice(0, 10).map((tag) => {
          const activity = getTotalActivity(tag);
          return (
            <button
              key={tag.name}
              onClick={() => setCurrentTimeline('tag', tag.name)}
              className="w-full text-left px-3 py-2 rounded-lg mb-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-mirc-blue dark:text-blue-400 font-semibold">#{tag.name}</div>
              {activity.accounts > 0 && (
                <div className="text-mirc-gray dark:text-gray-400 text-[11px] mt-0.5">
                  {activity.accounts} {activity.accounts === 1 ? 'person' : 'people'} in the past 2 days
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
