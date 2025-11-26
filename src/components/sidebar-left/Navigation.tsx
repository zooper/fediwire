import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getAPI } from '../../api/mastodon';
import type { TimelineType } from '../../store/useStore';

interface NavItem {
  id: TimelineType;
  label: string;
  tag?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: '#home' },
  { id: 'local', label: '#local' },
  { id: 'federated', label: '#federated' },
];

export default function Navigation() {
  const {
    currentTimeline,
    currentTag,
    setCurrentTimeline,
    followedTags,
    setFollowedTags,
    accessToken,
    instanceUrl
  } = useStore();
  const [newChannel, setNewChannel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isActive = (item: NavItem) => {
    if (item.tag) {
      return currentTimeline === 'tag' && currentTag === item.tag;
    }
    return currentTimeline === item.id && !currentTag;
  };

  const addChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagName = newChannel.trim().replace(/^#/, '');
    if (!tagName || !accessToken || !instanceUrl) return;

    setIsAdding(true);
    try {
      const api = getAPI(instanceUrl, accessToken);
      const followedTag = await api.followTag(tagName);
      setFollowedTags([...followedTags, followedTag]);
      setNewChannel('');
    } catch (error) {
      console.error('Failed to follow tag:', error);
      alert('Failed to follow tag. It may not exist or you may not have permission.');
    } finally {
      setIsAdding(false);
    }
  };

  const removeChannel = async (tagName: string) => {
    if (!accessToken || !instanceUrl) return;

    try {
      const api = getAPI(instanceUrl, accessToken);
      await api.unfollowTag(tagName);
      setFollowedTags(followedTags.filter(t => t.name !== tagName));
    } catch (error) {
      console.error('Failed to unfollow tag:', error);
    }
  };

  return (
    <div className="text-[14px] p-2">
      {/* Standard timelines */}
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentTimeline(item.id)}
          style={isActive(item) ? { backgroundColor: '#3182ce', color: '#ffffff' } : {}}
          className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all ${
            isActive(item)
              ? 'font-semibold shadow-sm'
              : 'text-mirc-darkgray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-mirc-text dark:hover:text-gray-200'
          }`}
        >
          {item.label}
        </button>
      ))}

      {/* Divider */}
      <div className="border-t border-mirc-border dark:border-gray-600 my-2"></div>

      {/* Hashtag channels (followed tags) */}
      {followedTags.map((tag) => {
        const item = { id: 'tag' as TimelineType, label: `#${tag.name}`, tag: tag.name };
        return (
          <div key={tag.name} className="flex items-center gap-1 mb-1">
            <button
              onClick={() => setCurrentTimeline('tag', tag.name)}
              style={isActive(item) ? { backgroundColor: '#3182ce', color: '#ffffff' } : {}}
              className={`flex-1 text-left px-3 py-2.5 rounded-lg transition-all ${
                isActive(item)
                  ? 'font-semibold shadow-sm'
                  : 'text-mirc-darkgray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-mirc-text dark:hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
            <button
              onClick={() => removeChannel(tag.name)}
              className="px-2 py-2.5 text-mirc-gray dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-[12px]"
              title="Unfollow tag"
            >
              ×
            </button>
          </div>
        );
      })}

      {/* Add channel form */}
      <form onSubmit={addChannel} className="mt-2">
        <input
          type="text"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
          placeholder="Follow hashtag..."
          disabled={isAdding}
          className="w-full px-3 py-2 text-[13px] border border-mirc-border dark:border-gray-600 rounded-lg focus:outline-none focus:border-mirc-blue dark:focus:border-blue-400 disabled:opacity-50 bg-white dark:bg-gray-700 text-mirc-text dark:text-gray-200"
        />
      </form>
    </div>
  );
}
