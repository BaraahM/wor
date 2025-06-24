'use client';

import { Suspense, useMemo } from 'react';

import { useSearchParams } from 'next/navigation';
import { Toaster } from 'sonner';

import { PlateEditor } from '@/components/editor/plate-editor';
import { SettingsProvider } from '@/components/editor/settings';

function EditorContent() {
  const searchParams = useSearchParams();
  
  const templateData = useMemo(() => {
    const templateName = searchParams.get('template');
    const templateContent = searchParams.get('content');
    
    if (templateName || templateContent) {
      return {
        content: templateContent,
        name: templateName
      };
    }
    return null;
  }, [searchParams]);

  return (
    <div className="h-screen w-full">
      <SettingsProvider>
        <PlateEditor 
          initialTemplate={templateData}
        />
      </SettingsProvider>

      <Toaster />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
