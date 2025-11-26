import { useState, useEffect, useRef } from 'react';
import type { Status } from '../../types';
import { useStore } from '../../store/useStore';
import Profile from '../profile/Profile';

interface PostProps {
  status: Status;
  isUnread?: boolean;
}

export default function Post({ status, isUnread = false }: PostProps) {
  const { currentAccount, updateStatus, removeFromTimeline, accessToken, instanceUrl, setReplyingTo } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayStatus = status.reblog || status;
  const isReblog = !!status.reblog;
  const isOwnPost = currentAccount?.id === displayStatus.account.id;
  const images = displayStatus.media_attachments.filter(m => m.type === 'image');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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

  const handleEdit = () => {
    // For now, just show an alert. Full edit UI would require a modal with the composer
    alert('Edit functionality coming soon! For now, you can delete and repost.');
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

  return (
    <>
      <div className={`text-[12px] py-0.5 px-1 font-mirc leading-tight ${isUnread ? 'border-l-2 border-mirc-blue dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20' : ''}`}>
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
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
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

          {/* Edit/Delete menu for own posts */}
          {isOwnPost && (
            <div ref={menuRef} className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-mirc-gray dark:text-gray-500 hover:text-mirc-text dark:hover:text-gray-300 text-[10px] px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Options"
              >
                ⋯
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-mirc-border dark:border-gray-600 rounded shadow-lg z-10 text-[11px] min-w-[100px]">
                  <button
                    onClick={() => { handleEdit(); setShowMenu(false); }}
                    className="block w-full text-left px-3 py-1.5 hover:bg-mirc-panel dark:hover:bg-gray-700 text-mirc-text dark:text-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="block w-full text-left px-3 py-1.5 hover:bg-mirc-panel dark:hover:bg-gray-700 text-mirc-red dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
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
    </>
  );
}
