'use client';

import DocumentEditor from '@/components/templates/DocumentEditor';
import RightPanel from '@/components/organisms/RightPanel/RightPanel';
import { useRouter } from 'next/navigation';

const DocumentEditorPage = () => {
  const router = useRouter();

  const handleExploreTemplates = () => {
    router.push('/home/templates');
  };

  const handleUploadDocument = () => {
    router.push('/home');
  };

  return (
    <>
      <DocumentEditor />
      <RightPanel
        onExploreTemplates={handleExploreTemplates}
        onUploadDocument={handleUploadDocument}
      />
    </>
  );
};

export default DocumentEditorPage;