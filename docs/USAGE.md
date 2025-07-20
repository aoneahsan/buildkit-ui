# BuildKit UI Usage Guide

This guide covers common usage patterns and examples for BuildKit UI.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Component Examples](#component-examples)
3. [Tracking Examples](#tracking-examples)
4. [Theme Customization](#theme-customization)
5. [Internationalization](#internationalization)
6. [Authentication Integration](#authentication-integration)
7. [Offline Support](#offline-support)
8. [Performance Optimization](#performance-optimization)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Create a New Project

```bash
npx create-buildkit-app my-app
cd my-app
npm start
```

### 2. Add to Existing Project

```bash
npm install buildkit-ui
npx buildkit-ui init
```

### 3. Basic Setup

```tsx
// src/App.tsx
import React from 'react';
import { BuildKitProvider, Button, Input } from 'buildkit-ui';
import { buildKitConfig } from './config/buildkit';

function App() {
  return (
    <BuildKitProvider config={buildKitConfig}>
      <div className="container mx-auto p-4">
        <h1>My BuildKit App</h1>
        
        <Input 
          label="Name"
          placeholder="Enter your name"
        />
        
        <Button 
          variant="primary"
          onClick={() => alert('Hello!')}
        >
          Say Hello
        </Button>
      </div>
    </BuildKitProvider>
  );
}

export default App;
```

## Component Examples

### Button Component

```tsx
import { Button } from 'buildkit-ui';

// Basic button
<Button onClick={() => console.log('clicked')}>
  Click Me
</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// Loading state
<Button loading loadingText="Processing...">
  Submit
</Button>

// With icon (using PrimeReact icons)
<Button icon="pi pi-check" iconPos="right">
  Complete
</Button>

// Full width
<Button fullWidth>
  Full Width Button
</Button>

// With tracking metadata
<Button 
  onClick={handleSubmit}
  trackingMetadata={{
    form: 'signup',
    step: 2,
    source: 'header'
  }}
>
  Sign Up
</Button>
```

### Input Component

```tsx
import { Input } from 'buildkit-ui';

// Basic input
<Input 
  label="Email"
  type="email"
  placeholder="Enter your email"
/>

// With validation
<Input 
  label="Password"
  type="password"
  required
  error={errors.password}
  helperText="Must be at least 8 characters"
/>

// Character count
<Input 
  label="Bio"
  maxLength={200}
  showCount
  fullWidth
/>

// Different sizes
<Input size="small" label="Small Input" />
<Input size="medium" label="Medium Input" />
<Input size="large" label="Large Input" />

// Controlled component
const [value, setValue] = useState('');

<Input 
  label="Controlled"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With custom tracking
<Input 
  label="Search"
  trackingDebounce={1000} // Track after 1 second of no typing
  trackingMetadata={{
    section: 'header',
    purpose: 'global_search'
  }}
/>
```

### Form Example

```tsx
import React, { useState } from 'react';
import { Button, Input, useTracking } from 'buildkit-ui';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  
  const { trackEvent } = useTracking({
    componentType: 'ContactForm'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track form submission
    trackEvent('form_submit_attempt', {
      fields: Object.keys(formData).length
    });

    try {
      // Validate
      const newErrors = validateForm(formData);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        trackEvent('form_validation_failed', {
          errors: Object.keys(newErrors)
        });
        return;
      }

      // Submit
      await submitForm(formData);
      
      trackEvent('form_submit_success', {
        formType: 'contact'
      });
      
      alert('Form submitted successfully!');
    } catch (error) {
      trackEvent('form_submit_error', {
        error: error.message
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <Input
        label="Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        error={errors.name}
      />
      
      <Input
        label="Email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
      />
      
      <Input
        label="Message"
        required
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        error={errors.message}
        helperText="Tell us how we can help"
      />
      
      <Button type="submit" fullWidth>
        Send Message
      </Button>
    </form>
  );
}
```

## Tracking Examples

### Page View Tracking

```tsx
import { useEffect } from 'react';
import { trackPageView } from 'buildkit-ui/tracking';

function ProductPage({ productId }) {
  useEffect(() => {
    trackPageView('ProductDetails', {
      productId,
      category: 'Electronics',
      referrer: document.referrer
    });
  }, [productId]);

  return <div>Product details...</div>;
}
```

### Custom Event Tracking

```tsx
import { trackEvent } from 'buildkit-ui/tracking';

function VideoPlayer({ videoId }) {
  const handlePlay = () => {
    trackEvent({
      eventName: 'video_play',
      componentType: 'VideoPlayer',
      parameters: {
        videoId,
        duration: video.duration,
        quality: currentQuality
      }
    });
  };

  const handleProgress = (percentage) => {
    if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
      trackEvent({
        eventName: 'video_milestone',
        componentType: 'VideoPlayer',
        parameters: {
          videoId,
          milestone: percentage,
          watchTime: currentTime
        }
      });
    }
  };

  return <video onPlay={handlePlay} />;
}
```

### Error Tracking

```tsx
import { trackError, captureException } from 'buildkit-ui/tracking';

// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    trackError({
      message: error.message,
      stack: error.stack,
      componentType: 'ErrorBoundary',
      severity: 'error',
      context: {
        componentStack: errorInfo.componentStack
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// Manual error tracking
async function fetchUserData(userId) {
  try {
    const response = await api.getUser(userId);
    return response.data;
  } catch (error) {
    captureException(error, {
      userId,
      action: 'fetchUserData',
      endpoint: '/api/user'
    });
    throw error;
  }
}
```

### Performance Tracking

```tsx
import { usePerformance } from 'buildkit-ui';

function DataTable({ data }) {
  const { startTrace, stopTrace, measureRender } = usePerformance();

  useEffect(() => {
    const cleanup = measureRender();
    return cleanup;
  }, []);

  const loadMoreData = async () => {
    const traceId = await startTrace('load_more_data');
    
    try {
      const newData = await fetchData();
      await stopTrace(traceId, {
        itemsLoaded: newData.length,
        totalItems: data.length + newData.length
      });
    } catch (error) {
      await stopTrace(traceId, {
        error: error.message,
        success: false
      });
    }
  };

  return <table>...</table>;
}
```

## Theme Customization

### Using Theme Hook

```tsx
import { useTheme } from 'buildkit-ui';

function ThemeToggle() {
  const { mode, setMode, isDark, theme } = useTheme();

  return (
    <div>
      <button onClick={() => setMode('light')}>Light</button>
      <button onClick={() => setMode('dark')}>Dark</button>
      <button onClick={() => setMode('system')}>System</button>
      
      <div style={{ color: theme?.colors.primary }}>
        Themed content
      </div>
    </div>
  );
}
```

### Custom Theme

```tsx
import { BuildKitProvider } from 'buildkit-ui';

const customTheme = {
  defaultMode: 'light',
  themes: {
    custom: {
      name: 'custom',
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        success: '#95e1d3',
        warning: '#f3a683',
        danger: '#ee5a6f',
        info: '#778beb',
        background: '#f5f3f0',
        surface: '#ffffff',
        text: '#2d3436',
        textSecondary: '#636e72',
        border: '#dfe6e9',
      },
      fonts: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'Fira Code, monospace',
      },
      customCss: `
        .buildkit-button {
          border-radius: 12px;
          font-weight: 600;
        }
      `
    }
  }
};

function App() {
  return (
    <BuildKitProvider config={{ theme: customTheme }}>
      <App />
    </BuildKitProvider>
  );
}
```

### Dynamic Theme Switching

```tsx
import { useTheme } from 'buildkit-ui';

function ThemeCustomizer() {
  const { setTheme } = useTheme();

  const applyBrandTheme = () => {
    setTheme({
      name: 'brand',
      colors: {
        primary: brandColors.primary,
        // ... other colors
      }
    });
  };

  return <button onClick={applyBrandTheme}>Apply Brand Theme</button>;
}
```

## Internationalization

### Basic Setup

```tsx
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Using with Components

```tsx
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'buildkit-ui';

function LocalizedForm() {
  const { t, i18n } = useTranslation();

  return (
    <form>
      <Input 
        label={t('form.name')}
        placeholder={t('form.namePlaceholder')}
        helperText={t('form.nameHelper')}
      />
      
      <Button onClick={() => i18n.changeLanguage('es')}>
        {t('language.spanish')}
      </Button>
    </form>
  );
}
```

### Date Formatting

```tsx
import { format } from 'date-fns';
import { es, fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

function DateDisplay({ date }) {
  const { i18n } = useTranslation();
  
  const locale = {
    es: es,
    fr: fr,
  }[i18n.language];

  return (
    <span>
      {format(date, 'PPP', { locale })}
    </span>
  );
}
```

## Authentication Integration

### Basic Auth Flow

```tsx
import { useState } from 'react';
import { Button, Input } from 'buildkit-ui';
import { trackEvent } from 'buildkit-ui/tracking';

function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider?: string) => {
    setLoading(true);
    
    trackEvent({
      eventName: 'login_attempt',
      parameters: {
        method: provider || 'email',
        timestamp: Date.now()
      }
    });

    try {
      let user;
      
      if (provider) {
        // Social login
        user = await authManager.signInWithProvider(provider);
      } else {
        // Email/password login
        user = await authManager.signInWithEmail(
          credentials.email,
          credentials.password
        );
      }

      trackEvent({
        eventName: 'login_success',
        parameters: {
          method: provider || 'email',
          userId: user.uid
        }
      });

      // Navigate to dashboard
    } catch (error) {
      trackEvent({
        eventName: 'login_error',
        parameters: {
          method: provider || 'email',
          error: error.code
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1>Sign In</h1>
      
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <Input
          type="email"
          label="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          required
        />
        
        <Input
          type="password"
          label="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          required
        />
        
        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>
      
      <div className="mt-4 space-y-2">
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => handleLogin('google')}
          icon="pi pi-google"
        >
          Continue with Google
        </Button>
        
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => handleLogin('apple')}
          icon="pi pi-apple"
        >
          Continue with Apple
        </Button>
      </div>
    </div>
  );
}
```

## Offline Support

### Offline Queue Status

```tsx
import { useOffline } from 'buildkit-ui';

function OfflineIndicator() {
  const { isOnline, queueSize, syncQueue } = useOffline();

  if (isOnline && queueSize === 0) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 p-4 rounded-lg shadow-lg
      ${isOnline ? 'bg-yellow-100' : 'bg-red-100'}
    `}>
      {!isOnline && (
        <p className="text-red-700">You're offline</p>
      )}
      
      {queueSize > 0 && (
        <p className="text-sm">
          {queueSize} actions pending sync
        </p>
      )}
      
      {isOnline && queueSize > 0 && (
        <Button size="small" onClick={syncQueue}>
          Sync Now
        </Button>
      )}
    </div>
  );
}
```

### Offline-First Form

```tsx
import { useState } from 'react';
import { Button, Input, useOffline } from 'buildkit-ui';

function OfflineForm() {
  const [data, setData] = useState({ title: '', content: '' });
  const { isOnline } = useOffline();
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // This will automatically queue if offline
      await api.createPost(data);
      setSaved(true);
      
      if (!isOnline) {
        alert('Your post will be published when you're back online');
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Title"
        value={data.title}
        onChange={(e) => setData({...data, title: e.target.value})}
      />
      
      <Input
        label="Content"
        value={data.content}
        onChange={(e) => setData({...data, content: e.target.value})}
      />
      
      <Button type="submit">
        {isOnline ? 'Publish' : 'Save Offline'}
      </Button>
      
      {saved && !isOnline && (
        <p className="text-yellow-600 mt-2">
          Saved locally. Will sync when online.
        </p>
      )}
    </form>
  );
}
```

## Performance Optimization

### Lazy Loading Components

```tsx
import { lazy, Suspense } from 'react';
import { trackPageView } from 'buildkit-ui/tracking';

// Lazy load heavy components
const Dashboard = lazy(() => {
  trackPageView('Dashboard', { loadType: 'lazy' });
  return import('./pages/Dashboard');
});

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Memoized Components

```tsx
import { memo, useMemo } from 'react';
import { Button } from 'buildkit-ui';

const ExpensiveList = memo(({ items, onItemClick }) => {
  const sortedItems = useMemo(
    () => items.sort((a, b) => b.priority - a.priority),
    [items]
  );

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id}>
          <Button 
            variant="ghost"
            onClick={() => onItemClick(item)}
            trackingMetadata={{ itemId: item.id }}
          >
            {item.name}
          </Button>
        </li>
      ))}
    </ul>
  );
});
```

### Virtual Scrolling

```tsx
import { VirtualList } from '@tanstack/react-virtual';
import { useTracking } from 'buildkit-ui';

function LargeList({ items }) {
  const { trackEvent } = useTracking({
    componentType: 'LargeList'
  });

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  // Track scroll performance
  useEffect(() => {
    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        trackEvent('list_scroll', {
          scrollTop: virtualizer.scrollOffset,
          visibleItems: virtualizer.range,
        });
      }, 150);
    };

    const scrollElement = parentRef.current;
    scrollElement?.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollElement?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Common Patterns

### Loading States

```tsx
import { useState, useEffect } from 'react';
import { Button, useTracking } from 'buildkit-ui';

function DataLoader() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { measureAsync } = useTracking({ componentType: 'DataLoader' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await measureAsync(
        () => fetch('/api/data').then(r => r.json()),
        'data_fetch'
      );
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load data</p>
        <Button onClick={loadData} variant="secondary" size="small">
          Retry
        </Button>
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Confirmation Dialogs

```tsx
import { useState } from 'react';
import { Button, Dialog } from 'buildkit-ui';

function DeleteButton({ onDelete, itemName }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    trackEvent({
      eventName: 'delete_confirmed',
      parameters: { itemName }
    });
    
    await onDelete();
    setShowConfirm(false);
  };

  return (
    <>
      <Button 
        variant="danger" 
        onClick={() => setShowConfirm(true)}
      >
        Delete
      </Button>

      <Dialog
        visible={showConfirm}
        onHide={() => setShowConfirm(false)}
        header="Confirm Delete"
        footer={
          <>
            <Button 
              variant="ghost" 
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete {itemName}?</p>
        <p className="text-sm text-gray-600">This action cannot be undone.</p>
      </Dialog>
    </>
  );
}
```

## Troubleshooting

### Common Issues

#### 1. Tracking not working

```typescript
// Check if BuildKit is initialized
import { BuildKitUI } from 'buildkit-ui';

// In your app initialization
const result = await BuildKitUI.initialize(config);
if (!result.success) {
  console.error('BuildKit initialization failed');
}

// Check if tracking is enabled
const { isEnabled } = useTrackingContext();
console.log('Tracking enabled:', isEnabled);
```

#### 2. Components not styled

```css
/* Make sure to import styles */
@import 'buildkit-ui/dist/buildkit-ui.css';

/* Or if using Tailwind, ensure content paths include BuildKit */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/buildkit-ui/dist/**/*.{js,jsx,ts,tsx}"
  ]
};
```

#### 3. TypeScript errors

```typescript
// Ensure TypeScript is configured correctly
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### 4. Platform-specific issues

```typescript
// Always check platform before using native features
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Native-only code
}

// Or use platform utilities
import { isIOS, isAndroid, isWeb } from 'buildkit-ui/utils';

if (isIOS()) {
  // iOS-specific code
}
```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const buildKitConfig = {
  tracking: {
    debug: true, // Enable debug logs
    // ... other config
  }
};
```

### Performance Tips

1. **Lazy load heavy components**
2. **Use React.memo for expensive renders**
3. **Debounce tracking events**
4. **Batch API calls when possible**
5. **Use virtual scrolling for long lists**
6. **Optimize images with lazy loading**
7. **Monitor bundle size**

### Getting Help

- Check the [API Documentation](./API.md)
- View [example projects](https://github.com/aoneahsan/buildkit-ui-examples)
- Report issues on [GitHub](https://github.com/aoneahsan/buildkit-ui/issues)
- Join the community discussions