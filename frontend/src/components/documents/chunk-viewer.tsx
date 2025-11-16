'use client';

import { useState } from 'react';
import { useDocumentChunks } from '@/hooks/useDocumentChunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Copy, Check } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import hackLog from '@/lib/logger';

interface ChunkViewerProps {
  documentId: string;
}

export function ChunkViewer({ documentId }: ChunkViewerProps) {
  const [page, setPage] = useState(1);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);
  const { chunks, total, isLoading, isError, error } = useDocumentChunks(documentId, page, 20);

  const totalPages = Math.ceil(total / 20);

  hackLog.dev('ChunkViewer: Rendering', {
    documentId,
    chunksCount: chunks.length,
    total,
    page,
    totalPages,
    isLoading,
    isError,
  });

  const handleCopyChunk = async (chunkId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChunkId(chunkId);
      toast.success('Chunk copied to clipboard');
      hackLog.dev('ChunkViewer: Chunk copied', { chunkId });
      
      setTimeout(() => {
        setCopiedChunkId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy chunk');
      hackLog.error('ChunkViewer: Failed to copy chunk', { error, chunkId });
    }
  };

  const handlePageChange = (newPage: number) => {
    hackLog.dev('ChunkViewer: Page changed', { from: page, to: newPage });
    setPage(newPage);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
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
          {error?.message || 'Failed to load chunks. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (chunks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No chunks found for this document.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chunk count */}
      <div className="text-sm text-muted-foreground">
        Showing {chunks.length} of {total} chunks
      </div>

      {/* Chunks list */}
      <div className="space-y-4">
        {chunks.map((chunk) => (
          <Card key={chunk.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {chunk.sectionTitle || `Chunk ${chunk.position}`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyChunk(chunk.id, chunk.text)}
                >
                  {copiedChunkId === chunk.id ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{chunk.text}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Position: {chunk.position}</span>
                {chunk.page && <span>Page: {chunk.page}</span>}
                <span>Tokens: {chunk.tokenCount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && handlePageChange(page - 1)}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1);

                if (!showPage) {
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === page}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && handlePageChange(page + 1)}
                  className={
                    page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
