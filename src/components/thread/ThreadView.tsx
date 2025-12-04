import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getAPI } from '../../api/mastodon';
import type { Status } from '../../types';
import Post from '../post/Post';

interface ThreadViewProps {
  statusId: string;
  onClose: () => void;
}

export default function ThreadView({ statusId, onClose }: ThreadViewProps) {
  const { accessToken, instanceUrl } = useStore();
  const [loading, setLoading] = useState(true);
  const [ancestors, setAncestors] = useState<Status[]>([]);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [descendants, setDescendants] = useState<Status[]>([]);

  useEffect(() => {
    const loadThread = async () => {
      if (!accessToken || !instanceUrl) return;

      try {
        setLoading(true);
        const api = getAPI(instanceUrl, accessToken);

        // Fetch the status and its context in parallel
        const [status, context] = await Promise.all([
          api.getStatus(statusId),
          api.getStatusContext(statusId),
        ]);

        setCurrentStatus(status);
        setAncestors(context.ancestors);
        setDescendants(context.descendants);
      } catch (error) {
        console.error('Failed to load thread:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThread();
  }, [statusId, accessToken, instanceUrl]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Build thread as a flat list: ancestors -> current -> descendants
  const threadPosts = [
    ...ancestors,
    ...(currentStatus ? [currentStatus] : []),
    ...descendants,
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded shadow-lg max-w-3xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="mirc-titlebar text-[11px] flex items-center justify-between bg-blue-700 dark:bg-blue-900 text-white px-2 py-1">
          <span>Thread View</span>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-600 dark:hover:bg-blue-800 px-2 rounded"
          >
            ✕
          </button>
        </div>

        {/* Thread content */}
        <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="text-mirc-gray dark:text-gray-400 text-center p-4 text-[11px]">
              * Loading thread...
            </div>
          ) : threadPosts.length === 0 ? (
            <div className="text-mirc-gray dark:text-gray-400 text-center p-4 text-[11px]">
              * No posts in thread
            </div>
          ) : (
            <div className="space-y-0">
              {threadPosts.map((status, index) => {
                const isCurrentPost = status.id === statusId;
                return (
                  <div
                    key={status.id}
                    className={isCurrentPost ? 'bg-blue-50/30 dark:bg-blue-950/30 border-l-2 border-mirc-blue dark:border-blue-500' : ''}
                  >
                    {/* Show thread connection lines */}
                    {index > 0 && (
                      <div className="flex items-center gap-2 py-0.5 px-1">
                        <div className="w-4 border-l-2 border-t-2 border-gray-300 dark:border-gray-600 h-2"></div>
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                    )}
                    <Post status={status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="mirc-panel text-[10px] px-2 py-1 border-t-2 border-gray-200 dark:border-gray-600 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
          <span className="text-mirc-gray dark:text-gray-400">
            {threadPosts.length} {threadPosts.length === 1 ? 'post' : 'posts'} in thread
          </span>
          <button
            onClick={onClose}
            className="px-2 py-0.5 text-mirc-blue dark:text-blue-400 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
