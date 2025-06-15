'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate/react';
import { ArrowLeft, User } from 'lucide-react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { VersionHistoryProvider } from '@/components/editor/version-history-context';
import { Button } from '@/components/ui/button';
import { DocumentOutline } from '@/components/ui/document-outline';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/ui/floating-toolbar-buttons';
import { VersionHistoryButton } from '@/components/ui/version-history-button';

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
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
            <div className="flex flex-1 pt-[49px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-border bg-background p-4 overflow-y-auto">
                <DocumentOutline editor={editor} />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
              
                {/* Editor */}
                <EditorContainer
                  id="scroll_container"
                  variant="demo"
                  className="max-w-none flex-1"
                >
                  <Editor variant="demo" className="text-left" />

                  <FloatingToolbar>
                    <FloatingToolbarButtons />
                  </FloatingToolbar>
                </EditorContainer>
              </div>
            </div>
          </div>
        </VersionHistoryProvider>
      </Plate>
    </DndProvider>
  );
}