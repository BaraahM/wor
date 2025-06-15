import { Box, Paper, Group } from '@mantine/core';
import Text from '@/components/atoms/Text/Text';
import Button from '@/components/atoms/Button/Button';
import { Template } from '@/components/molecules/TemplateGalleryList/TemplateGalleryList';

interface TemplatePreviewProps {
  selectedTemplate: Template | null;
}

const TemplatePreview = ({ selectedTemplate }: TemplatePreviewProps) => {
  if (!selectedTemplate) {
    return (
      <Box
        style={{
          flex: 1,
          backgroundColor: 'var(--mantine-color-gray-0)',
          padding: '2rem',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text size="lg" c="dimmed">
          Select a template to view its preview
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        flex: 1,
        backgroundColor: 'var(--mantine-color-gray-0)',
        padding: '2rem',
        overflow: 'auto'
      }}
    >
      <Paper
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '2.5rem',
          border: '1px solid var(--mantine-color-gray-3)',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          borderRadius: 0,
        }}
      >
        <Text size="xl" fw={600} mb="xl" ta="center" c="dark.6">
          {selectedTemplate.name}
        </Text>

        <Text size="md" mb="xl" style={{ lineHeight: 1.6 }} c="dark.6">
          {typeof selectedTemplate.content === 'string' 
            ? selectedTemplate.content 
            : selectedTemplate.content.map(block => 
                block.children.map(child => child.text).join('')
              ).join('\n\n')
          }
        </Text>

        <Group justify="flex-end" mt="xl">
          <Button
            radius={50}
            customStyles={{
              backgroundColor: 'var(--mantine-color-dark-9)',
              color: 'var(--mantine-color-white)',
              transition: 'all 0.2s ease',
            }}
            customHoverStyles={{
              backgroundColor: 'var(--mantine-color-dark-7)',
              transform: 'scale(1.03)',
            }}
            onClick={() => {
              // Open editor in new tab with template data
              const contentToPass = typeof selectedTemplate.content === 'string' 
                ? selectedTemplate.content 
                : JSON.stringify(selectedTemplate.content);
              const editorUrl = `http://localhost:3001/editor?template=${encodeURIComponent(selectedTemplate.name)}&content=${encodeURIComponent(contentToPass)}`;
              window.open(editorUrl, '_blank');
            }}
          >
            Start from this template
          </Button>
        </Group>
      </Paper>
    </Box>
  );
};

export default TemplatePreview;