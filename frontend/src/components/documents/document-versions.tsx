'use client';

import { useDocumentVersions } from '@/hooks/useDocumentVersions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';
import hackLog from '@/lib/logger';

interface DocumentVersionsProps {
  documentId: string;
}

export function DocumentVersions({ documentId }: DocumentVersionsProps) {
  const { versions, isLoading, isError, error } = useDocumentVersions(documentId);

  hackLog.dev('DocumentVersions: Rendering', {
    documentId,
    versionsCount: versions.length,
    isLoading,
    isError,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load versions. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No version history available for this document.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Version count */}
      <div className="text-sm text-muted-foreground">
        {versions.length} {versions.length === 1 ? 'version' : 'versions'}
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        {versions.map((version, index) => (
          <div key={version.id} className="relative pl-12">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-6 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                      Version {version.version}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline" className="ml-2">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(version.createdAt)}</span>
                  </div>
                </div>

                {version.notes && (
                  <p className="text-sm text-muted-foreground">{version.notes}</p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
