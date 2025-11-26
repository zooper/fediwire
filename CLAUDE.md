# Project Specification: Mastodon Client (Mockup-Based)

## Overview

A custom Mastodon client designed to provide a clean, modern, three-column UI with a discovery-focused experience. The goal is to streamline navigation, improve user discovery (especially around technical communities such as networking), and offer a visually refined interface compared to existing Mastodon apps.

This specification is based on the HTML mockup provided earlier and outlines the structure, components, behaviors, and requirements to guide implementation.

---

## Goals

* Deliver a responsive, desktop-first client UI with a modern aesthetic.
* Improve user discovery via enhanced tag browsing and account suggestions.
* Provide a smoother, more structured timeline reading experience.
* Allow multi-account support.
* Integrate seamlessly with Mastodon's API for posting, timelines, notifications, and interactions.

---

## Core Features

### 1. **Top Bar**

* Global navigation and account controls.
* Includes:

  * Logo
  * Search bar (search users, hashtags, posts)
  * Instance/account switcher
  * Notifications button with unread count
  * Account avatar menu
* Search should use Mastodon’s `/api/v2/search` endpoint.

---

### 2. **Three-Column Layout**

The primary interface consists of:

1. **Left sidebar** — navigation and user identity
2. **Center column** — compose box + timeline
3. **Right sidebar** — discovery and instance info

Responsive behavior:

* Hide right column below ~1040px.
* Hide left and right columns below ~800px.

---

## Component Breakdown

### LEFT SIDEBAR

#### Mini Profile

* Shows user avatar, display name, handle.
* Status indicator for API connection.

#### Navigation Items

* Home
* Local timeline
* Federated timeline
* Lists
* Bookmarks
* Direct Messages

#### Filters

* All
* Media
* Links
* Threads
* State is local-only; filters are applied client-side or via query parameters.

---

### CENTER COLUMN

#### Compose Box

* Avatar
* Text area
* Buttons: media, poll, CW, emoji
* Visibility selector
* Character counter
* Post button
* Uses `/api/v1/statuses` for posting.

#### Timeline Feed

Displays a list of cards:

* Header: avatar, display name, handle, timestamp, post menu
* Body: text, content warnings, media previews
* Tags are clickable and open hashtag timeline
* Footer: reply, boost, favorite, bookmark

Supports infinite scrolling and “new posts available” indicators.

---

### RIGHT SIDEBAR

#### Followed Tags

* Tags the user follows via `/api/v1/followed_tags`.
* Clicking opens tag timeline.

#### Trending Tags

* Uses `/api/v1/trends/tags`.

#### Suggested Accounts

* Derived from `/api/v1/suggestions` or custom logic.
* Displays avatar, display name, handle, 1-line bio.

#### Instance Status

* Shows instance name, API latency, and rate limit status.
* Client should monitor via periodic lightweight requests.

---

## API Integration Requirements

### Authentication

* OAuth-based login flow for Mastodon instance.
* Store tokens securely.

### Endpoints Needed

* Timelines: `/api/v1/timelines/home`, `/public`, `/tag/{tag}`
* Posting: `/api/v1/statuses`
* Notifications: `/api/v1/notifications`
* Relationships: follow, unfollow, mute, block
* Media: `/api/v2/media` for uploads
* User search: `/api/v2/search`
* Suggestions: `/api/v1/suggestions`
* Trends: `/api/v1/trends/*`
* Followed tags: `/api/v1/followed_tags`

---

## State Management

Use a predictable global store to track:

* Current user account
* Access token
* Current timeline
* Followed tags
* Notifications
* UI settings (filters, columns, etc.)

Potential libraries: Redux, Zustand, or Svelte stores.

---

## Technology Stack (Recommended)

* **Frontend**: React, Vue, or Svelte
* **Styling**: Tailwind or custom CSS
* **Backend**: None needed unless caching or proxying
* **Build tools**: Vite or Next.js (if SSR is desired)

---

## Future Enhancements

* Multi-account simultaneous timelines
* Custom RSS/Atom feed ingestion
* Graph view of hashtag relationships
* Plug-in system for power users
* Column pinning (similar to TweetDeck)
* Keyboard shortcuts (j/k navigation, etc.)

---

## File Structure (Proposed)

```
/ src
  / components
    topbar/
    sidebar-left/
    sidebar-right/
    timeline/
    post/
    composer/
  / api
  / store
  / styles
  App.js
  main.js
```

---

## Deliverables

* Fully functional prototype of the Mastodon client UI
* Working timeline feed
* Posting capability
* Discovery sidebar hooked to Mastodon’s real API
* Configurable instance selection

---

This CLAUDE.md specification is intended to give both humans and LLMs enough structure to help build and iterate on the Mastodon client with clarity and consistent context.

