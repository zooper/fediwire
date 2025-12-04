import type {
  Account,
  Status,
  Tag,
  Notification,
  Instance,
  SearchResults,
  Suggestion,
  Relationship,
} from '../types';

export class MastodonAPI {
  private baseUrl: string;
  private accessToken: string | null;

  constructor(instanceUrl: string, accessToken: string | null = null) {
    this.baseUrl = instanceUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // OAuth / Authentication
  async registerApp(clientName: string, redirectUris: string, scopes: string) {
    return this.fetch<{
      id: string;
      client_id: string;
      client_secret: string;
    }>('/api/v1/apps', {
      method: 'POST',
      body: JSON.stringify({
        client_name: clientName,
        redirect_uris: redirectUris,
        scopes,
      }),
    });
  }

  async getAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ) {
    return this.fetch<{ access_token: string }>('/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code,
        scope: 'read write follow push',
      }),
    });
  }

  // Account
  async verifyCredentials(): Promise<Account> {
    return this.fetch<Account>('/api/v1/accounts/verify_credentials');
  }

  async getAccount(id: string): Promise<Account> {
    return this.fetch<Account>(`/api/v1/accounts/${id}`);
  }

  async getAccountStatuses(id: string, limit: number = 20): Promise<Status[]> {
    return this.fetch<Status[]>(`/api/v1/accounts/${id}/statuses?limit=${limit}`);
  }

  async followAccount(id: string): Promise<Relationship> {
    return this.fetch<Relationship>(`/api/v1/accounts/${id}/follow`, {
      method: 'POST',
    });
  }

  async unfollowAccount(id: string): Promise<Relationship> {
    return this.fetch<Relationship>(`/api/v1/accounts/${id}/unfollow`, {
      method: 'POST',
    });
  }

  // Timelines
  async getHomeTimeline(params?: {
    max_id?: string;
    since_id?: string;
    limit?: number;
  }): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Status[]>(`/api/v1/timelines/home?${query}`);
  }

  async getPublicTimeline(params?: {
    local?: boolean;
    max_id?: string;
    since_id?: string;
    limit?: number;
  }): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Status[]>(`/api/v1/timelines/public?${query}`);
  }

  async getTagTimeline(
    tag: string,
    params?: {
      local?: boolean;
      max_id?: string;
      since_id?: string;
      limit?: number;
    }
  ): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Status[]>(`/api/v1/timelines/tag/${tag}?${query}`);
  }

  // Statuses
  async postStatus(params: {
    status: string;
    in_reply_to_id?: string;
    media_ids?: string[];
    sensitive?: boolean;
    spoiler_text?: string;
    visibility?: 'public' | 'unlisted' | 'private' | 'direct';
    poll?: {
      options: string[];
      expires_in: number;
      multiple?: boolean;
    };
  }): Promise<Status> {
    return this.fetch<Status>('/api/v1/statuses', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}`);
  }

  async getStatusContext(id: string): Promise<{ ancestors: Status[]; descendants: Status[] }> {
    return this.fetch<{ ancestors: Status[]; descendants: Status[] }>(`/api/v1/statuses/${id}/context`);
  }

  async deleteStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}`, {
      method: 'DELETE',
    });
  }

  async editStatus(id: string, params: {
    status: string;
    spoiler_text?: string;
    sensitive?: boolean;
    media_ids?: string[];
  }): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async favouriteStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}/favourite`, {
      method: 'POST',
    });
  }

  async unfavouriteStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}/unfavourite`, {
      method: 'POST',
    });
  }

  async reblogStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}/reblog`, {
      method: 'POST',
    });
  }

  async unreblogStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}/unreblog`, {
      method: 'POST',
    });
  }

  async bookmarkStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}/bookmark`, {
      method: 'POST',
    });
  }

  async unbookmarkStatus(id: string): Promise<Status> {
    return this.fetch<Status>(`/api/v1/statuses/${id}/unbookmark`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications(params?: {
    max_id?: string;
    since_id?: string;
    limit?: number;
  }): Promise<Notification[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Notification[]>(`/api/v1/notifications?${query}`);
  }

  // Search
  async search(
    q: string,
    params?: {
      type?: 'accounts' | 'hashtags' | 'statuses';
      resolve?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<SearchResults> {
    const query = new URLSearchParams({ q, ...params } as any).toString();
    return this.fetch<SearchResults>(`/api/v2/search?${query}`);
  }

  // Trends
  async getTrendingTags(params?: { limit?: number }): Promise<Tag[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Tag[]>(`/api/v1/trends/tags?${query}`);
  }

  async getTrendingStatuses(params?: { limit?: number }): Promise<Status[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Status[]>(`/api/v1/trends/statuses?${query}`);
  }

  // Suggestions
  async getSuggestions(params?: { limit?: number }): Promise<Suggestion[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Suggestion[]>(`/api/v2/suggestions?${query}`);
  }

  // Tags
  async getFollowedTags(params?: {
    max_id?: string;
    since_id?: string;
    limit?: number;
  }): Promise<Tag[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Tag[]>(`/api/v1/followed_tags?${query}`);
  }

  async followTag(id: string): Promise<Tag> {
    return this.fetch<Tag>(`/api/v1/tags/${id}/follow`, {
      method: 'POST',
    });
  }

  async unfollowTag(id: string): Promise<Tag> {
    return this.fetch<Tag>(`/api/v1/tags/${id}/unfollow`, {
      method: 'POST',
    });
  }

  // Instance
  async getInstance(): Promise<Instance> {
    return this.fetch<Instance>('/api/v1/instance');
  }

  // Media
  async uploadMedia(file: File, params?: {
    description?: string;
    focus?: string;
  }): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (params?.description) {
      formData.append('description', params.description);
    }
    if (params?.focus) {
      formData.append('focus', params.focus);
    }

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v2/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload media: ${response.statusText}`);
    }

    return response.json();
  }

  // Streaming
  streamTimeline(
    stream: 'user' | 'public' | 'public:local' | 'hashtag' | 'hashtag:local',
    onUpdate: (status: Status) => void,
    onDelete?: (id: string) => void,
    tag?: string
  ): () => void {
    let streamUrl = `${this.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/api/v1/streaming`;

    const params = new URLSearchParams({
      access_token: this.accessToken || '',
      stream: stream,
    });

    if (tag && (stream === 'hashtag' || stream === 'hashtag:local')) {
      params.append('tag', tag);
    }

    const wsUrl = `${streamUrl}?${params.toString()}`;
    console.log('[WebSocket] Connecting to:', wsUrl.replace(/access_token=[^&]+/, 'access_token=***'));

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connection opened for stream:', stream);
    };

    ws.onmessage = (event) => {
      console.log('[WebSocket] Received message:', event.data);
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'update') {
          console.log('[WebSocket] Received update event');
          const status = JSON.parse(data.payload);
          console.log('[WebSocket] New status:', status.id, 'from', status.account.username);
          onUpdate(status);
        } else if (data.event === 'delete' && onDelete) {
          console.log('[WebSocket] Received delete event:', data.payload);
          onDelete(data.payload);
        } else {
          console.log('[WebSocket] Other event:', data.event);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing streaming message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Connection closed. Code:', event.code, 'Reason:', event.reason);
    };

    // Return cleanup function
    return () => {
      console.log('[WebSocket] Closing connection');
      ws.close();
    };
  }
}

// Singleton instance
let apiInstance: MastodonAPI | null = null;

export function getAPI(instanceUrl?: string, accessToken?: string | null): MastodonAPI {
  if (!apiInstance || (instanceUrl && apiInstance['baseUrl'] !== instanceUrl)) {
    if (!instanceUrl) {
      throw new Error('Instance URL is required for first API initialization');
    }
    apiInstance = new MastodonAPI(instanceUrl, accessToken || null);
  } else if (accessToken !== undefined && accessToken !== null) {
    apiInstance.setAccessToken(accessToken);
  }
  return apiInstance;
}
