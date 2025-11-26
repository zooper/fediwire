import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { mockAccount, mockStatuses, mockTrendingTags, mockFollowedTags } from '../utils/mockData';

/**
 * Development hook to populate the store with mock data
 * This allows testing the UI without connecting to a real Mastodon instance
 */
export function useMockData(enabled: boolean = false) {
  const {
    setCurrentAccount,
    setAccessToken,
    setInstanceUrl,
    setTimeline,
    setTrendingTags,
    setFollowedTags,
  } = useStore();

  useEffect(() => {
    if (enabled && import.meta.env.DEV) {
      // Set mock authentication
      setAccessToken('mock_access_token');
      setInstanceUrl('https://mastodon.social');
      setCurrentAccount(mockAccount);

      // Populate timeline with mock data
      setTimeline(mockStatuses);

      // Populate trending and followed tags
      setTrendingTags(mockTrendingTags);
      setFollowedTags(mockFollowedTags);

      console.log('Mock data loaded for development');
    }
  }, [enabled, setCurrentAccount, setAccessToken, setInstanceUrl, setTimeline, setTrendingTags, setFollowedTags]);
}
