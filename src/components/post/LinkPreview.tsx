import type { Card } from '../../types';

interface LinkPreviewProps {
  card: Card | null;
  url?: string;
  show: boolean;
  position?: { x: number; y: number };
}

export default function LinkPreview({ card, url, show, position }: LinkPreviewProps) {
  // Don't show if not visible
  if (!show) {
    return null;
  }

  // Use card data if available, otherwise create fallback from URL
  const previewData = card || (url ? {
    url,
    title: '',
    description: '',
    type: 'link' as const,
    author_name: '',
    author_url: '',
    provider_name: '',
    provider_url: '',
    html: '',
    width: 0,
    height: 0,
    image: null,
    embed_url: '',
    blurhash: null,
  } : null);

  // Don't show if no data at all
  if (!previewData) {
    return null;
  }

  // For fallback cards (no title/description), just show the URL
  const isFallback = !card && url;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position ? `${position.x}px` : '50%',
        top: position ? `${position.y}px` : '50%',
        transform: position ? 'translate(10px, -50%)' : 'translate(-50%, -50%)',
      }}
    >
      <div className="pointer-events-auto border-2 border-mirc-border dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg max-w-sm">
        {/* Image */}
        {previewData.image && (
          <div className="w-full h-48 overflow-hidden border-b border-mirc-border dark:border-gray-600">
            <img
              src={previewData.image}
              alt={previewData.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Text content */}
        <div className="p-3">
          {isFallback ? (
            // Fallback: just show link info
            <>
              <div className="text-[10px] text-mirc-gray dark:text-gray-500 uppercase tracking-wide mb-2 font-mirc">
                🔗 Link Preview
              </div>
              <div className="text-[11px] text-mirc-blue dark:text-blue-400 break-all font-mirc leading-tight">
                {previewData.url}
              </div>
              <div className="text-[10px] text-mirc-gray dark:text-gray-400 mt-2 font-mirc">
                {new URL(previewData.url).hostname}
              </div>
            </>
          ) : (
            // Full card preview
            <>
              {/* Provider name */}
              {previewData.provider_name && (
                <div className="text-[10px] text-mirc-gray dark:text-gray-500 uppercase tracking-wide mb-1 font-mirc">
                  {previewData.provider_name}
                </div>
              )}

              {/* Title */}
              {previewData.title && (
                <div className="text-[13px] font-bold text-mirc-text dark:text-gray-200 mb-2 font-mirc leading-tight">
                  {previewData.title}
                </div>
              )}

              {/* Description */}
              {previewData.description && (
                <div className="text-[11px] text-mirc-gray dark:text-gray-400 line-clamp-3 mb-2 font-mirc leading-tight">
                  {previewData.description}
                </div>
              )}

              {/* URL domain */}
              <div className="text-[10px] text-mirc-blue dark:text-blue-400 truncate font-mirc">
                {new URL(previewData.url).hostname}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
