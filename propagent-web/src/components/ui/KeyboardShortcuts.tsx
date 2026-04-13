import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Shortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: () => void;
  label: string;
};

const globalShortcuts: Shortcut[] = [];

export function registerShortcut(shortcut: Shortcut) {
  if (!globalShortcuts.find(s => s.key === shortcut.key && s.ctrl === shortcut.ctrl)) {
    globalShortcuts.push(shortcut);
  }
}

export function unregisterShortcut(key: string) {
  const index = globalShortcuts.findIndex(s => s.key === key);
  if (index > -1) globalShortcuts.splice(index, 1);
}

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA' ||
          (e.target as HTMLElement).isContentEditable) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      const shortcut = globalShortcuts.find(s => 
        s.key.toLowerCase() === e.key.toLowerCase() && 
        (s.ctrl === undefined || s.ctrl === ctrl) &&
        (s.shift === undefined || s.shift === shift)
      );

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-900">Keyboard Shortcuts</p>
      <div className="space-y-1 text-gray-600">
        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">K</kbd> Search</p>
        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">G</kbd> then <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">D</kbd> Go to Dashboard</p>
        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">?</kbd> Show shortcuts</p>
      </div>
    </div>
  );
}