import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getAPI } from '../../api/mastodon';
import type { Account, Status } from '../../types';
import Post from '../post/Post';

interface ProfileProps {
  accountId: string;
  onClose: () => void;
}

export default function Profile({ accountId, onClose }: ProfileProps) {
  const { accessToken, instanceUrl } = useStore();
  const [account, setAccount] = useState<Account | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!accessToken || !instanceUrl) return;

      setIsLoading(true);
      try {
        const api = getAPI(instanceUrl, accessToken);
        const accountData = await api.getAccount(accountId);
        const accountStatuses = await api.getAccountStatuses(accountId);

        setAccount(accountData);
        setStatuses(accountStatuses);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [accountId, accessToken, instanceUrl]);

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

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="irc-window w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {/* Title bar */}
        <div className="mirc-titlebar text-[11px] flex items-center justify-between bg-blue-700 dark:bg-blue-900 text-white">
          <span>User Profile</span>
          <button
            onClick={onClose}
            className="px-2 hover:bg-white hover:bg-opacity-20"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
          {isLoading ? (
            <div className="text-mirc-gray dark:text-gray-400 text-center p-4">Loading profile...</div>
          ) : account ? (
            <>
              {/* Profile header */}
              <div className="mirc-panel p-4 mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <div className="flex items-start gap-4">
                  {account.avatar && (
                    <img
                      src={account.avatar}
                      alt={account.display_name}
                      className="w-20 h-20 rounded border-2 border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{account.display_name}</h1>
                    <p className="text-mirc-gray dark:text-gray-400">@{account.username}@{new URL(account.url).hostname}</p>

                    {account.note && (
                      <div className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                        {stripHtml(account.note)}
                      </div>
                    )}

                    <div className="mt-3 flex gap-4 text-sm">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{account.statuses_count}</span>{' '}
                        <span className="text-mirc-gray dark:text-gray-400">posts</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{account.following_count}</span>{' '}
                        <span className="text-mirc-gray dark:text-gray-400">following</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{account.followers_count}</span>{' '}
                        <span className="text-mirc-gray dark:text-gray-400">followers</span>
                      </div>
                    </div>

                    {account.fields && account.fields.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {account.fields.map((field, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-mirc-gray dark:text-gray-400">{field.name}:</span>{' '}
                            <span className="text-gray-800 dark:text-gray-200">{stripHtml(field.value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Recent Posts</h2>
                {statuses.length === 0 ? (
                  <div className="text-mirc-gray dark:text-gray-400 text-center p-4">No posts</div>
                ) : (
                  <div className="irc-window bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="bg-white dark:bg-gray-900">
                      {statuses.map((status) => (
                        <Post key={status.id} status={status} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-mirc-red dark:text-red-400 text-center p-4">Failed to load profile</div>
          )}
        </div>
      </div>
    </div>
  );
}
