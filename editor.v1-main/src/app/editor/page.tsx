'use client';

import { Toaster } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { PlateEditor } from '@/components/editor/plate-editor';
import { SettingsProvider } from '@/components/editor/settings';

function EditorContent() {
  const searchParams = useSearchParams();
  const [templateData, setTemplateData] = useState<{
    name: string | null;
    content: string | null;
  } | null | undefined>(undefined);

  useEffect(() => {
    const templateName = searchParams.get('template');
    const templateContent = searchParams.get('content');
    
    setTemplateData({
      name: templateName,
      content: templateContent
    });
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
