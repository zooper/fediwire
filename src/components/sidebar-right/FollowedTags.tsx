import { useStore } from '../../store/useStore';

export default function FollowedTags() {
  const { followedTags, setCurrentTimeline } = useStore();

  if (followedTags.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">Followed Tags</h2>
      <div className="space-y-2">
        {followedTags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => setCurrentTimeline('tag', tag.name)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-mastodon-blue font-medium">#{tag.name}</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
