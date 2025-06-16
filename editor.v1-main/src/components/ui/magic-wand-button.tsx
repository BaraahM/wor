
'use client';

import React from 'react';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MagicWandButtonProps {
  onClick: () => void;
  className?: string;
}

export function MagicWandButton({ onClick, className }: MagicWandButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute top-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#274F2D] text-white shadow-lg transition-all hover:bg-[#1e3d23] hover:shadow-xl',
        className
      )}
      aria-label="Open AI Assistant"
    >
      <Wand2 className="h-5 w-5" />
    </button>
  );
}
