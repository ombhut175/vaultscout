'use client';

import { useDocument } from '@/hooks/useDocument';
import { DocumentsAPI } from '@/lib/api/documents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, Calendar, User, Tag, Shield, Download } from 'lucide-react';
import { useDocsStore } from '@/hooks/use-docs-store';
import hackLog from '@/lib/logger';

interface DocumentDetailProps {
  documentId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function DocumentDetail({ 
  documentId, 
  onEdit, 
  onDelete, 
  showActions = true 
}: DocumentDetailProps) {
  const { document, isLoading, isError, error } = useDocument(documentId);
  const { setSelectedDoc, setDocDialogOpen, setDeleteDialogOpen } = useDocsStore();

  hackLog.dev('DocumentDetail: Rendering', {
    documentId,
    isLoading,
    isError,
    hasDocument: !!document,
  });

  const handleEdit = () => {
    if (document) {
      hackLog.dev('DocumentDetail: Edit clicked', { documentId });
      setSelectedDoc(document);
      setDocDialogOpen(true);
      onEdit?.();
    }
  };

  const handleDelete = () => {
    if (document) {
      hackLog.dev('DocumentDetail: Delete clicked', { documentId });
      setSelectedDoc(document);
      setDeleteDialogOpen(true);
      onDelete?.();
    }
  };

  const handleDownload = async () => {
    if (document) {
      hackLog.dev('DocumentDetail: Download clicked', { documentId });
      try {
        await DocumentsAPI.download(document.id, document.title);
      } catch (error) {
        hackLog.error('DocumentDetail: Download failed', { error });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'bg-green-500/10 text-green-500';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500';
      case 'queued':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError || !document) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load document. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{document.title}</CardTitle>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline">{document.fileType}</Badge>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metadata */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Document ID</p>
              <p className="text-sm text-muted-foreground">{document.id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Uploaded</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(document.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(document.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Created By</p>
              <p className="text-sm text-muted-foreground">{document.createdBy}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Hash */}
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Content Hash</p>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {document.contentHash}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
