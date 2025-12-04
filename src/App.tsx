import { useEffect, useState } from 'react';
import TopBar from './components/topbar/TopBar';
import LeftSidebar from './components/sidebar-left/LeftSidebar';
import RightSidebar from './components/sidebar-right/RightSidebar';
import Composer from './components/composer/Composer';
import Timeline from './components/timeline/Timeline';
import Login from './components/auth/Login';
import NotificationsPanel from './components/notifications/NotificationsPanel';
import KeyboardShortcutsHelp from './components/help/KeyboardShortcutsHelp';
import { useStore } from './store/useStore';
import { getAPI } from './api/mastodon';
import { useMockData } from './hooks/useMockData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { Status } from './types';
import { VERSION_INFO } from './version';

function App() {
  const {
    accessToken,
    instanceUrl,
    currentAccount,
    currentTimeline,
    currentTag,
    theme,
    showNotifications,
    setCurrentAccount,
    setTimeline,
    appendToTimeline,
    removeFromTimeline,
    setTrendingTags,
    setFollowedTags,
    setInstance,
    setLoadingTimeline,
    setCurrentTimeline,
    setShowNotifications,
    toggleTheme,
  } = useStore();

  const [showHelp, setShowHelp] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '?',
      handler: () => setShowHelp(true),
      description: 'Show keyboard shortcuts help',
    },
    {
      key: 'Escape',
      handler: () => {
        setShowHelp(false);
        setShowNotifications(false);
      },
      description: 'Close modals',
    },
    {
      key: 'c',
      handler: () => {
        // Focus composer
        const textarea = document.querySelector('textarea[placeholder*="toot"]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          // Scroll to composer
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      description: 'Compose new post',
    },
    {
      key: '/',
      handler: () => {
        // Focus search
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search',
    },
    {
      key: 'h',
      handler: () => setCurrentTimeline('home'),
      description: 'Go to home timeline',
    },
    {
      key: 'l',
      handler: () => setCurrentTimeline('local'),
      description: 'Go to local timeline',
    },
    {
      key: 'f',
      handler: () => setCurrentTimeline('federated'),
      description: 'Go to federated timeline',
    },
    {
      key: 'n',
      handler: () => setShowNotifications(!showNotifications),
      description: 'Toggle notifications',
    },
    {
      key: 't',
      handler: () => toggleTheme(),
      description: 'Toggle theme',
    },
    {
      key: 'r',
      handler: () => window.location.reload(),
      description: 'Refresh page',
    },
  ], !showHelp); // Disable shortcuts when help is showing

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
    if (!accessToken || !instanceUrl || !currentAccount) return;

    // Add a small delay to avoid rapid reconnections in React Strict Mode
    let isMounted = true;
    let cleanup: (() => void) | null = null;

    const connect = () => {
      if (!isMounted) return;

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

      console.log('[App] Starting WebSocket connection for timeline:', currentTimeline);

      // Connect to streaming API
      cleanup = api.streamTimeline(
        streamType,
        (newStatus: Status) => {
          console.log('[App] Received new status via WebSocket:', newStatus.id);
          appendToTimeline(newStatus);
        },
        (deletedId: string) => {
          console.log('[App] Received delete via WebSocket:', deletedId);
          removeFromTimeline(deletedId);
        },
        tag
      );
    };

    // Small delay to avoid rapid reconnections during React Strict Mode double-mounting
    const timeout = setTimeout(connect, 100);

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[App] Cleaning up WebSocket connection');
      isMounted = false;
      clearTimeout(timeout);
      if (cleanup) {
        cleanup();
      }
    };
  }, [accessToken, instanceUrl, currentAccount, currentTimeline, currentTag, appendToTimeline, removeFromTimeline]);

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

      {/* Keyboard shortcuts help */}
      {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />}

      {/* Version footer */}
      <footer className="text-center py-2 text-[9px] text-mirc-gray dark:text-gray-600">
        FediWire v{VERSION_INFO.hash} · Built {new Date(VERSION_INFO.buildDate).toLocaleString()}
      </footer>
    </div>
  );
}

export default App;
