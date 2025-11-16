'use client';

import { useUsers } from '@/hooks/useUsers';
import { useUsersStore } from '@/hooks/use-users-store';
import { UserCard } from './user-card';
import { UserFilters } from './user-filters';
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
import { AlertCircle, Users as UsersIcon } from 'lucide-react';
import { PremiumCardWrapper } from '@/components/ui/premium-card-wrapper';
import { motion } from 'framer-motion';
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

  // Loading skeleton with premium styling
  if (isLoading) {
    return (
      <div className="space-y-6">
        <UserFilters />
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
              <Skeleton className="h-4 w-1/3" />
            </motion.div>
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

  // Empty state with premium styling
  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <UserFilters />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-slate-900/40 backdrop-blur-md p-12 shadow-lg text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UsersIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">
            {filters.searchTerm ? 'No users found' : 'No users yet'}
          </p>
          <p className="text-muted-foreground">
            {filters.searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Add users to get started with your organization.'}
          </p>
        </motion.div>
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

      {/* User grid with premium cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user, index) => (
          <PremiumCardWrapper key={user.id} index={index}>
            <UserCard user={user} />
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
