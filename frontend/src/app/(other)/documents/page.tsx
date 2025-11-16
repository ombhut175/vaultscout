'use client';

import { DocumentList } from '@/components/documents/document-list';
import { DocumentFilters } from '@/components/documents/document-filters';
import { DocumentDeleteDialog } from '@/components/documents/document-delete-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

export default function DocumentsPage() {
  const router = useRouter();

  const handleUploadClick = () => {
    hackLog.dev('DocumentsPage: Upload button clicked');
    router.push('/documents/upload' as any);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Manage and search your uploaded documents
          </p>
        </div>
        <Button onClick={handleUploadClick}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <DocumentFilters />

      {/* Document List */}
      <DocumentList />

      {/* Delete Dialog */}
      <DocumentDeleteDialog />
    </div>
  );
}
