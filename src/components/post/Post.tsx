import { useState, useRef, useEffect } from 'react';
import type { Status } from '../../types';
import { useStore } from '../../store/useStore';
import Profile from '../profile/Profile';
import LinkPreview from './LinkPreview';
import ThreadView from '../thread/ThreadView';

interface PostProps {
  status: Status;
  isUnread?: boolean;
}

export default function Post({ status, isUnread = false }: PostProps) {
  const { currentAccount, updateStatus, removeFromTimeline, accessToken, instanceUrl, setReplyingTo, fontSize } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLinkPreview, setShowLinkPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [showThreadView, setShowThreadView] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  const displayStatus = status.reblog || status;
  const isReblog = !!status.reblog;
  const isOwnPost = currentAccount?.id === displayStatus.account.id;
  const images = displayStatus.media_attachments.filter(m => m.type === 'image');
  const isPartOfThread = displayStatus.in_reply_to_id || displayStatus.replies_count > 0;

  const handleFavourite = () => {
    updateStatus(status.id, {
      favourited: !status.favourited,
      favourites_count: status.favourited
        ? status.favourites_count - 1
        : status.favourites_count + 1,
    });
  };

  const handleReblog = () => {
    updateStatus(status.id, {
      reblogged: !status.reblogged,
      reblogs_count: status.reblogged
        ? status.reblogs_count - 1
        : status.reblogs_count + 1,
    });
  };

  const handleBookmark = () => {
    updateStatus(status.id, {
      bookmarked: !status.bookmarked,
    });
  };

  const handleReply = () => {
    setReplyingTo(displayStatus);
    // Scroll to composer
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;

    try {
      const { getAPI } = await import('../../api/mastodon');
      const api = getAPI(instanceUrl!, accessToken!);
      await api.deleteStatus(displayStatus.id);
      removeFromTimeline(status.id);
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete post.');
    }
  };

  const [editContent, setEditContent] = useState('');
  const [editSpoilerText, setEditSpoilerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditComposer, setShowEditComposer] = useState(false);

  const handleEdit = () => {
    // Extract plain text from HTML content
    const tmp = document.createElement('div');
    tmp.innerHTML = displayStatus.content;
    const plainText = tmp.textContent || tmp.innerText || '';

    setEditContent(plainText);
    setEditSpoilerText(displayStatus.spoiler_text);
    setShowEditModal(false);
    setShowEditComposer(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { getAPI } = await import('../../api/mastodon');
      const api = getAPI(instanceUrl!, accessToken!);
      const updatedStatus = await api.editStatus(displayStatus.id, {
        status: editContent,
        spoiler_text: editSpoilerText || undefined,
      });

      // Update the status in the timeline
      updateStatus(status.id, updatedStatus);
      setShowEditComposer(false);
    } catch (error) {
      console.error('Failed to edit:', error);
      alert('Failed to edit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Convert HTML to text with clickable links
  const processContent = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    // Extract links
    const links = Array.from(tmp.querySelectorAll('a'));
    const linkMap: { [key: string]: string } = {};

    links.forEach((link) => {
      const href = link.getAttribute('href');
      const text = link.textContent || '';
      if (href) {
        linkMap[text] = href;
      }
    });

    const text = tmp.textContent || tmp.innerText || '';
    return { text, links: linkMap };
  };

  const renderContent = (html: string) => {
    const { text, links } = processContent(html);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Find all URLs in the text
    Object.entries(links).forEach(([linkText, href], idx) => {
      const index = text.indexOf(linkText, lastIndex);
      if (index !== -1) {
        // Add text before link
        if (index > lastIndex) {
          parts.push(<span key={`text-${idx}`}>{text.substring(lastIndex, index)}</span>);
        }
        // Add clickable link
        parts.push(
          <a
            key={`link-${idx}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mirc-blue dark:text-blue-400 underline hover:text-mirc-cyan dark:hover:text-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            {linkText}
          </a>
        );
        lastIndex = index + linkText.length;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  // Generate color for username based on hash
  const getUserColor = (username: string) => {
    const colors = [
      'text-mirc-blue dark:text-blue-400',
      'text-mirc-red dark:text-red-400',
      'text-mirc-green dark:text-green-400',
      'text-mirc-purple dark:text-purple-400',
      'text-mirc-orange dark:text-orange-400',
      'text-mirc-cyan dark:text-cyan-400',
    ];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Extract first URL from post content
  const getFirstUrl = (html: string): string | null => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const links = tmp.querySelectorAll('a');

    for (const link of Array.from(links)) {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        // Skip mentions and hashtags
        const classes = link.className || '';
        if (!classes.includes('mention') && !classes.includes('hashtag')) {
          return href;
        }
      }
    }
    return null;
  };

  const handleMouseEnter = () => {
    // Check if post has a card OR contains any links
    const hasCard = !!displayStatus.card;
    const firstUrl = getFirstUrl(displayStatus.content);

    if (hasCard || firstUrl) {
      const rect = postRef.current?.getBoundingClientRect();
      if (rect) {
        setPreviewPosition({
          x: rect.right,
          y: rect.top + rect.height / 2,
        });
      }
      setShowLinkPreview(true);
    }
  };

  const handleMouseLeave = () => {
    setShowLinkPreview(false);
  };

  // Get font size classes
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'small':
        return 'text-[10px]';
      case 'large':
        return 'text-[14px]';
      default: // medium
        return 'text-[12px]';
    }
  };

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showImageModal) {
          setShowImageModal(false);
        } else if (showEditModal) {
          setShowEditModal(false);
        } else if (showEditComposer) {
          setShowEditComposer(false);
        }
      }
    };

    if (showImageModal || showEditModal || showEditComposer) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImageModal, showEditModal, showEditComposer]);

  return (
    <>
      <div
        ref={postRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${getFontSizeClasses()} py-0.5 px-1 font-mirc leading-tight ${isUnread ? 'border-l-2 border-mirc-blue dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20' : ''}`}
      >
        {/* Reblog indicator */}
        {isReblog && (
          <div className="text-mirc-purple text-[10px] mb-0.5">
            * {status.account.display_name} retooted this
          </div>
        )}

        {/* Message line - mIRC style */}
        <div className="flex gap-2 group items-start">
          {/* Timestamp */}
          <span
            className="text-mirc-gray dark:text-gray-500 flex-shrink-0 cursor-help"
            title={formatFullDateTime(displayStatus.created_at)}
          >
            [{formatTime(displayStatus.created_at)}]
          </span>

          {/* Username with color - clickable, right-aligned in fixed width */}
          <button
            onClick={() => setShowProfile(true)}
            className={`${getUserColor(displayStatus.account.username)} font-bold flex-shrink-0 hover:underline cursor-pointer text-right w-32`}
          >
            &lt;{displayStatus.account.username}&gt;
          </button>

        {/* Message content */}
        <div className="flex-1 min-w-0 flex items-start gap-2">
          <div className="flex-1">
            {/* Reply indicator */}
            {displayStatus.in_reply_to_id && (
              <span className="text-mirc-gray dark:text-gray-500 mr-1">↪</span>
            )}
            <span className="text-mirc-text dark:text-gray-200 break-words pl-1">{renderContent(displayStatus.content)}</span>

            {/* Tags */}
            {displayStatus.tags.length > 0 && (
              <span className="ml-1">
                {displayStatus.tags.map((tag) => (
                  <span key={tag.name} className="text-mirc-blue mr-1">
                    #{tag.name}
                  </span>
                ))}
              </span>
            )}

            {/* Content warning */}
            {displayStatus.spoiler_text && (
              <span className="text-mirc-red ml-1">
                [CW: {displayStatus.spoiler_text}]
              </span>
            )}

            {/* Image link */}
            {images.length > 0 && (
              <button
                onClick={() => {
                  setSelectedImageIndex(0);
                  setShowImageModal(true);
                }}
                className="text-mirc-blue dark:text-blue-400 ml-1 hover:underline"
              >
                [{images.length === 1 ? 'Image' : `Images: ${images.length}`}]
              </button>
            )}
          </div>

          {/* Action buttons - always visible, styled subtly */}
          <div className="flex items-start gap-1.5 ml-2 flex-shrink-0 pt-0.5">
            {/* Edit button for own posts */}
            {isOwnPost && (
              <button
                onClick={() => setShowEditModal(true)}
                className="text-[10px] text-mirc-gray dark:text-gray-600 hover:text-mirc-blue dark:hover:text-blue-400 transition-colors"
                title="Edit/Delete"
              >
                ✏️
              </button>
            )}

            {isPartOfThread && (
              <button
                onClick={() => setShowThreadView(true)}
                className="text-[10px] text-mirc-gray dark:text-gray-600 hover:text-mirc-blue dark:hover:text-blue-400 transition-colors"
                title="View thread"
              >
                💬
              </button>
            )}
            <button
              onClick={handleReply}
              className="text-[10px] text-mirc-gray dark:text-gray-600 hover:text-mirc-blue dark:hover:text-blue-400 transition-colors"
              title="Reply"
            >
              ↩
            </button>
            <button
              onClick={handleReblog}
              className={`text-[10px] transition-colors ${
                status.reblogged
                  ? 'text-mirc-green dark:text-green-400'
                  : 'text-mirc-gray dark:text-gray-600 hover:text-mirc-green dark:hover:text-green-400'
              }`}
              title="Boost"
            >
              🔁
            </button>
            <button
              onClick={handleFavourite}
              className={`text-[10px] transition-colors ${
                status.favourited
                  ? 'text-mirc-orange dark:text-orange-400'
                  : 'text-mirc-gray dark:text-gray-600 hover:text-mirc-orange dark:hover:text-orange-400'
              }`}
              title="Favorite"
            >
              ⭐
            </button>
            <button
              onClick={handleBookmark}
              className={`text-[10px] transition-colors ${
                status.bookmarked
                  ? 'text-mirc-purple dark:text-purple-400'
                  : 'text-mirc-gray dark:text-gray-600 hover:text-mirc-purple dark:hover:text-purple-400'
              }`}
              title="Bookmark"
            >
              🔖
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Profile modal */}
      {showProfile && (
        <Profile
          accountId={displayStatus.account.id}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Image modal */}
      {showImageModal && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 z-10"
              title="Close"
            >
              ×
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
                  title="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
                  title="Next"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={images[selectedImageIndex].url}
              alt={images[selectedImageIndex].description || ''}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {/* Image description */}
            {images[selectedImageIndex].description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-sm">
                {images[selectedImageIndex].description}
              </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link preview on hover */}
      <LinkPreview
        card={displayStatus.card}
        url={!displayStatus.card ? getFirstUrl(displayStatus.content) || undefined : undefined}
        show={showLinkPreview}
        position={previewPosition}
      />

      {/* Edit/Delete modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 border-2 border-mirc-border dark:border-gray-600 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar - mIRC style */}
            <div className="mirc-titlebar text-[11px] flex items-center justify-between bg-blue-700 dark:bg-blue-900 text-white">
              <span>Post Options</span>
              <button
                onClick={() => setShowEditModal(false)}
                className="hover:bg-blue-800 dark:hover:bg-blue-950 px-2"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-3 bg-mirc-panel dark:bg-gray-700 border border-mirc-border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-colors font-mirc text-[12px]"
                >
                  <span className="text-mirc-blue dark:text-blue-400">✏️</span> Edit Post
                </button>
                <button
                  onClick={() => { handleDelete(); setShowEditModal(false); }}
                  className="w-full text-left px-4 py-3 bg-mirc-panel dark:bg-gray-700 border border-mirc-border dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors font-mirc text-[12px]"
                >
                  <span className="text-mirc-red dark:text-red-400">🗑️</span> Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit composer modal */}
      {showEditComposer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditComposer(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 border-2 border-mirc-border dark:border-gray-600 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar - mIRC style */}
            <div className="mirc-titlebar text-[11px] flex items-center justify-between bg-blue-700 dark:bg-blue-900 text-white">
              <span>Edit Post</span>
              <button
                onClick={() => setShowEditComposer(false)}
                className="hover:bg-blue-800 dark:hover:bg-blue-950 px-2"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Content warning input */}
              {editSpoilerText !== '' && (
                <div className="mb-2">
                  <input
                    type="text"
                    value={editSpoilerText}
                    onChange={(e) => setEditSpoilerText(e.target.value)}
                    placeholder="Content warning"
                    className="w-full p-2 border border-mirc-border dark:border-gray-600 bg-white dark:bg-gray-900 text-mirc-text dark:text-gray-200 font-mirc text-[12px]"
                  />
                </div>
              )}

              {/* Text area */}
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-mirc-border dark:border-gray-600 bg-white dark:bg-gray-900 text-mirc-text dark:text-gray-200 font-mirc text-[12px] resize-none"
                rows={8}
                autoFocus
              />

              {/* Character count */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-[11px] text-mirc-gray dark:text-gray-500 font-mirc">
                  {editContent.length}/500
                </span>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditComposer(false)}
                    className="px-4 py-2 bg-mirc-panel dark:bg-gray-700 border border-mirc-border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-colors font-mirc text-[12px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || isSubmitting}
                    className="px-4 py-2 bg-mirc-blue dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-mirc text-[12px]"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thread view modal */}
      {showThreadView && (
        <ThreadView
          statusId={displayStatus.id}
          onClose={() => setShowThreadView(false)}
        />
      )}
    </>
  );
}
