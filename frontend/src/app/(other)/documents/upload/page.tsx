'use client';

import { DocumentUploadForm } from '@/components/documents/document-upload-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

export default function DocumentUploadPage() {
  const router = useRouter();

  const handleBack = () => {
    hackLog.dev('DocumentUploadPage: Back button clicked');
    router.push('/documents' as any);
  };

  const handleSuccess = (documentId: string) => {
    hackLog.dev('DocumentUploadPage: Upload successful', { documentId });
    router.push(`/documents/${documentId}` as any);
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" onClick={handleBack} className="pl-0">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Documents
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
        <p className="text-muted-foreground mt-2">
          Upload a new document to your knowledge base
        </p>
      </div>

      {/* Upload Form */}
      <DocumentUploadForm onSuccess={handleSuccess} onCancel={handleBack} />
    </div>
  );
}
