"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AppNavigation } from "@/components/app-navigation";
import hackLog from "@/lib/logger";
import { 
  Activity, 
  Server, 
  Clock, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Database,
  Shield,
  Zap,
  Bug,
  Trash2
} from 'lucide-react';

// 🚨 FOLLOWS HACKATHON RULES - Import from correct locations
import { useTesting } from '@/hooks/useTesting';
import { useTestingStore, getStoreState } from '@/lib/store';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES, DEBUG_MESSAGES } from '@/constants/messages';
import { APP_CONFIG, DEBUG_CONFIG } from '@/constants/config';

const FeatureIcons = {
  auth: Shield,
  database: Database,
  api: Server,
  supabase: Zap
};

export default function TestingPage() {
  React.useEffect(() => {
    hackLog.componentMount('TestingPage', {
      route: '/testing',
      timestamp: new Date().toISOString(),
    });
  }, []);

  console.log(`🚀 [${DEBUG_MESSAGES.COMPONENT_RENDERED}] TestingPage rendered`);
  
  // SWR hook for data fetching - FOLLOWS RULES
  const { data, loading, error, refreshData, resetData, addTestData } = useTesting();
  
  // Zustand store for UI state - FOLLOWS RULES
  const { 
    lastRefresh, 
    systemStatus, 
    testingData 
  } = useTestingStore();

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getEnvironmentBadgeVariant = (env: string) => {
    switch (env) {
      case 'production':
        return 'destructive';
      case 'staging':
        return 'secondary';
      case 'development':
      default:
        return 'default';
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Use either SWR data or store data (for optimistic updates)
  const displayData = data || testingData;

  console.log(`📊 [${DEBUG_MESSAGES.COMPONENT_RENDERED}] Current state:`, { 
    hasData: !!displayData, 
    loading, 
    error: !!error, 
    systemStatus 
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-8">
        {/* Header with Debug Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🚀 API Testing Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              {APP_CONFIG.DESCRIPTION} - SWR + Zustand + Hackathon Rules
              <span className="ml-2">
                Status: <span className={getSystemStatusColor()}>{systemStatus.toUpperCase()}</span>
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={refreshData} 
              disabled={loading}
              className="gap-2"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            
            {/* Debug controls for hackathon - FOLLOWS RULES */}
            {DEBUG_CONFIG.ENABLE_DEBUG_PANEL && (
              <>
                <Button onClick={addTestData} variant="secondary" className="gap-2">
                  <Bug className="h-4 w-4" />
                  Add Test Data
                </Button>
                <Button onClick={resetData} variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Alerts - FOLLOWS RULES */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ❌ API Error: {typeof error === 'string' ? error : ERROR_MESSAGES.API_ERROR}
            </AlertDescription>
          </Alert>
        )}

        {displayData && !error && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              {SUCCESS_MESSAGES.API_CONNECTED} Last updated: {formatTimestamp(displayData.timestamp)}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {loading && !displayData ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: APP_CONFIG.SKELETON_COUNT }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-2" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayData ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">🕒 Server Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatUptime(displayData.stats.uptime)}</div>
                  <p className="text-xs text-muted-foreground">
                    System running smoothly
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">📊 Total Requests</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayData.stats.requests.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    API calls processed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">👥 Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayData.stats.users}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently online
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">⚡ API Status</CardTitle>
                  <Activity className={`h-4 w-4 ${getSystemStatusColor()}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStatus === 'healthy' ? 'Healthy' : systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus === 'healthy' ? INFO_MESSAGES.SYSTEM_HEALTHY : INFO_MESSAGES.CHECK_CONSOLE}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    🖥️ System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant={getEnvironmentBadgeVariant(displayData.environment)}>
                      {displayData.environment.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Version</span>
                    <span className="text-sm text-muted-foreground">{displayData.version}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {lastRefresh ? formatTimestamp(lastRefresh.toISOString()) : 'Never'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    ✨ Available Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {displayData.features.map((feature: any) => {
                      const IconComponent = FeatureIcons[feature as keyof typeof FeatureIcons] || CheckCircle2;
                      return (
                        <div key={feature} className="flex items-center gap-3">
                          <IconComponent className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium capitalize">{feature}</span>
                          <Badge variant="outline" className="ml-auto">
                            ✅ Active
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Raw Data & Debug Panel */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>📄 Raw API Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto max-h-64">
                    {JSON.stringify(displayData, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Debug Panel for Development - FOLLOWS RULES */}
              {DEBUG_CONFIG.ENABLE_DEBUG_PANEL && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      🧪 Debug Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => {
                          console.log('📊 [Debug] Store state:', getStoreState());
                        }}
                        size="sm"
                        variant="outline"
                      >
                        🏪 Log Store
                      </Button>
                      <Button 
                        onClick={() => {
                          console.log('📡 [Debug] SWR data:', { data, loading, error });
                        }}
                        size="sm"
                        variant="outline"
                      >
                        📡 Log SWR
                      </Button>
                      <Button 
                        onClick={addTestData}
                        size="sm"
                        variant="secondary"
                      >
                        🧪 Test Data
                      </Button>
                      <Button 
                        onClick={resetData}
                        size="sm"
                        variant="destructive"
                      >
                        🗑️ Clear All
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-xs space-y-1">
                      <div>🔄 Loading: {loading ? 'Yes' : 'No'}</div>
                      <div>❌ Error: {error || 'None'}</div>
                      <div>📊 Status: {systemStatus}</div>
                      <div>📦 Has Data: {displayData ? 'Yes' : 'No'}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : !loading && !error && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{ERROR_MESSAGES.NO_DATA_AVAILABLE}</h3>
                <p className="text-muted-foreground mb-4">
                  {INFO_MESSAGES.CLICK_REFRESH}
                </p>
                <Button onClick={refreshData}>
                  🔄 Load Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
