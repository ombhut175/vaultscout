'use client';

import { useState, useEffect } from 'react';
import hackLog from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Nexlog Demonstration Component
 * Shows all hackLog methods in action for testing and documentation
 */
export function NexlogDemo() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    hackLog.componentMount('NexlogDemo', {
      initialFormData: formData,
      timestamp: new Date().toISOString()
    });

    return () => {
      hackLog.dev('NexlogDemo component unmounting');
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    hackLog.componentUpdate('NexlogDemo', {
      field,
      oldValue: formData[field as keyof typeof formData],
      newValue: value
    });

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const simulateApiCall = async () => {
    const startTime = Date.now();
    hackLog.performanceStart('API Simulation');

    try {
      setIsLoading(true);
      hackLog.storeAction('setLoading', { loading: true });

      // Simulate API request
      hackLog.apiRequest('POST', '/api/demo', formData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      const mockResponse = {
        id: Math.floor(Math.random() * 1000),
        ...formData,
        createdAt: new Date().toISOString()
      };

      hackLog.apiSuccess('POST', '/api/demo', mockResponse);
      setMessage('✅ Demo API call successful!');

      const duration = Date.now() - startTime;
      hackLog.performanceEnd('API Simulation', duration);

    } catch (error) {
      hackLog.apiError('POST', '/api/demo', error);
      hackLog.error('Demo API call failed', error);
      setMessage('❌ Demo API call failed!');
    } finally {
      setIsLoading(false);
      hackLog.storeAction('setLoading', { loading: false });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    hackLog.formSubmit('DemoForm', formData);

    // Simulate validation
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';

    if (Object.keys(errors).length > 0) {
      hackLog.formValidation('DemoForm', { errors });
      setMessage('⚠️ Please fill in all fields');
      return;
    }

    simulateApiCall();
  };

  const testCacheMethods = () => {
    hackLog.cacheHit('demo-data');
    hackLog.cacheMiss('user-profile');
    setMessage('💾 Cache operations logged');
  };

  const testPerformanceMethods = () => {
    hackLog.performanceStart('Demo Operation');
    
    setTimeout(() => {
      hackLog.performanceEnd('Demo Operation', 500);
      setMessage('⏱️ Performance tracking logged');
    }, 500);
  };

  const testFeatureMethods = () => {
    hackLog.feature('Demo Feature', true, { userId: 'demo-user' });
    setMessage('🎯 Feature flag logged');
  };

  const testNavigationMethods = () => {
    hackLog.routeChange('/demo', '/demo/nexlog');
    setMessage('🧭 Navigation logged');
  };

  const testDataProcessing = () => {
    hackLog.dataProcess('Demo Data Processing', 10, 8);
    setMessage('📊 Data processing logged');
  };

  const testAuthMethods = () => {
    hackLog.authLogin('demo-user-123');
    setTimeout(() => {
      hackLog.authLogout('demo-user-123');
    }, 1000);
    setMessage('🔐 Auth events logged');
  };

  const testErrorLogging = () => {
    try {
      throw new Error('This is a demo error for testing');
    } catch (error) {
      hackLog.error('Demo error caught', error);
      setMessage('❌ Error logging tested');
    }
  };

  const testWarningInfo = () => {
    hackLog.warn('This is a demo warning');
    hackLog.info('This is a demo info message');
    setMessage('ℹ️ Warning and info logged');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Nexlog Integration Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This component demonstrates all Nexlog methods. Open DevTools Console to see the structured logs!
            </AlertDescription>
          </Alert>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? '⏳ Processing...' : '📝 Submit Form (API Demo)'}
            </Button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button onClick={testCacheMethods} variant="outline" size="sm">
              💾 Test Cache
            </Button>
            
            <Button onClick={testPerformanceMethods} variant="outline" size="sm">
              ⏱️ Test Performance
            </Button>
            
            <Button onClick={testFeatureMethods} variant="outline" size="sm">
              🎯 Test Features
            </Button>
            
            <Button onClick={testNavigationMethods} variant="outline" size="sm">
              🧭 Test Navigation
            </Button>
            
            <Button onClick={testDataProcessing} variant="outline" size="sm">
              📊 Test Data Processing
            </Button>
            
            <Button onClick={testAuthMethods} variant="outline" size="sm">
              🔐 Test Auth
            </Button>
            
            <Button onClick={testErrorLogging} variant="outline" size="sm">
              ❌ Test Error
            </Button>
            
            <Button onClick={testWarningInfo} variant="outline" size="sm">
              ⚠️ Test Warn/Info
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>How to use:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open DevTools Console (F12)</li>
              <li>Fill out the form and submit to see API logging</li>
              <li>Click buttons to test different logging methods</li>
              <li>Watch the structured logs with emojis and context</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NexlogDemo;
