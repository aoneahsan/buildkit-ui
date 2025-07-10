# BuildKit UI - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Installation & Setup](#installation--setup)
4. [Core Features](#core-features)
5. [Components](#components)
6. [Pages](#pages)
7. [Tracking & Analytics](#tracking--analytics)
8. [Theme Management](#theme-management)
9. [Internationalization](#internationalization)
10. [Performance Optimization](#performance-optimization)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Introduction

BuildKit UI is a comprehensive React UI library built on top of Capacitor, designed to provide a complete solution for building cross-platform applications with automatic tracking, analytics, error handling, and accessibility built-in.

### Key Features

- **Cross-Platform**: Works seamlessly on iOS, Android, and Web through Capacitor
- **Automatic Tracking**: Every user interaction is automatically tracked
- **Built-in Analytics**: Integrated with Firebase Analytics, Amplitude, and Microsoft Clarity
- **Error Handling**: Automatic error tracking with Sentry and Firebase Crashlytics
- **Accessibility**: Full React Aria integration for WCAG compliance
- **Internationalization**: Built-in i18next support for multi-language apps
- **Theme Management**: Dynamic theming with dark/light mode support
- **Performance Monitoring**: Web Vitals tracking and performance metrics
- **Tree-Shakeable**: Optimized bundle size with proper tree-shaking
- **TypeScript**: Full TypeScript support with strict typing

## Architecture Overview

### Plugin Architecture

BuildKit UI follows Capacitor's plugin architecture with three platform implementations:

```
buildkit-ui/
├── src/
│   ├── web.ts          # Web implementation
│   ├── definitions.ts   # TypeScript interfaces
│   └── index.ts        # Plugin registration
├── ios/
│   └── Plugin/         # iOS native implementation
└── android/
    └── src/            # Android native implementation
```

### Component Architecture

Every component in BuildKit UI follows a consistent pattern:

1. **Wrapper Component**: Extends PrimeReact components with tracking
2. **Automatic Tracking**: User interactions tracked without manual instrumentation
3. **Accessibility**: React Aria hooks for keyboard and screen reader support
4. **Theming**: Dynamic theme support through CSS variables
5. **Internationalization**: All text content translatable

## Installation & Setup

### Quick Start with NPX

```bash
# Create a new project with BuildKit UI
npx create-buildkit-app my-app

# Add BuildKit UI to existing project
npx buildkit-ui init
```

### Manual Installation

```bash
npm install @buildkit/ui
```

### Configuration

Create a `buildkit.config.js` file:

```javascript
module.exports = {
  // Analytics Configuration
  analytics: {
    firebase: {
      enabled: true,
      config: {
        apiKey: "your-api-key",
        authDomain: "your-auth-domain",
        projectId: "your-project-id",
        storageBucket: "your-storage-bucket",
        messagingSenderId: "your-messaging-sender-id",
        appId: "your-app-id",
        measurementId: "your-measurement-id"
      }
    },
    amplitude: {
      enabled: true,
      apiKey: "your-amplitude-key"
    },
    clarity: {
      enabled: true,
      projectId: "your-clarity-id"
    }
  },
  
  // Error Tracking
  errorTracking: {
    sentry: {
      enabled: true,
      dsn: "your-sentry-dsn",
      environment: "production"
    },
    crashlytics: {
      enabled: true
    }
  },
  
  // Theme Configuration
  theme: {
    defaultTheme: 'light',
    enableSystemTheme: true,
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },
  
  // Internationalization
  i18n: {
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  }
};
```

### Provider Setup

Wrap your app with the BuildKit Provider:

```jsx
import { BuildKitProvider } from '@buildkit/ui';
import buildKitConfig from './buildkit.config';

function App() {
  return (
    <BuildKitProvider config={buildKitConfig}>
      {/* Your app content */}
    </BuildKitProvider>
  );
}
```

## Core Features

### 1. Automatic Component Tracking

Every BuildKit UI component automatically tracks user interactions:

```jsx
import { Button } from '@buildkit/ui';

// This button automatically tracks clicks
<Button onClick={() => console.log('Clicked')}>
  Click Me
</Button>

// Tracking data sent:
{
  event: 'button_click',
  component: 'Button',
  label: 'Click Me',
  timestamp: 1234567890,
  platform: 'web',
  sessionId: 'abc-123',
  userId: 'user-456'
}
```

### 2. Performance Monitoring

BuildKit UI automatically tracks Web Vitals:

- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)
- **FCP** (First Contentful Paint)

### 3. Error Boundaries

Automatic error catching and reporting:

```jsx
// All components are wrapped in error boundaries
<Card>
  {/* If this throws, it's automatically caught and reported */}
  <SomeComponent />
</Card>
```

### 4. Offline Support

Built-in offline queue for tracking events:

```javascript
// Events are queued when offline
// Automatically synced when connection restored
BuildKitUI.trackEvent({
  name: 'purchase_complete',
  properties: { amount: 99.99 }
});
```

## Components

### Button Component

Advanced button with multiple variants and states:

```jsx
import { Button } from '@buildkit/ui';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Loading state
<Button loading loadingText="Saving...">
  Save
</Button>

// With icon
<Button icon="pi pi-check" iconPos="right">
  Complete
</Button>

// Full width
<Button fullWidth size="large">
  Continue
</Button>
```

### Input Component

Form input with validation and accessibility:

```jsx
import { Input } from '@buildkit/ui';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  required
/>

// With validation
<Input
  label="Password"
  type="password"
  value={password}
  onChange={setPassword}
  error={errors.password}
  helperText="Must be at least 8 characters"
/>

// With icons
<Input
  icon="pi pi-search"
  placeholder="Search..."
  showClear
/>
```

### Card Component

Flexible container component:

```jsx
import { Card } from '@buildkit/ui';

// Basic card
<Card title="User Profile" subTitle="Manage your account">
  <p>Card content goes here</p>
</Card>

// Interactive card
<Card
  variant="elevated"
  interactive
  onClick={handleCardClick}
>
  <h3>Click me!</h3>
</Card>

// With header and footer
<Card
  header={<img src="header.jpg" alt="Header" />}
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Save</Button>
    </div>
  }
>
  <p>Content</p>
</Card>
```

### DataTable Component

Advanced data grid with sorting, filtering, and pagination:

```jsx
import { DataTable } from '@buildkit/ui';

const columns = [
  { field: 'id', header: 'ID', sortable: true },
  { field: 'name', header: 'Name', sortable: true, filter: true },
  { field: 'email', header: 'Email', sortable: true, filter: true },
  {
    field: 'status',
    header: 'Status',
    body: (rowData) => (
      <span className={`badge ${rowData.status}`}>
        {rowData.status}
      </span>
    )
  }
];

<DataTable
  data={users}
  columns={columns}
  title="User Management"
  selectionMode="multiple"
  onSelectionChange={setSelectedUsers}
  paginator
  rows={10}
  rowsPerPageOptions={[10, 25, 50]}
/>
```

### Dialog Component

Modal dialogs with various sizes and variants:

```jsx
import { Dialog } from '@buildkit/ui';

// Basic dialog
<Dialog
  visible={showDialog}
  onHide={() => setShowDialog(false)}
  header="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button variant="ghost" onClick={() => setShowDialog(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </div>
</Dialog>

// Fullscreen dialog
<Dialog
  visible={showFullscreen}
  onHide={() => setShowFullscreen(false)}
  size="fullscreen"
  header="Edit Document"
>
  {/* Large content */}
</Dialog>
```

### Form Components

Complete form management:

```jsx
import { Form, FormField, FormSection } from '@buildkit/ui';

<Form onSubmit={handleSubmit} loading={isSubmitting}>
  <FormSection 
    title="Personal Information"
    description="Enter your personal details"
  >
    <FormField label="Full Name" required error={errors.name}>
      <Input
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
    </FormField>
    
    <FormField label="Email" required error={errors.email}>
      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
    </FormField>
  </FormSection>
  
  <Button type="submit" variant="primary" fullWidth>
    Submit
  </Button>
</Form>
```

### Toast Notifications

Global toast notification system:

```jsx
import { Toast, useToast } from '@buildkit/ui';

function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation completed successfully',
      life: 3000
    });
  };
  
  const handleError = () => {
    toast.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Something went wrong',
      sticky: true
    });
  };
  
  return (
    <>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </>
  );
}

// In your app root
<Toast ref={toastRef} position="top-right" />
```

## Pages

### Authentication Pages

#### Login Page

Complete login page with social auth support:

```jsx
import { LoginPage } from '@buildkit/ui';

<LoginPage
  onLogin={handleLogin}
  onForgotPassword={() => navigate('/forgot-password')}
  onRegister={() => navigate('/register')}
  socialProviders={['google', 'facebook', 'github']}
  logo={<img src="/logo.png" alt="Logo" />}
  rememberMe
  allowMagicLink
/>
```

#### Register Page

Customizable registration flow:

```jsx
import { RegisterPage } from '@buildkit/ui';

<RegisterPage
  onRegister={handleRegister}
  onLogin={() => navigate('/login')}
  fields={{
    name: true,
    email: true,
    phone: true,
    username: false,
    password: true,
    confirmPassword: true
  }}
  socialProviders={['google', 'facebook']}
  termsUrl="/terms"
  privacyUrl="/privacy"
/>
```

#### Two-Factor Authentication

Support for 2FA/SMS verification:

```jsx
import { TwoFactorPage } from '@buildkit/ui';

<TwoFactorPage
  method="sms"
  phoneNumber={user.phone}
  onVerify={handleVerify}
  onResend={handleResend}
  onBack={() => navigate('/login')}
  codeLength={6}
/>
```

#### Magic Link Authentication

Passwordless authentication:

```jsx
import { EmailMagicLinkPage } from '@buildkit/ui';

<EmailMagicLinkPage
  onSendLink={handleSendMagicLink}
  onBack={() => navigate('/login')}
/>
```

### Common Pages

#### 404 Not Found

```jsx
import { NotFoundPage } from '@buildkit/ui';

<NotFoundPage
  onHome={() => navigate('/')}
  onBack={() => window.history.back()}
/>
```

#### Offline Page

```jsx
import { OfflinePage } from '@buildkit/ui';

<OfflinePage
  autoRetry
  autoRetryInterval={5000}
  onRetry={handleRetry}
/>
```

#### Error Boundary Page

```jsx
import { ErrorBoundaryPage } from '@buildkit/ui';

<ErrorBoundaryPage
  error={error}
  errorInfo={errorInfo}
  onReset={handleReset}
  onReport={handleReport}
  showDetails={isDevelopment}
/>
```

#### Maintenance Page

```jsx
import { MaintenancePage } from '@buildkit/ui';

<MaintenancePage
  estimatedTime={new Date('2024-01-01T12:00:00')}
  showProgress
  progress={75}
  contactEmail="support@example.com"
  socialLinks={{
    twitter: 'https://twitter.com/status',
    status: 'https://status.example.com'
  }}
/>
```

## Tracking & Analytics

### Event Tracking

BuildKit UI provides multiple ways to track events:

```javascript
// Using the plugin directly
import { BuildKitUI } from '@buildkit/ui';

// Track custom event
await BuildKitUI.trackEvent({
  name: 'product_viewed',
  properties: {
    productId: '123',
    category: 'electronics',
    price: 99.99
  }
});

// Track with user properties
await BuildKitUI.trackEvent({
  name: 'subscription_started',
  properties: {
    plan: 'premium',
    billing: 'monthly'
  },
  userProperties: {
    accountType: 'business',
    industry: 'technology'
  }
});
```

### Using the Hook

```jsx
import { useTracking } from '@buildkit/ui';

function ProductCard({ product }) {
  const { trackEvent } = useTracking({
    componentType: 'ProductCard',
    componentProps: { productId: product.id }
  });
  
  const handleAddToCart = () => {
    trackEvent('add_to_cart', {
      productName: product.name,
      price: product.price,
      quantity: 1
    });
    
    // Add to cart logic
  };
  
  return (
    <Card onClick={() => trackEvent('product_clicked')}>
      {/* Product details */}
      <Button onClick={handleAddToCart}>Add to Cart</Button>
    </Card>
  );
}
```

### Platform-Specific Properties

Events automatically include platform information:

```javascript
// Automatic properties added to every event:
{
  platform: 'ios' | 'android' | 'web',
  platformVersion: '15.0',
  deviceModel: 'iPhone 13',
  appVersion: '1.0.0',
  screenResolution: '1170x2532',
  language: 'en-US',
  timezone: 'America/New_York',
  sessionId: 'unique-session-id',
  timestamp: 1234567890
}
```

### Analytics Providers

#### Firebase Analytics

```javascript
// Automatically sends to Firebase Analytics
trackEvent('begin_checkout', {
  value: 99.99,
  currency: 'USD',
  items: [
    {
      item_id: 'SKU123',
      item_name: 'Product Name',
      item_category: 'Category',
      quantity: 1,
      price: 99.99
    }
  ]
});
```

#### Amplitude

```javascript
// Automatically sends to Amplitude
trackEvent('experiment_viewed', {
  experiment_id: 'new_checkout_flow',
  variant: 'control'
});
```

#### Microsoft Clarity

Clarity is automatically initialized and tracks:
- User sessions
- Heatmaps
- Session recordings
- Custom events

### Error Tracking

#### Automatic Error Tracking

All errors are automatically caught and reported:

```javascript
// Component errors
class MyComponent extends TrackedComponent {
  render() {
    // If this throws, it's automatically reported
    throw new Error('Something went wrong');
  }
}

// Async errors
try {
  await someAsyncOperation();
} catch (error) {
  // Automatically reported to Sentry and Crashlytics
  BuildKitUI.trackError({
    error: error.message,
    stackTrace: error.stack,
    context: {
      userId: currentUser.id,
      action: 'async_operation'
    }
  });
}
```

#### Manual Error Tracking

```javascript
import { BuildKitUI } from '@buildkit/ui';

// Track handled errors
BuildKitUI.trackError({
  error: 'Payment failed',
  errorCode: 'PAYMENT_DECLINED',
  context: {
    paymentMethod: 'credit_card',
    amount: 99.99,
    currency: 'USD'
  },
  severity: 'error',
  handled: true
});
```

## Theme Management

### Theme Configuration

BuildKit UI supports dynamic theming:

```javascript
// Define custom theme
const customTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    gray: {
      // Custom gray scale
    }
  },
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};

// Apply theme
<BuildKitProvider theme={customTheme}>
  <App />
</BuildKitProvider>
```

### Dark Mode

Automatic dark mode support:

```jsx
import { useTheme } from '@buildkit/ui';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  );
}
```

### CSS Variables

All theme values are available as CSS variables:

```css
.custom-component {
  background-color: var(--buildkit-color-primary-500);
  color: var(--buildkit-color-gray-900);
  font-family: var(--buildkit-font-sans);
  box-shadow: var(--buildkit-shadow-lg);
}
```

## Internationalization

### Language Configuration

```javascript
// Configure supported languages
const i18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage']
  }
};
```

### Using Translations

```jsx
import { useTranslation } from '@buildkit/ui';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.message', { name: 'John' })}</p>
      
      <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
```

### Translation Files

Create translation files in your public directory:

```json
// /locales/en/common.json
{
  "welcome": {
    "title": "Welcome to BuildKit UI",
    "message": "Hello {{name}}, welcome back!"
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email Address",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot your password?"
    }
  }
}
```

### Pluralization

```jsx
// Automatic pluralization support
t('items', { count: itemCount })

// Translation file
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

## Performance Optimization

### Code Splitting

BuildKit UI supports automatic code splitting:

```jsx
import { lazy, Suspense } from 'react';

// Lazy load pages
const ProfilePage = lazy(() => import('@buildkit/ui').then(module => ({
  default: module.ProfilePage
})));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePage />
    </Suspense>
  );
}
```

### Tree Shaking

Import only what you need:

```jsx
// Good - only imports Button
import { Button } from '@buildkit/ui/components/Button';

// Also good - tree-shaking removes unused exports
import { Button, Input } from '@buildkit/ui';
```

### Bundle Analysis

```bash
# Analyze your bundle
npm run build -- --analyze

# Check component sizes
npx buildkit-ui analyze
```

### Performance Monitoring

```javascript
// Monitor component performance
import { BuildKitUI } from '@buildkit/ui';

// Get performance metrics
const metrics = await BuildKitUI.getPerformanceMetrics();
console.log(metrics);
// {
//   lcp: 2500,
//   fid: 100,
//   cls: 0.1,
//   ttfb: 800,
//   fcp: 1800,
//   componentRenderTimes: {
//     Button: { avg: 2, max: 5, count: 150 },
//     DataTable: { avg: 45, max: 120, count: 10 }
//   }
// }
```

## Best Practices

### 1. Component Usage

```jsx
// ✅ Good - Use BuildKit components for automatic tracking
import { Button, Input, Card } from '@buildkit/ui';

// ❌ Bad - Using native elements loses tracking
<button onClick={handleClick}>Click me</button>

// ✅ Good - Provide meaningful tracking metadata
<Button
  onClick={handlePurchase}
  trackingMetadata={{
    product: 'premium-plan',
    price: 99.99,
    currency: 'USD'
  }}
>
  Purchase Premium
</Button>
```

### 2. Error Handling

```jsx
// ✅ Good - Errors are automatically caught
<Card>
  <UserProfile userId={userId} />
</Card>

// ✅ Better - Add context for better debugging
<Card trackingMetadata={{ section: 'user-profile', userId }}>
  <UserProfile userId={userId} />
</Card>
```

### 3. Performance

```jsx
// ✅ Good - Lazy load heavy components
const DataTable = lazy(() => import('@buildkit/ui/components/DataTable'));

// ✅ Good - Memoize expensive computations
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data]);
  return <DataTable data={processedData} />;
});
```

### 4. Accessibility

```jsx
// ✅ Good - BuildKit components include ARIA labels
<Input label="Email" type="email" required />

