'use client';

import { useUsers } from '@/hooks/useUsers';
import { useUsersStore } from '@/hooks/use-users-store';
import { UserCard } from './user-card';
import { UserFilters } from './user-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import hackLog from '@/lib/logger';

interface UserListProps {
  orgId?: string;
}

export function UserList({ orgId }: UserListProps) {
  const { filters, setPage } = useUsersStore();
  const { users, total, page, totalPages, isLoading, isError, error } = useUsers({
    page: filters.page,
    limit: filters.limit,
    orgId: orgId || filters.orgId || undefined,
  });

  hackLog.dev('UserList: Rendering', {
    usersCount: users.length,
    total,
    page,
    totalPages,
    isLoading,
    isError,
  });

  const handlePageChange = (newPage: number) => {
    hackLog.dev('UserList: Page changed', { from: page, to: newPage });
    setPage(newPage);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <UserFilters />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <UserFilters />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load users. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="space-y-4">
        <UserFilters />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {filters.searchTerm
                ? 'No users found matching your search.'
                : 'No users found. Add users to get started.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserFilters />
      
      {/* User count */}
      <div className="text-sm text-muted-foreground">
        Showing {users.length} of {total} users
      </div>

      {/* User grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
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
