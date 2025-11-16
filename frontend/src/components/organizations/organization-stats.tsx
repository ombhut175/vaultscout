'use client';

import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, FolderTree, FileText, HardDrive } from 'lucide-react';
import hackLog from '@/lib/logger';

interface OrganizationStatsProps {
  orgId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function OrganizationStats({ orgId }: OrganizationStatsProps) {
  const { organization, isLoading, isError, error } = useOrganization(orgId);

  hackLog.dev('OrganizationStats: Rendering', {
    orgId,
    hasStats: !!organization?.stats,
    isLoading,
    isError,
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError || !organization) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Failed to load organization statistics. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  const stats = organization.stats || {
    totalUsers: 0,
    totalGroups: 0,
    totalDocuments: 0,
    storageUsed: 0,
  };

  const formatStorage = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Active users in organization"
      />
      <StatCard
        title="Total Groups"
        value={stats.totalGroups}
        icon={<FolderTree className="h-4 w-4 text-muted-foreground" />}
        description="Access control groups"
      />
      <StatCard
        title="Total Documents"
        value={stats.totalDocuments}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        description="Uploaded documents"
      />
      <StatCard
        title="Storage Used"
        value={formatStorage(stats.storageUsed)}
        icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
        description="Total storage consumed"
      />
    </div>
  );
}
