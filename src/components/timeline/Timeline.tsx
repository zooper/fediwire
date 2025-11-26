import { useStore } from '../../store/useStore';
import Post from '../post/Post';
import { useRef, useEffect, useState } from 'react';
import { getAPI } from '../../api/mastodon';

export default function Timeline() {
  const { timeline, isLoadingTimeline, currentTimeline, currentTag, accessToken, instanceUrl, lastReadStatusId, setTimeline, markTimelineAsRead } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll to bottom when timeline changes
  useEffect(() => {
    if (messagesEndRef.current && timeline.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [timeline.length]);

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
      const oldestId = timeline[0].id; // Oldest post is at index 0 (before reverse)

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
        setTimeline([...olderStatuses, ...timeline]);
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
      <div className="flex-1 overflow-y-auto p-1 bg-white dark:bg-gray-900">
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
            {[...timeline].reverse().map((status, index, array) => {
              // Find if this is the last read post
              const isLastRead = lastReadStatusId === status.id;
              // Check if this post is unread (comes after the last read post)
              const isUnread = lastReadStatusId
                ? timeline.findIndex(s => s.id === status.id) > timeline.findIndex(s => s.id === lastReadStatusId)
                : false;

              return (
                <div key={status.id}>
                  {isLastRead && index < array.length - 1 && (
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
            <div ref={messagesEndRef} />
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
