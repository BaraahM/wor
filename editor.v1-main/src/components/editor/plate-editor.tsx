'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate/react';
import { ArrowLeft, User } from 'lucide-react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { AISidebarProvider, useAISidebar } from '@/components/editor/ai-sidebar-context';
import { MagicWandButton } from '@/components/ui/magic-wand-button';
import { AISidebar } from '@/components/ui/ai-sidebar';
import { VersionHistoryProvider } from '@/components/editor/version-history-context';
import { Button } from '@/components/ui/button';
import { DocumentOutline } from '@/components/ui/document-outline';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/ui/floating-toolbar-buttons';
import { VersionHistoryButton } from '@/components/ui/version-history-button';

interface PlateEditorProps {
  initialTemplate?: {
    name: string | null;
    content: string | null;
  } | null;
}

function AISidebarComponent() {
  const { isOpen, closeSidebar } = useAISidebar();

  return <AISidebar isOpen={isOpen} onClose={closeSidebar} />;
}

function MagicWandButtonComponent() {
  const { openSidebar } = useAISidebar();

  return <MagicWandButton onClick={openSidebar} />;
}

export function PlateEditor({ initialTemplate }: PlateEditorProps) {
  // Create initial value based on template to prevent flicker
  const templateValue = React.useMemo(() => {
    if (initialTemplate?.content) {
      return [
        {
          type: 'h1',
          children: [{ text: initialTemplate.name || 'Document' }],
        },
        {
          type: 'p',
          children: [{ text: '' }],
        },
        ...initialTemplate.content.split('\n\n').map(paragraph => ({
          type: 'p',
          children: [{ text: paragraph }],
        })),
      ];
    }
    return undefined;
  }, [initialTemplate]);

  const editor = useCreateEditor({
    value: templateValue
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <AISidebarProvider>
          <VersionHistoryProvider>
            <div className="flex h-screen flex-col">
              {/* Global Header */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-background sticky top-0 z-50">
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <VersionHistoryButton />
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="p-1 h-8 w-8 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex flex-1 relative">
                {/* Left Sidebar */}
                <div className="w-64 border-r border-border bg-background p-4 overflow-y-auto flex-shrink-0 z-10">
                  <DocumentOutline editor={editor} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative min-w-0">
                  {/* Editor Container */}
                  <EditorContainer
                    id="scroll_container"
                    variant="demo"
                    className="max-w-none flex-1 relative"
                  >
                    <Editor 
                      variant="demo" 
                      className="text-left min-h-[800px] w-full" 
                      autoFocus
                    />

                    <FloatingToolbar>
                      <FloatingToolbarButtons />
                    </FloatingToolbar>

                    {/* Magic Wand Button - positioned within editor container */}
                    <MagicWandButtonComponent />
                  </EditorContainer>
                </div>

                {/* AI Sidebar - positioned at the same level as left sidebar for stability */}
                <AISidebarComponent />
              </div>
            </div>
          </VersionHistoryProvider>
        </AISidebarProvider>
      </Plate>
    </DndProvider>
  );
}