'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppNavigation } from '@/components/app-navigation';
import { AdminOnly } from '@/components/access-control/role-guard';
import { useAuthUser } from '@/hooks/use-auth-store';
import { useAuthProtection } from '@/components/auth/auth-provider';
import { useUser } from '@/hooks/useUser';
import { useOrganization } from '@/hooks/useOrganization';
import {
  StatCard,
  ChartComponent,
  RecentActivity,
  SystemHealth,
  ChartDataPoint,
  ActivityItem,
} from '@/components/admin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Search,
  Users,
  HardDrive,
  AlertCircle,
  Shield,
} from 'lucide-react';
import hackLog from '@/lib/logger';
import { ROUTES } from '@/constants/routes';

export default function AdminDashboardPage() {
  const router = useRouter();
  const authUser = useAuthUser();
  const { shouldRender } = useAuthProtection();
  const { user: userDetails, isLoading: userLoading } = useUser(authUser?.id || null);

  // Get the user's first organization (assuming single org for now)
  const orgId = userDetails?.organizations?.[0]?.id || null;
  const userRole = userDetails?.organizations?.[0]?.role || null;
  const { organization, isLoading: orgLoading, isError: orgError } = useOrganization(orgId);

  // State for chart date ranges
  const [uploadsDateRange, setUploadsDateRange] = useState<'7' | '30' | '90'>('30');
  const [searchesDateRange, setSearchesDateRange] = useState<'7' | '30' | '90'>('30');

  hackLog.dev('AdminDashboardPage: Rendering', {
    authUserId: authUser?.id,
    orgId,
    userRole,
    hasOrgStats: !!organization?.stats,
  });

  // Redirect non-admins
  useEffect(() => {
    if (!userLoading && userRole && userRole !== 'admin') {
      hackLog.warn('AdminDashboardPage: Non-admin user attempted access', {
        userId: authUser?.id,
        role: userRole,
      });
      router.push(ROUTES.DASHBOARD);
    }
  }, [userRole, userLoading, authUser?.id, router]);

  if (!shouldRender || userLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error if organization data failed to load
  if (orgError || !organization) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavigation />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load organization data. Please try again later.
            </AlertDescription>
          </Alert>
        </main>
      </div>
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

  // Mock data for charts (replace with real API calls)
  const uploadsData: ChartDataPoint[] = generateMockChartData(parseInt(uploadsDateRange));
  const searchesData: ChartDataPoint[] = generateMockChartData(parseInt(searchesDateRange));

  // Mock data for recent activity (replace with real API calls)
  const recentUploads: ActivityItem[] = [];
  const recentSearches: ActivityItem[] = [];
  const recentRegistrations: ActivityItem[] = [];

  // Mock data for system health (replace with real API calls)
  const systemHealth = {
    database: {
      name: 'Database',
      status: 'healthy' as const,
      responseTime: 45,
      message: 'PostgreSQL connection stable',
    },
    redis: {
      name: 'Redis',
      status: 'healthy' as const,
      responseTime: 12,
      message: 'Queue processing normal',
    },
    pinecone: {
      name: 'Pinecone',
      status: 'healthy' as const,
      responseTime: 89,
      message: 'Vector index operational',
    },
    huggingface: {
      name: 'HuggingFace',
      status: 'healthy' as const,
      responseTime: 234,
      message: 'Embedding API responsive',
    },
  };

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-[#0B1020] dark:to-[#0A0F1D]">
          <AppNavigation />
          <main className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You do not have permission to access this page. Admin access required.
              </AlertDescription>
            </Alert>
          </main>
        </div>
      }
    >
      <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:from-[#0B1020] dark:to-[#0A0F1D] dark:text-slate-100 overflow-hidden">
        {/* Premium background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 blur-3xl" />
          
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--color-border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--color-border)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "-1px -1px",
            }}
          />
        </div>

        <AppNavigation />
        <main className="relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Monitor system performance and user activity
                </p>
              </div>
            </div>

            {/* Key Metrics with premium styling */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Documents"
                value={stats.totalDocuments}
                icon={<FileText className="h-4 w-4" />}
                description="Uploaded documents"
              />
              <StatCard
                title="Total Searches"
                value="N/A"
                icon={<Search className="h-4 w-4" />}
                description="Last 30 days"
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<Users className="h-4 w-4" />}
                description="Active users"
              />
              <StatCard
                title="Storage Used"
                value={formatStorage(stats.storageUsed)}
                icon={<HardDrive className="h-4 w-4" />}
                description="Total storage"
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <ChartComponent
                title="Document Uploads"
                data={uploadsData}
                type="line"
                dateRange={uploadsDateRange}
                onDateRangeChange={setUploadsDateRange}
                valueLabel="Uploads"
                color="hsl(var(--primary))"
              />
              <ChartComponent
                title="Search Queries"
                data={searchesData}
                type="bar"
                dateRange={searchesDateRange}
                onDateRangeChange={setSearchesDateRange}
                valueLabel="Searches"
                color="hsl(var(--chart-2))"
              />
            </div>

            {/* Recent Activity and System Health */}
            <div className="grid gap-6 md:grid-cols-2">
              <RecentActivity
                uploads={recentUploads}
                searches={recentSearches}
                registrations={recentRegistrations}
              />
              <SystemHealth services={systemHealth} />
            </div>
          </div>
        </main>
      </div>
    </AdminOnly>
  );
}

// Helper function to generate mock chart data
function generateMockChartData(days: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString(),
      value: Math.floor(Math.random() * 50) + 10,
    });
  }

  return data;
}
