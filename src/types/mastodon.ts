export interface Account {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string;
  emojis: CustomEmoji[];
  fields: Field[];
}

export interface Field {
  name: string;
  value: string;
  verified_at: string | null;
}

export interface CustomEmoji {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
}

export interface Status {
  id: string;
  created_at: string;
  in_reply_to_id: string | null;
  in_reply_to_account_id: string | null;
  sensitive: boolean;
  spoiler_text: string;
  visibility: 'public' | 'unlisted' | 'private' | 'direct';
  language: string | null;
  uri: string;
  url: string;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  favourited: boolean;
  reblogged: boolean;
  muted: boolean;
  bookmarked: boolean;
  content: string;
  reblog: Status | null;
  application: Application | null;
  account: Account;
  media_attachments: MediaAttachment[];
  mentions: Mention[];
  tags: Tag[];
  emojis: CustomEmoji[];
  card: Card | null;
  poll: Poll | null;
}

export interface Application {
  name: string;
  website: string | null;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
  url: string;
  preview_url: string;
  remote_url: string | null;
  meta: MediaMeta;
  description: string | null;
  blurhash: string | null;
}

export interface MediaMeta {
  original?: {
    width: number;
    height: number;
    size: string;
    aspect: number;
  };
  small?: {
    width: number;
    height: number;
    size: string;
    aspect: number;
  };
}

export interface Mention {
  id: string;
  username: string;
  url: string;
  acct: string;
}

export interface Tag {
  name: string;
  url: string;
  history?: TagHistory[];
}

export interface TagHistory {
  day: string;
  uses: string;
  accounts: string;
}

export interface Card {
  url: string;
  title: string;
  description: string;
  type: 'link' | 'photo' | 'video' | 'rich';
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  html: string;
  width: number;
  height: number;
  image: string | null;
  embed_url: string;
  blurhash: string | null;
}

export interface Poll {
  id: string;
  expires_at: string | null;
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count: number | null;
  voted: boolean;
  own_votes: number[];
  options: PollOption[];
  emojis: CustomEmoji[];
}

export interface PollOption {
  title: string;
  votes_count: number | null;
}

export interface Notification {
  id: string;
  type: 'mention' | 'status' | 'reblog' | 'follow' | 'follow_request' | 'favourite' | 'poll' | 'update';
  created_at: string;
  account: Account;
  status?: Status;
}

export interface Instance {
  uri: string;
  title: string;
  short_description: string;
  description: string;
  email: string;
  version: string;
  languages: string[];
  registrations: boolean;
  approval_required: boolean;
  invites_enabled: boolean;
  urls: {
    streaming_api: string;
  };
  stats: {
    user_count: number;
    status_count: number;
    domain_count: number;
  };
  thumbnail: string | null;
  contact_account: Account | null;
}

export interface Relationship {
  id: string;
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  blocked_by: boolean;
  muting: boolean;
  muting_notifications: boolean;
  requested: boolean;
  domain_blocking: boolean;
  showing_reblogs: boolean;
  endorsed: boolean;
  note: string;
}

export interface SearchResults {
  accounts: Account[];
  statuses: Status[];
  hashtags: Tag[];
}

export interface Suggestion {
  source: string;
  account: Account;
}
