import { useEffect } from 'react';
import TopBar from './components/topbar/TopBar';
import LeftSidebar from './components/sidebar-left/LeftSidebar';
import RightSidebar from './components/sidebar-right/RightSidebar';
import Composer from './components/composer/Composer';
import Timeline from './components/timeline/Timeline';
import Login from './components/auth/Login';
import NotificationsPanel from './components/notifications/NotificationsPanel';
import { useStore } from './store/useStore';
import { getAPI } from './api/mastodon';
import { useMockData } from './hooks/useMockData';
import type { Status } from './types';

function App() {
  const {
    accessToken,
    instanceUrl,
    currentAccount,
    currentTimeline,
    currentTag,
    timeline,
    theme,
    setCurrentAccount,
    setTimeline,
    setTrendingTags,
    setFollowedTags,
    setInstance,
    setLoadingTimeline
  } = useStore();

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Enable mock data in development (set to false to use real API)
  useMockData(false);

  // Auto-login if we have stored credentials
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken && instanceUrl && !currentAccount && accessToken !== 'mock_access_token') {
        try {
          const api = getAPI(instanceUrl, accessToken);
          const account = await api.verifyCredentials();
          setCurrentAccount(account);
        } catch (error) {
          console.error('Failed to verify credentials:', error);
        }
      }
    };
    initAuth();
  }, [accessToken, instanceUrl, currentAccount, setCurrentAccount]);

  // Load timeline data
  useEffect(() => {
    const loadData = async () => {
      if (!accessToken || !instanceUrl || !currentAccount) return;

      try {
        const api = getAPI(instanceUrl, accessToken);

        // Load timeline
        setLoadingTimeline(true);
        let statuses: Status[] = [];
        if (currentTimeline === 'home') {
          statuses = await api.getHomeTimeline();
        } else if (currentTimeline === 'local') {
          statuses = await api.getPublicTimeline({ local: true });
        } else if (currentTimeline === 'federated') {
          statuses = await api.getPublicTimeline({ local: false });
        } else if (currentTimeline === 'tag' && currentTag) {
          statuses = await api.getTagTimeline(currentTag);
        }
        setTimeline(statuses);
        setLoadingTimeline(false);

        // Load trending tags
        const trending = await api.getTrendingTags();
        setTrendingTags(trending);

        // Load followed tags
        const followed = await api.getFollowedTags();
        setFollowedTags(followed);

        // Load instance info
        const instance = await api.getInstance();
        setInstance(instance);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoadingTimeline(false);
      }
    };

    loadData();
  }, [accessToken, instanceUrl, currentAccount, currentTimeline, currentTag, setTimeline, setTrendingTags, setFollowedTags, setInstance, setLoadingTimeline]);

  // Stream real-time updates
  useEffect(() => {
    if (!accessToken || !instanceUrl || !currentAccount || timeline.length === 0) return;

    const api = getAPI(instanceUrl, accessToken);

    // Determine which stream to connect to
    let streamType: 'user' | 'public' | 'public:local' | 'hashtag' | 'hashtag:local';
    let tag: string | undefined;

    if (currentTimeline === 'home') {
      streamType = 'user';
    } else if (currentTimeline === 'local') {
      streamType = 'public:local';
    } else if (currentTimeline === 'federated') {
      streamType = 'public';
    } else if (currentTimeline === 'tag' && currentTag) {
      streamType = 'hashtag';
      tag = currentTag;
    } else {
      return; // Unknown timeline type
    }

    // Connect to streaming API
    const cleanup = api.streamTimeline(
      streamType,
      (newStatus: Status) => {
        // Add new status to the end of the timeline (bottom)
        setTimeline([...timeline, newStatus]);
      },
      (deletedId: string) => {
        // Remove deleted status from timeline
        setTimeline(timeline.filter((s: Status) => s.id !== deletedId));
      },
      tag
    );

    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [accessToken, instanceUrl, currentAccount, currentTimeline, currentTag, setTimeline, timeline.length]);

  // Show login screen if not authenticated
  if (!accessToken || !instanceUrl) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-mirc-panel dark:bg-gray-900 p-1">
      {/* Development environment banner */}
      {import.meta.env.DEV && (
        <div className="bg-mirc-orange dark:bg-orange-900 text-white text-[10px] px-2 py-0.5 font-mirc text-center border-b border-gray-300 dark:border-gray-700">
          ⚠ DEVELOPMENT MODE - localhost:{window.location.port || '5173'}
        </div>
      )}
      <TopBar />

      <div className="max-w-[1600px] mx-auto flex gap-1 mt-1">
        {/* Left Sidebar - Hidden on mobile (<800px), shown on tablet+ */}
        <div className="hidden md:block">
          <LeftSidebar />
        </div>

        {/* Center Column - Always visible */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto">
            <Timeline />
            <Composer />
          </div>
        </main>

        {/* Right Sidebar - Hidden on small screens (<1040px), shown on large screens */}
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      </div>

      {/* Notifications modal */}
      <NotificationsPanel />
    </div>
  );
}

export default App;
