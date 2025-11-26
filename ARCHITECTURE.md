# Architecture Overview

## Component Hierarchy

```
App
├── Login (if not authenticated)
└── Main Layout (if authenticated)
    ├── TopBar
    │   ├── Logo
    │   ├── SearchBar
    │   ├── InstanceSelector
    │   ├── NotificationsButton
    │   └── AccountMenu
    ├── LeftSidebar (hidden on mobile)
    │   ├── MiniProfile
    │   ├── Navigation
    │   └── Filters
    ├── CenterColumn
    │   ├── Composer
    │   └── Timeline
    │       └── Post (multiple)
    └── RightSidebar (hidden on small screens)
        ├── FollowedTags
        ├── TrendingTags
        ├── SuggestedAccounts
        └── InstanceStatus
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Action                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   React Component                            │
│  (TopBar, Composer, Post, Navigation, etc.)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Zustand Store                              │
│  • setTimeline()           • setCurrentAccount()            │
│  • updateStatus()          • setAccessToken()               │
│  • setCurrentTimeline()    • setFollowedTags()              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer                                  │
│  getAPI(instanceUrl, accessToken)                           │
│  • getHomeTimeline()       • postStatus()                   │
│  • favouriteStatus()       • reblogStatus()                 │
│  • getTrendingTags()       • verifyCredentials()            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Mastodon Instance API                         │
│  https://mastodon.social/api/v1/...                         │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Zustand Store Structure

```typescript
{
  // Authentication
  currentAccount: Account | null
  accessToken: string | null
  instanceUrl: string | null

  // UI State
  currentTimeline: 'home' | 'local' | 'federated' | 'tag'
  currentTag: string | null
  activeFilter: 'all' | 'media' | 'links' | 'threads'

  // Data
  timeline: Status[]
  notifications: Notification[]
  followedTags: Tag[]
  trendingTags: Tag[]
  instance: Instance | null

  // Loading States
  isLoadingTimeline: boolean
  isLoadingNotifications: boolean
}
```

### State Persistence

- `accessToken` → localStorage: 'mastodon_token'
- `instanceUrl` → localStorage: 'mastodon_instance'
- All other state is ephemeral (session-only)

## API Client Pattern

```typescript
// Singleton instance
const api = getAPI('https://mastodon.social', 'token123');

// All requests go through:
api.fetch(endpoint, options)
  ├── Adds Authorization header
  ├── Handles JSON parsing
  └── Throws on errors

// Examples:
await api.getHomeTimeline({ limit: 20 })
await api.postStatus({ status: 'Hello!', visibility: 'public' })
await api.favouriteStatus(statusId)
```

## Authentication Flow

```
1. User enters instance URL
   ↓
2. App registers with instance via /api/v1/apps
   ↓
3. App stores client_id and client_secret
   ↓
4. User redirected to /oauth/authorize
   ↓
5. User authorizes on Mastodon
   ↓
6. User redirected back with code
   ↓
7. App exchanges code for access_token via /oauth/token
   ↓
8. App stores token and fetches account via /api/v1/accounts/verify_credentials
   ↓
9. User is logged in
```

## Responsive Breakpoints

```
Mobile (< 768px / md)
├── TopBar: Full width
├── LeftSidebar: Hidden
├── CenterColumn: Full width
└── RightSidebar: Hidden

Tablet (768px - 1024px / md - lg)
├── TopBar: Full width
├── LeftSidebar: Visible (256px)
├── CenterColumn: Flexible
└── RightSidebar: Hidden

Desktop (> 1024px / lg)
├── TopBar: Full width
├── LeftSidebar: Visible (256px)
├── CenterColumn: Flexible
└── RightSidebar: Visible (320px)
```

## Key Design Decisions

### 1. State Management: Zustand
- **Why**: Simpler than Redux, more structure than Context
- **Benefits**: TypeScript support, devtools, minimal boilerplate

### 2. API Singleton Pattern
- **Why**: Centralized configuration, easy to switch instances
- **Benefits**: Consistent auth headers, error handling

### 3. Mock Data Hook
- **Why**: Develop UI without backend dependency
- **Benefits**: Faster iteration, demo-ready

### 4. Component Composition
- **Why**: Follows React best practices
- **Benefits**: Reusable, testable, maintainable

### 5. Tailwind CSS
- **Why**: Utility-first, rapid development
- **Benefits**: Small bundle, consistent design system

## Security Model

```
┌──────────────────┐
│  User's Browser  │
│                  │
│  localStorage:   │
│  - token         │
│  - instanceUrl   │
└────────┬─────────┘
         │
         │ HTTPS
         │
         ▼
┌──────────────────┐
│ Mastodon Server  │
│                  │
│  OAuth 2.0       │
│  Bearer Token    │
└──────────────────┘
```

**Current Limitations**:
- Tokens in localStorage (XSS risk)
- No token refresh
- No CSRF protection
- Content rendered as HTML (XSS risk)

**Production Recommendations**:
- Use httpOnly cookies for tokens
- Implement token refresh
- Add CSRF tokens
- Sanitize HTML content
- Add Content Security Policy headers

## Performance Optimizations

1. **Code Splitting**: Vite automatically splits components
2. **Lazy Loading**: Can add React.lazy for route-based splitting
3. **Memoization**: useCallback/useMemo where needed
4. **Virtual Scrolling**: Consider for long timelines
5. **Image Optimization**: Add lazy loading for media

## Extension Points

### Adding a New Timeline Type
1. Add type to `TimelineType` in `store/useStore.ts`
2. Add navigation item in `Navigation.tsx`
3. Add API method in `api/mastodon.ts`
4. Update `setCurrentTimeline` logic

### Adding a New Interaction
1. Add method to `api/mastodon.ts`
2. Add action to store in `useStore.ts`
3. Add button/handler in `Post.tsx`
4. Update `Status` type if needed

### Adding Real-time Updates
1. Add WebSocket connection in `api/`
2. Subscribe to streaming endpoint
3. Update store when messages arrive
4. Add "New posts" indicator in Timeline
