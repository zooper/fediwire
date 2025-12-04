import { create } from 'zustand';
import type { Account, Status, Tag, Notification, Instance } from '../types';

export type TimelineType = 'home' | 'local' | 'federated' | 'tag';
export type FilterType = 'all' | 'media' | 'links' | 'threads';
export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';

interface AppState {
  // Authentication
  currentAccount: Account | null;
  accessToken: string | null;
  instanceUrl: string | null;

  // UI State
  currentTimeline: TimelineType;
  currentTag: string | null;
  activeFilter: FilterType;
  theme: Theme;
  fontSize: FontSize;
  replyingTo: Status | null;
  showNotifications: boolean;
  lastReadNotificationId: string | null;
  lastReadStatusId: string | null;

  // Data
  timeline: Status[];
  notifications: Notification[];
  followedTags: Tag[];
  trendingTags: Tag[];
  instance: Instance | null;

  // Loading states
  isLoadingTimeline: boolean;
  isLoadingNotifications: boolean;

  // Actions
  setCurrentAccount: (account: Account | null) => void;
  setAccessToken: (token: string | null) => void;
  setInstanceUrl: (url: string | null) => void;
  setCurrentTimeline: (timeline: TimelineType, tag?: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFontSize: (size: FontSize) => void;
  setReplyingTo: (status: Status | null) => void;
  setShowNotifications: (show: boolean) => void;
  markNotificationsAsRead: () => void;
  markTimelineAsRead: () => void;
  setTimeline: (statuses: Status[]) => void;
  addToTimeline: (statuses: Status[]) => void;
  appendToTimeline: (status: Status) => void;
  updateStatus: (statusId: string, updates: Partial<Status>) => void;
  removeFromTimeline: (statusId: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  setFollowedTags: (tags: Tag[]) => void;
  setTrendingTags: (tags: Tag[]) => void;
  setInstance: (instance: Instance | null) => void;
  setLoadingTimeline: (loading: boolean) => void;
  setLoadingNotifications: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  currentAccount: null,
  accessToken: localStorage.getItem('mastodon_token'),
  instanceUrl: localStorage.getItem('mastodon_instance'),
  currentTimeline: 'home',
  currentTag: null,
  activeFilter: 'all',
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  fontSize: (localStorage.getItem('fontSize') as FontSize) || 'medium',
  replyingTo: null,
  showNotifications: false,
  lastReadNotificationId: localStorage.getItem('lastReadNotificationId'),
  lastReadStatusId: null,
  timeline: [],
  notifications: [],
  followedTags: [],
  trendingTags: [],
  instance: null,
  isLoadingTimeline: false,
  isLoadingNotifications: false,

  // Actions
  setCurrentAccount: (account) => set({ currentAccount: account }),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('mastodon_token', token);
    } else {
      localStorage.removeItem('mastodon_token');
    }
    set({ accessToken: token });
  },

  setInstanceUrl: (url) => {
    if (url) {
      localStorage.setItem('mastodon_instance', url);
    } else {
      localStorage.removeItem('mastodon_instance');
    }
    set({ instanceUrl: url });
  },

  setCurrentTimeline: (timeline, tag) =>
    set({
      currentTimeline: timeline,
      currentTag: tag || null,
      timeline: [] // Clear timeline when switching
    }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),

  setFontSize: (size) => {
    localStorage.setItem('fontSize', size);
    set({ fontSize: size });
  },

  setReplyingTo: (status) => set({ replyingTo: status }),

  setShowNotifications: (show) => set({ showNotifications: show }),

  markNotificationsAsRead: () =>
    set((state) => {
      if (state.notifications.length > 0) {
        const latestId = state.notifications[0].id;
        localStorage.setItem('lastReadNotificationId', latestId);
        return { lastReadNotificationId: latestId };
      }
      return state;
    }),

  markTimelineAsRead: () =>
    set((state) => {
      if (state.timeline.length > 0) {
        // Get the most recent status (last item since timeline is oldest to newest)
        const latestId = state.timeline[0].id;
        return { lastReadStatusId: latestId };
      }
      return state;
    }),

  setTimeline: (statuses) => set({ timeline: statuses }),

  addToTimeline: (statuses) =>
    set((state) => ({
      timeline: [...statuses, ...state.timeline]
    })),

  appendToTimeline: (status) =>
    set((state) => {
      // Check if status already exists in timeline to prevent duplicates
      const exists = state.timeline.some(s => s.id === status.id);
      if (exists) {
        return state; // Don't add duplicate
      }
      return {
        timeline: [status, ...state.timeline]
      };
    }),

  updateStatus: (statusId, updates) =>
    set((state) => ({
      timeline: state.timeline.map((status) =>
        status.id === statusId ? { ...status, ...updates } : status
      ),
    })),

  removeFromTimeline: (statusId) =>
    set((state) => ({
      timeline: state.timeline.filter((status) => status.id !== statusId),
    })),

  setNotifications: (notifications) => set({ notifications }),

  setFollowedTags: (tags) => set({ followedTags: tags }),

  setTrendingTags: (tags) => set({ trendingTags: tags }),

  setInstance: (instance) => set({ instance }),

  setLoadingTimeline: (loading) => set({ isLoadingTimeline: loading }),

  setLoadingNotifications: (loading) => set({ isLoadingNotifications: loading }),

  logout: () => {
    localStorage.removeItem('mastodon_token');
    localStorage.removeItem('mastodon_instance');
    set({
      currentAccount: null,
      accessToken: null,
      instanceUrl: null,
      timeline: [],
      notifications: [],
      followedTags: [],
      trendingTags: [],
      instance: null,
    });
  },
}));
