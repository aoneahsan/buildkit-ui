/**
 * Basic Usage Example
 * This file demonstrates the basic usage of BuildKit UI components
 */

import React from 'react';
import { 
  BuildKitProvider, 
  Button, 
  Input, 
  Form, 
  Card,
  Toast,
  useToast,
  useTracking,
  useTheme,
  useOffline
} from 'buildkit-ui';
import type { BuildKitConfig } from 'buildkit-ui';

// Configuration
const config: BuildKitConfig = {
  // Tracking configuration
  tracking: {
    analytics: {
      firebase: { 
        enabled: true,
        measurementId: 'G-XXXXXXXXXX'
      },
      amplitude: { 
        apiKey: 'your-amplitude-key' 
      },
      custom: {
        endpoint: 'https://api.example.com/events',
        headers: {
          'X-API-Key': 'your-api-key'
        }
      }
    },
    errors: {
      sentry: { 
        dsn: 'https://xxx@sentry.io/xxx' 
      },
      crashlytics: { 
        enabled: true 
      }
    }
  },
  
  // Theme configuration
  theme: {
    defaultTheme: 'light',
    enableThemeSwitch: true,
    themes: {
      light: {
        primary: '#0ea5e9',
        secondary: '#6b7280',
        background: '#ffffff',
        text: '#000000'
      },
      dark: {
        primary: '#38bdf8',
        secondary: '#9ca3af',
        background: '#1f2937',
        text: '#ffffff'
      }
    }
  },
  
  // Internationalization
  i18n: {
    defaultLanguage: 'en',
    languages: ['en', 'es', 'fr'],
    loadPath: '/locales/{{lng}}.json'
  },
  
  // Offline configuration
  offline: {
    enabled: true,
    queueSize: 1000,
    syncInterval: 60000,
    persistQueue: true
  }
};

// Main App Component
export function App() {
  return (
    <BuildKitProvider config={config}>
      <MainContent />
    </BuildKitProvider>
  );
}

// Main Content
function MainContent() {
  const { showToast } = useToast();
  const { trackEvent } = useTracking();
  const { theme, setTheme } = useTheme();
  const { isOnline, queueSize } = useOffline();

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      // Your API call here
      console.log('Form submitted:', data);
      
      // Show success toast
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Form submitted successfully!'
      });
      
      // Custom tracking
      trackEvent({
        eventName: 'custom_form_submit',
        parameters: {
          formType: 'contact',
          fields: Object.keys(data).length
        }
      });
    } catch (error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit form'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">You're offline</p>
          <p>{queueSize} actions queued for sync</p>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          variant="secondary"
        />
      </div>

      {/* Main Form */}
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Contact Form Example</h1>
        
        <Form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input */}
          <Input
            name="name"
            label="Full Name"
            placeholder="John Doe"
            required
            validation={{
              minLength: 2,
              maxLength: 50
            }}
          />

          {/* Email Input */}
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            required
          />

          {/* Phone Input */}
          <Input
            name="phone"
            label="Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            pattern="[\+]?[0-9\s\-\(\)]+"
          />

          {/* Textarea */}
          <Input
            name="message"
            label="Message"
            multiline
            rows={4}
            placeholder="Your message here..."
            required
            validation={{
              minLength: 10,
              maxLength: 500
            }}
          />

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              label="Submit"
              variant="primary"
              fullWidth
            />
            <Button
              type="reset"
              label="Reset"
              variant="secondary"
              fullWidth
            />
          </div>
        </Form>
      </Card>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto mt-6 grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-2">Test Success</h3>
          <Button
            label="Show Success"
            onClick={() => showToast({
              severity: 'success',
              summary: 'Great!',
              detail: 'Operation completed successfully'
            })}
            variant="success"
            fullWidth
          />
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">Test Error</h3>
          <Button
            label="Show Error"
            onClick={() => showToast({
              severity: 'error',
              summary: 'Oops!',
              detail: 'Something went wrong'
            })}
            variant="danger"
            fullWidth
          />
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">Test Warning</h3>
          <Button
            label="Show Warning"
            onClick={() => showToast({
              severity: 'warn',
              summary: 'Attention',
              detail: 'Please check your input'
            })}
            variant="warning"
            fullWidth
          />
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">Test Info</h3>
          <Button
            label="Show Info"
            onClick={() => showToast({
              severity: 'info',
              summary: 'FYI',
              detail: 'Here\'s some information'
            })}
            variant="info"
            fullWidth
          />
        </Card>
      </div>

      {/* Toast Container */}
      <Toast />
    </div>
  );
}

// Example: Custom Tracked Component
export function CustomTrackedComponent() {
  const { trackEvent } = useTracking();

  const handleCustomAction = () => {
    // Manual tracking
    trackEvent({
      eventName: 'custom_action',
      parameters: {
        component: 'CustomComponent',
        action: 'clicked',
        timestamp: Date.now()
      }
    });
  };

  return (
    <Button
      label="Custom Action"
      onClick={handleCustomAction}
    />
  );
}

// Example: Error Boundary Usage
export function ErrorBoundaryExample() {
  const throwError = () => {
    throw new Error('This is a test error');
  };

  return (
    <Card>
      <h3>Error Tracking Example</h3>
      <p>Click the button to trigger an error that will be tracked</p>
      <Button
        label="Trigger Error"
        onClick={throwError}
        variant="danger"
      />
    </Card>
  );
}

// Example: Performance Tracking
export function PerformanceExample() {
  const { startTrace, stopTrace } = useTracking();

  const performHeavyOperation = async () => {
    const traceId = await startTrace('heavy_operation');
    
    try {
      // Simulate heavy operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add custom metrics
      await stopTrace(traceId, {
        itemsProcessed: 1000,
        cacheHits: 850
      });
    } catch (error) {
      await stopTrace(traceId, { error: error.message });
    }
  };

  return (
    <Card>
      <h3>Performance Tracking</h3>
      <Button
        label="Run Heavy Operation"
        onClick={performHeavyOperation}
      />
    </Card>
  );
}