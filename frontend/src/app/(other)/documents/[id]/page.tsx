'use client';

import { use } from 'react';
import { DocumentDetail } from '@/components/documents/document-detail';
import { ChunkViewer } from '@/components/documents/chunk-viewer';
import { DocumentVersions } from '@/components/documents/document-versions';
import { DocumentDeleteDialog } from '@/components/documents/document-delete-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import hackLog from '@/lib/logger';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  hackLog.dev('DocumentDetailPage: Rendering', { documentId: id });

  const handleBack = () => {
    hackLog.dev('DocumentDetailPage: Back button clicked');
    router.push('/documents' as any);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" onClick={handleBack} className="pl-0">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Documents
      </Button>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chunks">Chunks</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DocumentDetail documentId={id} />
        </TabsContent>

        <TabsContent value="chunks" className="space-y-6">
          <ChunkViewer documentId={id} />
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <DocumentVersions documentId={id} />
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <DocumentDeleteDialog onSuccess={handleBack} />
    </div>
  );
}
