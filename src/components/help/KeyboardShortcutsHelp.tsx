interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts = [
    { key: 'c', description: 'Compose new post' },
    { key: '/', description: 'Focus search' },
    { key: '?', description: 'Show this help' },
    { key: 'h', description: 'Go to home timeline' },
    { key: 'l', description: 'Go to local timeline' },
    { key: 'f', description: 'Go to federated timeline' },
    { key: 'n', description: 'Toggle notifications' },
    { key: 't', description: 'Toggle theme' },
    { key: 'r', description: 'Refresh timeline' },
    { key: 'Esc', description: 'Close modals/cancel' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 border-2 border-mirc-border dark:border-gray-600 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar - mIRC style */}
        <div className="mirc-titlebar text-[11px] flex items-center justify-between bg-blue-700 dark:bg-blue-900 text-white">
          <span>Keyboard Shortcuts</span>
          <button
            onClick={onClose}
            className="hover:bg-blue-800 dark:hover:bg-blue-950 px-2"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between text-[12px] font-mirc"
              >
                <span className="text-mirc-text dark:text-gray-200">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 bg-mirc-panel dark:bg-gray-700 border border-mirc-border dark:border-gray-600 rounded text-[11px] font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-mirc-border dark:border-gray-600">
            <p className="text-[10px] text-mirc-gray dark:text-gray-400 font-mirc">
              Press <kbd className="px-1 bg-mirc-panel dark:bg-gray-700 border border-mirc-border dark:border-gray-600 rounded">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
