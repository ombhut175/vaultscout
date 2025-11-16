'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  Server,
  Zap,
  Brain,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import hackLog from '@/lib/logger';

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  message?: string;
  lastChecked?: string;
}

export interface SystemHealthProps {
  services?: {
    database?: ServiceHealth;
    redis?: ServiceHealth;
    pinecone?: ServiceHealth;
    huggingface?: ServiceHealth;
  };
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
  onRefresh?: () => void;
}

function getStatusIcon(status: HealthStatus) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4" />;
    case 'down':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
}

function getStatusColor(status: HealthStatus) {
  switch (status) {
    case 'healthy':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
    case 'degraded':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    case 'down':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    default:
      return '';
  }
}

function getServiceIcon(serviceName: string) {
  switch (serviceName.toLowerCase()) {
    case 'database':
      return <Database className="h-5 w-5" />;
    case 'redis':
      return <Server className="h-5 w-5" />;
    case 'pinecone':
      return <Zap className="h-5 w-5" />;
    case 'huggingface':
      return <Brain className="h-5 w-5" />;
    default:
      return <Server className="h-5 w-5" />;
  }
}

function ServiceHealthCard({ service }: { service: ServiceHealth }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="mt-0.5 text-muted-foreground">
        {getServiceIcon(service.name)}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{service.name}</h4>
          <Badge
            variant="outline"
            className={cn('gap-1', getStatusColor(service.status))}
          >
            {getStatusIcon(service.status)}
            <span className="capitalize">{service.status}</span>
          </Badge>
        </div>
        {service.responseTime !== undefined && (
          <p className="text-xs text-muted-foreground">
            Response time: <span className="font-medium">{service.responseTime}ms</span>
          </p>
        )}
        {service.message && (
          <p className="text-xs text-muted-foreground">{service.message}</p>
        )}
      </div>
    </div>
  );
}

export function SystemHealth({
  services = {},
  isLoading = false,
  isError = false,
  error,
  onRefresh,
}: SystemHealthProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  hackLog.dev('SystemHealth: Rendering', {
    servicesCount: Object.keys(services).length,
    isLoading,
    isError,
  });

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
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
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Failed to load system health. Please try again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const servicesList = [
    services.database,
    services.redis,
    services.pinecone,
    services.huggingface,
  ].filter((service): service is ServiceHealth => service !== undefined);

  const overallStatus: HealthStatus = servicesList.some(s => s.status === 'down')
    ? 'down'
    : servicesList.some(s => s.status === 'degraded')
    ? 'degraded'
    : 'healthy';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>System Health</CardTitle>
          <Badge
            variant="outline"
            className={cn('gap-1 w-fit', getStatusColor(overallStatus))}
          >
            {getStatusIcon(overallStatus)}
            <span className="capitalize">Overall: {overallStatus}</span>
          </Badge>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {servicesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No service health data available
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {servicesList.map((service) => (
              <ServiceHealthCard key={service.name} service={service} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
