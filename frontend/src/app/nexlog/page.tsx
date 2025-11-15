import LoggerDemo from '@/components/logger-demo';
import { AppNavigation } from '@/components/app-navigation';
import hackLog from '@/lib/logger';

/**
 * Custom Logger Demo Page
 * Showcases the custom logger integration and all available methods
 */
export default function LoggerPage() {
  // Server-side logging example
  hackLog.info('Custom logger demo page rendered', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">📝 Custom Logger Integration</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This page demonstrates the complete custom logger integration for hackathon development.
            All console.log statements have been replaced with structured hackLog methods.
            <strong> Open DevTools Console to see the magic! 🪄</strong>
          </p>
        </div>
        
        <LoggerDemo />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-muted/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🎯 Custom Logger Benefits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">✅ Development</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Native object logging (no stringification)</li>
                  <li>• Emoji-rich console output with colors</li>
                  <li>• Automatic timestamps and metadata</li>
                  <li>• Performance tracking with console.time</li>
                  <li>• Advanced console methods (table, dir, trace)</li>
                  <li>• Zero external dependencies</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">🚀 Production</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Configurable log levels via env vars</li>
                  <li>• Clean JSON output for log aggregation</li>
                  <li>• Next.js SSR/SSG compatible</li>
                  <li>• Performance optimized</li>
                  <li>• Easy integration with monitoring services</li>
                  <li>• Type-safe with TypeScript</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                📚 Why Custom Logger Instead of Nexlog?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Initially planned to use Nexlog, but encountered Next.js compatibility issues. 
                Our custom implementation provides the same benefits with zero external dependencies 
                and perfect Next.js integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
