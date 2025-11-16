'use client';

import { useDocuments } from '@/hooks/useDocuments';
import { useDocsStore } from '@/hooks/use-docs-store';
import { DocumentCard } from './document-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { PremiumCardWrapper } from '@/components/ui/premium-card-wrapper';
import { motion } from 'framer-motion';
import hackLog from '@/lib/logger';

interface DocumentListProps {
  orgId?: string;
}

export function DocumentList({ orgId }: DocumentListProps) {
  const { filters, setPage } = useDocsStore();
  const { documents, total, page, totalPages, isLoading, isError, error } = useDocuments({
    page: filters.page,
    limit: filters.limit,
    orgId: orgId || filters.orgId || undefined,
    status: filters.status || undefined,
    fileType: filters.fileType || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    searchTerm: filters.searchTerm,
  });

  hackLog.dev('DocumentList: Rendering', {
    documentsCount: documents.length,
    total,
    page,
    totalPages,
    isLoading,
    isError,
  });

  const handlePageChange = (newPage: number) => {
    hackLog.dev('DocumentList: Page changed', { from: page, to: newPage });
    setPage(newPage);
  };

  // Loading skeleton with premium styling
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-lg"
            >
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/3 mt-3" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load documents. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state with premium styling
  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-slate-900/40 backdrop-blur-md p-12 shadow-lg text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-lg font-semibold text-foreground mb-2">
          {filters.searchTerm ? 'No documents found' : 'No documents yet'}
        </p>
        <p className="text-muted-foreground">
          {filters.searchTerm
            ? 'Try adjusting your search or filters.'
            : 'Upload documents to get started.'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document count */}
      <div className="text-sm text-muted-foreground">
        Showing {documents.length} of {total} documents
      </div>

      {/* Document grid with premium cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document, index) => (
          <PremiumCardWrapper key={document.id} index={index}>
            <DocumentCard document={document} />
          </PremiumCardWrapper>
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
                // Show first page, last page, current page, and pages around current
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1);

                if (!showPage) {
                  // Show ellipsis for skipped pages
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
