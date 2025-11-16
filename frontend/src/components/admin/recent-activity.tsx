'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Search, 
  UserPlus, 
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import hackLog from '@/lib/logger';

export interface ActivityItem {
  id: string;
  type: 'upload' | 'search' | 'user_registration';
  userId: string;
  userEmail: string;
  action: string;
  metadata?: {
    documentTitle?: string;
    documentId?: string;
    searchQuery?: string;
    [key: string]: any;
  };
  timestamp: string;
}

export interface RecentActivityProps {
  uploads?: ActivityItem[];
  searches?: ActivityItem[];
  registrations?: ActivityItem[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
  onViewAll?: (type: 'uploads' | 'searches' | 'registrations') => void;
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  switch (type) {
    case 'upload':
      return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case 'search':
      return <Search className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'user_registration':
      return <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    default:
      return null;
  }
}

function ActivityList({ 
  items, 
  emptyMessage,
  onViewAll,
}: { 
  items: ActivityItem[]; 
  emptyMessage: string;
  onViewAll?: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="mt-0.5">
              <ActivityIcon type={item.type} />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-none">
                  {item.action}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                by {item.userEmail}
              </p>
              {item.metadata?.documentTitle && item.metadata?.documentId && (
                <Link
                  href={`/documents/${item.metadata.documentId}` as any}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {item.metadata.documentTitle}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              {item.metadata?.searchQuery && (
                <p className="text-xs text-muted-foreground italic">
                  &quot;{item.metadata.searchQuery}&quot;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {onViewAll && items.length >= 10 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="w-full"
        >
          View All
        </Button>
      )}
    </div>
  );
}

export function RecentActivity({
  uploads = [],
  searches = [],
  registrations = [],
  isLoading = false,
  isError = false,
  error,
  onViewAll,
}: RecentActivityProps) {
  hackLog.dev('RecentActivity: Rendering', {
    uploadsCount: uploads.length,
    searchesCount: searches.length,
    registrationsCount: registrations.length,
    isLoading,
    isError,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Failed to load recent activity. Please try again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uploads">
              Uploads ({uploads.length})
            </TabsTrigger>
            <TabsTrigger value="searches">
              Searches ({searches.length})
            </TabsTrigger>
            <TabsTrigger value="registrations">
              Users ({registrations.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="uploads" className="mt-4">
            <ActivityList
              items={uploads}
              emptyMessage="No recent uploads"
              onViewAll={onViewAll ? () => onViewAll('uploads') : undefined}
            />
          </TabsContent>
          <TabsContent value="searches" className="mt-4">
            <ActivityList
              items={searches}
              emptyMessage="No recent searches"
              onViewAll={onViewAll ? () => onViewAll('searches') : undefined}
            />
          </TabsContent>
          <TabsContent value="registrations" className="mt-4">
            <ActivityList
              items={registrations}
              emptyMessage="No recent user registrations"
              onViewAll={onViewAll ? () => onViewAll('registrations') : undefined}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
