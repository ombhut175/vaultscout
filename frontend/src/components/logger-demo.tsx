'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import hackLog from '@/lib/logger';

/**
 * Logger Demo Component
 * Demonstrates all hackLog methods with real examples
 */
export default function LoggerDemo() {
  const [count, setCount] = useState(0);
  const [user, _setUser] = useState({ name: 'John Doe', email: 'john@example.com', role: 'admin' });

  useEffect(() => {
    hackLog.componentMount('LoggerDemo', { initialCount: count });
    
    return () => {
      hackLog.dev('LoggerDemo component unmounting');
    };
  }, []);

  const handleApiDemo = async () => {
    hackLog.group('API Demo Sequence');
    
    // Simulate API request
    hackLog.apiRequest('POST', '/api/users', { name: 'New User', email: 'new@example.com' });
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success
    const response = { id: 123, name: 'New User', created: new Date() };
    hackLog.apiSuccess('POST', '/api/users', response);
    
    hackLog.groupEnd();
  };

  const handlePerformanceDemo = () => {
    hackLog.performanceStart('Heavy Computation');
    
    // Simulate some work
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
    
    hackLog.performanceEnd('Heavy Computation');
    hackLog.info('Computation completed', { result: result.toFixed(2) });
  };

  const handleStateDemo = () => {
    const newCount = count + 1;
    hackLog.storeAction('increment counter', { oldValue: count, newValue: newCount });
    setCount(newCount);
    hackLog.componentUpdate('LoggerDemo', { count: newCount });
  };

  const handleObjectDemo = () => {
    const complexObject = {
      user,
      settings: {
        theme: 'dark',
        notifications: true,
        features: ['logging', 'debugging', 'performance']
      },
      metadata: {
        lastLogin: new Date(),
        sessionId: 'abc123',
        permissions: ['read', 'write', 'admin']
      }
    };

    hackLog.info('Complex object logging demo', complexObject);
    hackLog.table([
      { name: 'Alice', age: 25, role: 'developer' },
      { name: 'Bob', age: 30, role: 'designer' },
      { name: 'Charlie', age: 35, role: 'manager' }
    ], 'Team Members');
    
    hackLog.dir(user, 'User object inspection');
  };

  const handleFormDemo = () => {
    const formData = { email: user.email, message: 'Hello world!' };
    hackLog.formSubmit('ContactForm', formData);
    
    // Simulate validation error
    hackLog.formValidation('ContactForm', { 
      email: 'Email is required',
      message: 'Message must be at least 10 characters'
    });
  };

  const handleErrorDemo = () => {
    try {
      throw new Error('Demo error for logging');
    } catch (error) {
      hackLog.error('Demo error occurred', error);
      hackLog.trace('Error trace demo');
    }
  };

  const handleFeatureDemo = () => {
    hackLog.feature('advanced-logging', true, { version: '1.0', user: user.role });
    hackLog.feature('beta-ui', false, { reason: 'user-not-eligible' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🛠️ Custom Logger Demo</CardTitle>
          <CardDescription>
            Click the buttons below to see different logging methods in action. 
            Open your browser DevTools Console to see the results!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button onClick={handleApiDemo} variant="outline">
              🚀 API Demo
            </Button>
            
            <Button onClick={handlePerformanceDemo} variant="outline">
              ⏱️ Performance
            </Button>
            
            <Button onClick={handleStateDemo} variant="outline">
              📊 State ({count})
            </Button>
            
            <Button onClick={handleObjectDemo} variant="outline">
              📦 Objects
            </Button>
            
            <Button onClick={handleFormDemo} variant="outline">
              📝 Forms
            </Button>
            
            <Button onClick={handleErrorDemo} variant="outline">
              ❌ Errors
            </Button>
            
            <Button onClick={handleFeatureDemo} variant="outline">
              🎯 Features
            </Button>
            
            <Button 
              onClick={() => {
                hackLog.routeChange('/current', '/new-page');
                hackLog.authLogin(user.email);
                hackLog.cacheHit('user-data');
                hackLog.dataProcess('user-transform', 1, 1);
              }}
              variant="outline"
            >
              🔄 Misc
            </Button>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">💡 Logger Benefits</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Objects passed directly to console (no stringification)</li>
              <li>✅ Expandable/collapsible in DevTools</li>
              <li>✅ Uses native console.time/table/dir/trace when available</li>
              <li>✅ Structured logging in production</li>
              <li>✅ Configurable log levels via environment variables</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
