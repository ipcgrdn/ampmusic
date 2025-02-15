'use client';

import { motion } from 'framer-motion';
import { IconMusic, IconDisc, IconPlaylist } from '@tabler/icons-react';

interface ProfileTabsProps {
  activeTab: 'tracks' | 'albums' | 'playlists';
  onTabChange: (tab: 'tracks' | 'albums' | 'playlists') => void;
}

const tabs = [
  { id: 'tracks', label: '트랙', icon: IconMusic },
  { id: 'albums', label: '앨범', icon: IconDisc },
  { id: 'playlists', label: '플레이리스트', icon: IconPlaylist },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <nav className="flex gap-1">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id as 'tracks' | 'albums' | 'playlists')}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
            ${activeTab === id ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
        >
          <Icon size={18} />
          {label}
          {activeTab === id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-x-0 -bottom-px h-0.5 bg-white"
            />
          )}
        </button>
      ))}
    </nav>
  );
} 