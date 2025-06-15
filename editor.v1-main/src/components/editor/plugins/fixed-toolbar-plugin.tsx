
'use client';

import { createPlatePlugin } from '@udecode/plate/react';

import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

export const FixedToolbarPlugin = createPlatePlugin({
  key: 'fixed-toolbar',
  render: {
    beforeEditable: () => (
      <div className="fixed top-[55px] left-0 right-0 z-40 w-full">
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      </div>
    ),
  },
});
