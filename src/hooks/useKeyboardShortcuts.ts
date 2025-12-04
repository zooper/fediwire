import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = s.ctrl === undefined || s.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = s.shift === undefined || s.shift === event.shiftKey;
        const altMatch = s.alt === undefined || s.alt === event.altKey;
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Export shortcuts list for help modal
export const SHORTCUTS: KeyboardShortcut[] = [
  { key: 'c', handler: () => {}, description: 'Compose new post' },
  { key: '/', handler: () => {}, description: 'Focus search' },
  { key: '?', handler: () => {}, description: 'Show keyboard shortcuts help' },
  { key: 'h', handler: () => {}, description: 'Go to home timeline' },
  { key: 'l', handler: () => {}, description: 'Go to local timeline' },
  { key: 'f', handler: () => {}, description: 'Go to federated timeline' },
  { key: 'n', handler: () => {}, description: 'Toggle notifications' },
  { key: 't', handler: () => {}, description: 'Toggle theme (light/dark)' },
  { key: 'r', handler: () => {}, description: 'Refresh timeline' },
  { key: 'Escape', handler: () => {}, description: 'Close modals/cancel compose' },
];