// ✅ Good - Add descriptive labels
<Button aria-label="Delete user John Doe">
  <i className="pi pi-trash" />
</Button>
```

### 5. Internationalization

```jsx
// ✅ Good - Use translation keys
<Button>{t('actions.save')}</Button>

// ❌ Bad - Hardcoded text
<Button>Save</Button>

// ✅ Good - Provide context for translators
<p>{t('welcome.message', { name: user.name, count: notifications.length })}</p>
```

## Troubleshooting

### Common Issues

#### 1. Analytics Not Working

```javascript
// Check if analytics is initialized
const status = await BuildKitUI.getAnalyticsStatus();
console.log(status);
// {
//   firebase: { enabled: true, initialized: true },
//   amplitude: { enabled: true, initialized: false, error: 'Invalid API key' },
//   clarity: { enabled: true, initialized: true }
// }
```

#### 2. Theme Not Applying

```jsx
// Ensure provider is at the root
function App() {
  return (
    <BuildKitProvider> {/* Must be at root */}
      <Router>
        <Routes>
          {/* Your routes */}
        </Routes>
      </Router>
    </BuildKitProvider>
  );
}
```

#### 3. Translations Not Loading

```javascript
// Debug translation loading
import { BuildKitUI } from '@buildkit/ui';

const debug = await BuildKitUI.debugTranslations();
console.log(debug);
// {
//   currentLanguage: 'en',
//   loadedNamespaces: ['common', 'auth'],
//   missingKeys: ['profile.settings.title'],
//   fallbackUsed: false
// }
```

#### 4. Performance Issues

```javascript
// Enable performance profiling
BuildKitUI.enableProfiling({
  slowComponentThreshold: 50, // ms
  onSlowRender: (component, duration) => {
    console.warn(`Slow render: ${component} took ${duration}ms`);
  }
});
```

### Debug Mode

Enable comprehensive debugging:

```javascript
// Enable debug mode
BuildKitUI.setDebugMode(true);

// Now all tracking events are logged
// Console output:
// [BuildKit] Event: button_click {component: "Button", label: "Save", ...}
// [BuildKit] Analytics sent to: Firebase ✓, Amplitude ✓, Clarity ✓
// [BuildKit] Performance: Button rendered in 2ms
```

### Support

For issues and questions:

1. Check the [GitHub Issues](https://github.com/buildkit/ui/issues)
2. Read the [FAQ](https://buildkit-ui.com/faq)
3. Join our [Discord Community](https://discord.gg/buildkit)
4. Email support: support@buildkit-ui.com

## Conclusion

BuildKit UI provides a complete solution for building modern, accessible, and performant applications with built-in analytics and error tracking. By following the patterns and best practices outlined in this guide, you can build robust applications that provide insights into user behavior while maintaining excellent performance and user experience.