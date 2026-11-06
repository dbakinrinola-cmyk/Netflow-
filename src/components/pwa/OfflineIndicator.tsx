import React from 'react';
import { useOnlineStatus } from './usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Offline status" className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg border border-amber-400">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — Cached learning resources active.</span>
    </aside>
  );
};
