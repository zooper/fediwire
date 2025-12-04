import { useStore } from '../../store/useStore';
import Post from '../post/Post';
import { useEffect, useState, useRef } from 'react';
import { getAPI } from '../../api/mastodon';

export default function Timeline() {
  const { timeline, isLoadingTimeline, currentTimeline, currentTag, accessToken, instanceUrl, lastReadStatusId, addToTimeline, markTimelineAsRead } = useStore();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // No auto-scroll needed when newest is on top

  // Infinite scroll: load more when scrolling near bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Trigger load more when within 200px of bottom
      if (scrollHeight - scrollTop - clientHeight < 200 && !isLoadingMore && timeline.length > 0) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [timeline.length, isLoadingMore]);

  // Mark timeline as read when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && timeline.length > 0) {
        markTimelineAsRead();
      }
    };

    // Mark as read initially if page is visible
    if (!document.hidden && timeline.length > 0) {
      markTimelineAsRead();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeline.length, markTimelineAsRead]);

  const loadMore = async () => {
    if (!accessToken || !instanceUrl || timeline.length === 0 || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const api = getAPI(instanceUrl, accessToken);
      // Get the oldest post (last item in array since newest is first)
      const oldestId = timeline[timeline.length - 1].id;

      const olderStatuses = await (async () => {
        if (currentTimeline === 'home') {
          return await api.getHomeTimeline({ max_id: oldestId, limit: 20 });
        } else if (currentTimeline === 'local') {
          return await api.getPublicTimeline({ local: true, max_id: oldestId, limit: 20 });
        } else if (currentTimeline === 'federated') {
          return await api.getPublicTimeline({ local: false, max_id: oldestId, limit: 20 });
        } else if (currentTimeline === 'tag' && currentTag) {
          return await api.getTagTimeline(currentTag, { max_id: oldestId, limit: 20 });
        }
        return [];
      })();

      if (olderStatuses.length > 0) {
        // Add older statuses to the timeline (they will be appended to the end)
        addToTimeline(olderStatuses);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getTimelineTitle = () => {
    if (currentTimeline === 'tag' && currentTag) {
      return `#${currentTag}`;
    }
    return `#${currentTimeline}`;
  };

  return (
    <div className="irc-window mt-1 overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Channel header with mIRC style */}
      <div className="mirc-titlebar text-[11px] flex items-center justify-between bg-blue-700 dark:bg-blue-900 text-white">
        <span>{getTimelineTitle()}</span>
        <span className="text-[10px]">{timeline.length} messages</span>
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-1 bg-white dark:bg-gray-900">
        {isLoadingTimeline ? (
          <div className="text-mirc-gray dark:text-gray-400 text-center p-4 text-[11px]">
            * Loading messages...
          </div>
        ) : timeline.length === 0 ? (
          <div className="text-mirc-gray dark:text-gray-400 text-center p-4 text-[11px]">
            * No messages in {getTimelineTitle()}
          </div>
        ) : (
          <>
            {timeline.map((status, index) => {
              // Find if this is the last read post
              const isLastRead = lastReadStatusId === status.id;
              // Check if this post is unread (comes after the last read post)
              const isUnread = lastReadStatusId
                ? timeline.findIndex(s => s.id === status.id) < timeline.findIndex(s => s.id === lastReadStatusId)
                : false;

              return (
                <div key={status.id}>
                  {isLastRead && index > 0 && (
                    <div className="flex items-center gap-2 py-1 px-1">
                      <div className="flex-1 border-t-2 border-mirc-blue dark:border-blue-500"></div>
                      <span className="text-[9px] text-mirc-blue dark:text-blue-400 font-mirc">New messages</span>
                      <div className="flex-1 border-t-2 border-mirc-blue dark:border-blue-500"></div>
                    </div>
                  )}
                  <Post status={status} isUnread={isUnread} />
                </div>
              );
            })}
            {isLoadingMore && (
              <div className="text-mirc-gray dark:text-gray-400 text-center p-2 text-[11px]">
                * Loading more messages...
              </div>
            )}
          </>
        )}
      </div>

      {/* Scrollbar indicator / status bar */}
      <div className="mirc-panel text-[10px] px-1 py-0.5 border-t-2 border-gray-200 dark:border-gray-600 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <span className="text-mirc-gray dark:text-gray-400">Ready</span>
        <button
          onClick={loadMore}
          disabled={isLoadingMore || timeline.length === 0}
          className="text-mirc-blue dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingMore ? 'Loading...' : 'Load more...'}
        </button>
      </div>
    </div>
  );
}
