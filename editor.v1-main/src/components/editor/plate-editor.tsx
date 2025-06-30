'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { HEADING_KEYS } from '@udecode/plate-heading';
import { Plate } from '@udecode/plate/react';
import { useEditorRef, useEditorString } from '@udecode/plate/react';
import { ArrowLeft, User } from 'lucide-react';

import { AISidebarProvider, useAISidebar } from '@/components/editor/ai-sidebar-context';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { VersionHistoryProvider } from '@/components/editor/version-history-context';
import { AISidebar } from '@/components/ui/ai-sidebar';
import { Button } from '@/components/ui/button';
import { DocumentOutline } from '@/components/ui/document-outline';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/ui/floating-toolbar-buttons';
import { HeadingElement } from '@/components/ui/heading-element';
import { MagicWandButton } from '@/components/ui/magic-wand-button';
import { VersionHistoryButton } from '@/components/ui/version-history-button';

interface PlateEditorProps {
  initialTemplate?: {
    content: string | null;
    name: string | null;
  } | null;
}

function AISidebarComponent() {
  const { closeSidebar, isOpen } = useAISidebar();
  const editor = useEditorRef();
  
  // Get current editor content using the hook
  const editorString = useEditorString();
  
  const getEditorContent = () => {
    if (!editor) return '';
    try {
      // Get the editor content as plain text using the correct Plate v48 API
      return editorString || '';
    } catch (error) {
      console.error('Failed to get editor content:', error);
      return '';
    }
  };

  // Update editor content
  const handleUpdateEditorContent = (newContent: string) => {
    if (!editor) return;
    try {
      // Parse the new content and set it
      const lines = newContent.split('\n');
      const nodes = lines.map(line => ({
        children: [{ text: line }],
        type: 'p',
      }));
      
      editor.tf.setValue(nodes.length > 0 ? nodes : [{ children: [{ text: '' }], type: 'p' }]);
    } catch (error) {
      console.error('Failed to update editor content:', error);
    }
  };

  return (
    <AISidebar 
      onClose={closeSidebar} 
      onUpdateEditorContent={handleUpdateEditorContent}
      editorContent={getEditorContent()}
      isOpen={isOpen}
    />
  );
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
          children: [{ text: initialTemplate.name || 'Document' }],
          type: 'h1',
        },
        {
          children: [{ text: '' }],
          type: 'p',
        },
        ...initialTemplate.content.split('\n\n').map(paragraph => ({
          children: [{ text: paragraph }],
          type: 'p',
        })),
      ];
    }
    return undefined;
  }, [initialTemplate]);

  // Highlight state for headings
  const [highlightedHeadingId, setHighlightedHeadingId] = React.useState<string | null>(null); // Sidebar
  const [highlightedEditorHeading, setHighlightedEditorHeading] = React.useState<{ id: string, highlightKey: number } | null>(null); // Editor

  const editor = useCreateEditor({
    value: templateValue,
  });

  // Handler for sidebar highlight (immediate)
  const handleSidebarHighlight = React.useCallback((id: string) => {
    setHighlightedHeadingId(id);
  }, []);

  // Handler for editor highlight (after scroll)
  const handleHighlightHeading = React.useCallback((heading) => {
    setHighlightedEditorHeading({ id: heading.id, highlightKey: heading.highlightKey });
    if (editor && heading.path) {
      editor.tf.select(heading.path);
    }
    setTimeout(() => setHighlightedEditorHeading(null), 4000);
  }, [editor]);

  // Plate components override to inject highlight (must be after editor is defined)
  React.useEffect(() => {
    Object.assign(editor.components ?? {}, {
      [HEADING_KEYS.h1]: (props) => <HeadingElement {...props} key={highlightedEditorHeading ? highlightedEditorHeading.highlightKey : undefined} variant="h1" highlighted={highlightedEditorHeading && props.element.id === highlightedEditorHeading.id} />,
      [HEADING_KEYS.h2]: (props) => <HeadingElement {...props} key={highlightedEditorHeading ? highlightedEditorHeading.highlightKey : undefined} variant="h2" highlighted={highlightedEditorHeading && props.element.id === highlightedEditorHeading.id} />,
      [HEADING_KEYS.h3]: (props) => <HeadingElement {...props} key={highlightedEditorHeading ? highlightedEditorHeading.highlightKey : undefined} variant="h3" highlighted={highlightedEditorHeading && props.element.id === highlightedEditorHeading.id} />,
      [HEADING_KEYS.h4]: (props) => <HeadingElement {...props} key={highlightedEditorHeading ? highlightedEditorHeading.highlightKey : undefined} variant="h4" highlighted={highlightedEditorHeading && props.element.id === highlightedEditorHeading.id} />,
      [HEADING_KEYS.h5]: (props) => <HeadingElement {...props} key={highlightedEditorHeading ? highlightedEditorHeading.highlightKey : undefined} variant="h5" highlighted={highlightedEditorHeading && props.element.id === highlightedEditorHeading.id} />,
      [HEADING_KEYS.h6]: (props) => <HeadingElement {...props} key={highlightedEditorHeading ? highlightedEditorHeading.highlightKey : undefined} variant="h6" highlighted={highlightedEditorHeading && props.element.id === highlightedEditorHeading.id} />,
    });
  }, [editor, highlightedEditorHeading]);

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
                  <DocumentOutline
                    onHighlightHeading={handleHighlightHeading}
                    onSidebarHighlight={handleSidebarHighlight}
                    editor={editor}
                    highlightedHeadingId={highlightedHeadingId}
                  />
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