import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getAPI } from '../../api/mastodon';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';

interface UploadedMedia {
  id: string;
  url: string;
  preview?: string;
  file: File;
}

export default function Composer() {
  const { currentAccount, accessToken, instanceUrl, currentTimeline, addToTimeline, replyingTo, setReplyingTo } = useStore();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxChars = 500;
  const remainingChars = maxChars - content.length;

  // Auto-mention when replying
  useEffect(() => {
    if (replyingTo && !content) {
      const mentionUsername = `@${replyingTo.account.acct}`;
      setContent(mentionUsername + ' ');
    }
  }, [replyingTo]);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0 || !accessToken || !instanceUrl) return;

    setIsUploading(true);
    try {
      const api = getAPI(instanceUrl, accessToken);
      const newMedia: UploadedMedia[] = [];

      for (const file of files) {
        // Upload to Mastodon
        const uploadedFile = await api.uploadMedia(file);

        // Create preview URL for display
        const preview = URL.createObjectURL(file);

        newMedia.push({
          id: uploadedFile.id,
          url: uploadedFile.url,
          preview,
          file,
        });
      }

      setUploadedMedia([...uploadedMedia, ...newMedia]);
    } catch (error) {
      console.error('Failed to upload media:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault(); // Prevent pasting image data as text
      await uploadFiles(imageFiles);
    }
  };

  const handleRemoveMedia = (id: string) => {
    const media = uploadedMedia.find(m => m.id === id);
    if (media?.preview) {
      URL.revokeObjectURL(media.preview);
    }
    setUploadedMedia(uploadedMedia.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && uploadedMedia.length === 0) || !currentAccount || !accessToken || !instanceUrl) return;

    setIsPosting(true);
    try {
      const api = getAPI(instanceUrl, accessToken);
      const newStatus = await api.postStatus({
        status: content,
        visibility,
        media_ids: uploadedMedia.map(m => m.id),
        in_reply_to_id: replyingTo?.id,
      });

      // Add to timeline if we're on home
      if (currentTimeline === 'home') {
        addToTimeline([newStatus]);
      }

      setContent('');
      // Clean up media previews
      uploadedMedia.forEach(m => {
        if (m.preview) URL.revokeObjectURL(m.preview);
      });
      setUploadedMedia([]);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="irc-window mt-1 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 border-b border-blue-200 dark:border-blue-700 flex items-center justify-between">
          <span className="text-[11px] text-blue-700 dark:text-blue-300">
            Replying to <span className="font-bold">@{replyingTo.account.username}</span>
          </span>
          <button
            type="button"
            onClick={() => { setReplyingTo(null); setContent(''); }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input area - mIRC style */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          placeholder={currentAccount ? "Type message here... (Ctrl+V to paste images)" : "Not connected"}
          className="irc-input text-[12px] font-mirc bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
          disabled={!currentAccount}
          maxLength={maxChars}
        />

        {/* Media preview */}
        {uploadedMedia.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800">
            {uploadedMedia.map((media) => (
              <div key={media.id} className="relative group">
                <img
                  src={media.preview || media.url}
                  alt="Upload preview"
                  className="h-20 w-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(media.id)}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Controls bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-mirc-panel dark:bg-gray-800 border-t border-mirc-border dark:border-gray-600 text-[12px]">
          <div className="flex items-center gap-2">
            {/* Image upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={!currentAccount || isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!currentAccount || isUploading}
              className="px-3 py-1 rounded border border-mirc-border dark:border-gray-600 bg-white dark:bg-gray-700 text-mirc-text dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-[11px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload image"
            >
              {isUploading ? '⏳' : '📷'}
            </button>

            {/* Visibility buttons */}
            {(['public', 'unlisted', 'private', 'direct'] as Visibility[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                style={visibility === v ? { backgroundColor: '#3182ce', color: '#ffffff', borderColor: '#3182ce' } : {}}
                className={`px-3 py-1 rounded border text-[11px] font-medium transition-colors ${
                  visibility === v
                    ? ''
                    : 'border-mirc-border dark:border-gray-600 bg-white dark:bg-gray-700 text-mirc-text dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title={v}
                disabled={!currentAccount}
              >
                {v.substring(0, 3).toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Character counter */}
            <span
              className={`text-[12px] font-medium ${
                remainingChars < 0
                  ? 'text-red-600 dark:text-red-400'
                  : remainingChars < 50
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-mirc-gray dark:text-gray-400'
              }`}
            >
              {remainingChars}/{maxChars}
            </span>

            {/* Send button */}
            <button
              type="submit"
              disabled={!currentAccount || (!content.trim() && uploadedMedia.length === 0) || remainingChars < 0 || isPosting}
              className="btn-primary"
            >
              {isPosting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
