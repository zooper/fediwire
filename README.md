# FediWire

An IRC-style Mastodon client built with React, TypeScript, and Tailwind CSS. Features real-time WebSocket streaming, read/unread tracking, and a familiar IRC aesthetic.

## Features

- **IRC-Style Interface**: Familiar IRC aesthetic with mIRC-inspired color scheme
- **Real-Time Updates**: WebSocket streaming for instant timeline updates (no polling!)
- **Read/Unread Tracking**: Visual indicators and dividers to show where you left off
- **Three-Column Layout**: Clean, responsive UI with navigation, timeline, and discovery sidebars
- **OAuth Authentication**: Secure login flow with any Mastodon instance
- **Timeline Features**:
  - Home, Local, and Federated timelines
  - Real-time WebSocket streaming
  - Post composition with media, polls, and content warnings
  - Favorite, boost, bookmark, and reply to posts
  - Client-side filtering (all, media, links, threads)
- **Discovery**:
  - Trending tags with usage statistics
  - Followed tags quick access
  - Suggested accounts
  - Instance status and health monitoring
- **Developer Experience**:
  - Development mode banner
  - Dark/light theme support
- **Responsive Design**:
  - Desktop-first with mobile support
  - Hides sidebars on smaller screens (<800px, <1040px)
  - Touch-friendly interactions

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand 5
- **API**: Mastodon REST API v1/v2

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mastodon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Development Mode

The app includes mock data for development. To enable it, the `useMockData` hook is enabled by default in `src/App.tsx`:

```typescript
useMockData(true); // Set to false to require real authentication
```

With mock data enabled, you can test the UI without connecting to a Mastodon instance.

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # Mastodon API client
│   └── mastodon.ts   # API methods and authentication
├── components/       # React components
│   ├── auth/         # Login and OAuth flow
│   ├── composer/     # Post composition
│   ├── post/         # Post display
│   ├── sidebar-left/ # Navigation and filters
│   ├── sidebar-right/# Discovery and trending
│   ├── timeline/     # Timeline feed
│   └── topbar/       # Top navigation bar
├── hooks/            # Custom React hooks
│   └── useMockData.ts# Development mock data
├── store/            # Zustand state management
│   └── useStore.ts   # Global app state
├── types/            # TypeScript type definitions
│   └── mastodon.ts   # Mastodon API types
├── utils/            # Utility functions
│   └── mockData.ts   # Sample data for development
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Connecting to a Mastodon Instance

1. Set `useMockData(false)` in `src/App.tsx` to disable mock data
2. Launch the app and enter your Mastodon instance URL (e.g., mastodon.social)
3. Click "Connect" to begin the OAuth flow
4. Authorize the app on your instance
5. You'll be redirected back and logged in

## API Integration

The app uses the following Mastodon API endpoints:

- **Authentication**: `/api/v1/apps`, `/oauth/authorize`, `/oauth/token`
- **Account**: `/api/v1/accounts/verify_credentials`
- **Timelines**: `/api/v1/timelines/home`, `/api/v1/timelines/public`, `/api/v1/timelines/tag/:tag`
- **Statuses**: `/api/v1/statuses` (POST, GET, DELETE)
- **Interactions**: favourite, reblog, bookmark endpoints
- **Discovery**: `/api/v1/trends/tags`, `/api/v2/suggestions`, `/api/v1/followed_tags`
- **Search**: `/api/v2/search`

## Configuration

### Tailwind Colors

Custom Mastodon colors are defined in `tailwind.config.js`:

```javascript
colors: {
  mastodon: {
    blue: '#2b90d9',
    darkBlue: '#1f8dd6',
    purple: '#6364ff',
    dark: '#282c37',
    darker: '#1f232b',
    light: '#d9e1e8',
  },
}
```

### OAuth Settings

OAuth configuration is in `src/components/auth/Login.tsx`:

- `CLIENT_NAME`: App name shown during authorization
- `REDIRECT_URI`: OAuth callback URL (defaults to `/oauth/callback`)
- `SCOPES`: Requested permissions (`read write follow push`)

## Future Enhancements

See [CLAUDE.md](./CLAUDE.md) for the full project specification and planned features:

- Multi-account simultaneous timelines
- Custom RSS/Atom feed ingestion
- Graph view of hashtag relationships
- Plug-in system for power users
- Column pinning (TweetDeck-style)
- Keyboard shortcuts (j/k navigation)

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and component structure.
