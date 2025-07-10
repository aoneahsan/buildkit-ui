# BuildKit UI API Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Plugin API](#core-plugin-api)
3. [React Components](#react-components)
4. [Hooks](#hooks)
5. [Providers](#providers)
6. [Tracking API](#tracking-api)
7. [Configuration](#configuration)
8. [CLI Commands](#cli-commands)

## Getting Started

### Installation

```bash
npm install buildkit-ui
# or
yarn add buildkit-ui
# or
pnpm add buildkit-ui
```

### Basic Setup

```tsx
import { BuildKitProvider } from 'buildkit-ui';
import { buildKitConfig } from './config/buildkit';

function App() {
  return (
    <BuildKitProvider config={buildKitConfig}>
      <YourApp />
    </BuildKitProvider>
  );
}
```

## Core Plugin API

### BuildKitUI

The main Capacitor plugin interface.

#### Methods

##### initialize(options: BuildKitConfig): Promise<{ success: boolean }>

Initialize the BuildKit UI plugin.

```typescript
await BuildKitUI.initialize({
  tracking: {
    autoTrack: true,
    trackUserJourney: true,
    trackPerformance: true,
    trackErrors: true,
  },
  firebase: {
    // Firebase config
  },
});
```

##### trackEvent(event: TrackingEvent): Promise<void>

Track a custom event.

```typescript
await BuildKitUI.trackEvent({
  eventName: 'button_click',
  componentType: 'Button',
  parameters: {
    label: 'Submit',
    variant: 'primary',
  },
});
```

##### trackError(error: ErrorEvent): Promise<void>

Track an error.

```typescript
await BuildKitUI.trackError({
  message: 'Failed to load data',
  stack: error.stack,
  severity: 'error',
  context: {
    userId: '123',
    action: 'fetchData',
  },
});
```

##### getPlatformInfo(): Promise<PlatformInfo>

Get current platform information.

```typescript
const info = await BuildKitUI.getPlatformInfo();
console.log(info.platform); // 'ios' | 'android' | 'web'
console.log(info.device);
console.log(info.network);
```

##### setUserProperties(properties: UserProperties): Promise<void>

Set user properties for tracking.

```typescript
await BuildKitUI.setUserProperties({
  userId: '123',
  email: 'user@example.com',
  plan: 'premium',
  custom: {
    favoriteColor: 'blue',
  },
});
```

## React Components

### Button

A tracked button component with built-in analytics.

```tsx
import { Button } from 'buildkit-ui';

<Button
  variant="primary"
  size="medium"
  onClick={() => console.log('Clicked!')}
  trackingMetadata={{ source: 'header' }}
>
  Click Me
</Button>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'ghost'` | `'primary'` | Button style variant |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| fullWidth | `boolean` | `false` | Make button full width |
| loading | `boolean` | `false` | Show loading state |
| loadingText | `string` | - | Text to show when loading |
| disabled | `boolean` | `false` | Disable the button |
| trackingEnabled | `boolean` | `true` | Enable tracking for this button |
| trackingMetadata | `object` | - | Additional tracking metadata |

### Input

A tracked input component with validation and accessibility.

```tsx
import { Input } from 'buildkit-ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  required
  error={errors.email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | - | Input label |
| helperText | `string` | - | Helper text below input |
| error | `string` | - | Error message |
| required | `boolean` | `false` | Mark as required |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | Input size |
| fullWidth | `boolean` | `false` | Make input full width |
| showCount | `boolean` | `false` | Show character count |
| maxLength | `number` | - | Maximum character length |
| trackingDebounce | `number` | `500` | Debounce delay for change tracking |

## Hooks

### useTracking

Hook for component tracking functionality.

```tsx
import { useTracking } from 'buildkit-ui';

function MyComponent() {
  const {
    componentId,
    trackEvent,
    trackInteraction,
    createClickHandler,
    measureAsync,
  } = useTracking({
    componentType: 'MyComponent',
    trackingEnabled: true,
  });

  const handleClick = createClickHandler(
    () => console.log('Clicked!'),
    'my_button_click',
    { source: 'my_component' }
  );

  const loadData = () => measureAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    'data_load'
  );

  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| componentId | `string` | Unique component ID |
| trackEvent | `(name: string, params?: object) => void` | Track custom event |
| trackInteraction | `(type: string, target: string, metadata?: object) => void` | Track interaction |
| createClickHandler | `<T>(handler: T, eventName: string, metadata?: object) => T` | Create tracked handler |
| measureAsync | `<T>(operation: () => Promise<T>, name: string) => Promise<T>` | Measure async operation |
| startMeasure | `(name: string) => void` | Start performance measurement |
| endMeasure | `(name: string) => number` | End performance measurement |

### useTheme

Hook for theme management.

```tsx
import { useTheme } from 'buildkit-ui';

function ThemeToggle() {
  const { mode, setMode, isDark } = useTheme();

  return (
    <button onClick={() => setMode(isDark ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| mode | `'light' \| 'dark' \| 'system'` | Current theme mode |
| setMode | `(mode: 'light' \| 'dark' \| 'system') => void` | Set theme mode |
| theme | `ThemeDefinition \| null` | Current theme object |
| setTheme | `(theme: ThemeDefinition) => void` | Set custom theme |
| isDark | `boolean` | Is dark mode active |

### useAuth

Hook for authentication (placeholder - integrate with capacitor-auth-manager).

```tsx
import { useAuth } from 'buildkit-ui';

function LoginButton() {
  const { isAuthenticated, signIn, signOut } = useAuth();

  if (isAuthenticated) {
    return <button onClick={signOut}>Sign Out</button>;
  }

  return <button onClick={() => signIn('google')}>Sign In</button>;
}
```

### useOffline

Hook for offline queue management.

```tsx
import { useOffline } from 'buildkit-ui';

function OfflineIndicator() {
  const { isOnline, queueSize, syncQueue } = useOffline();

  if (isOnline) return null;

  return (
    <div>
      Offline - {queueSize} items pending
      <button onClick={syncQueue}>Sync Now</button>
    </div>
  );
}
```

## Providers

### BuildKitProvider

Main provider that initializes BuildKit UI.

```tsx
<BuildKitProvider 
  config={buildKitConfig}
  primeConfig={{ /* PrimeReact config */ }}
  i18nInstance={i18n}
>
  <App />
</BuildKitProvider>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| config | `BuildKitConfig` | Yes | BuildKit configuration |
| primeConfig | `object` | No | PrimeReact configuration |
| i18nInstance | `i18n` | No | Custom i18n instance |

### ThemeProvider

Manages theme state and CSS variables.

```tsx
<ThemeProvider config={themeConfig}>
  <App />
</ThemeProvider>
```

### TrackingProvider

Manages tracking state and configuration.

```tsx
<TrackingProvider config={trackingConfig}>
  <App />
</TrackingProvider>
```

## Tracking API

### trackEvent

Track a custom event.

```typescript
import { trackEvent } from 'buildkit-ui/tracking';

trackEvent({
  eventName: 'form_submitted',
  componentType: 'ContactForm',
  parameters: {
    formId: 'contact',
    fields: 5,
  },
});
```

### trackError

Track an error.

```typescript
import { trackError } from 'buildkit-ui/tracking';

try {
  // Your code
} catch (error) {
  trackError(error, 'MyComponent', {
    action: 'fetchData',
    userId: '123',
  });
}
```

### trackPageView

Track a page view.

```typescript
import { trackPageView } from 'buildkit-ui/tracking';

trackPageView('ProductDetails', {
  productId: '123',
  category: 'Electronics',
});
```

### Performance Tracking

```typescript
import { startTrace, stopTrace, measureComponentPerformance } from 'buildkit-ui/tracking';

// Start a trace
const traceId = await startTrace('checkout_flow');

// Add metrics
addTraceMetric(traceId, 'items_count', 5);

// Stop trace
await stopTrace(traceId, {
  success: true,
  total: 99.99,
});

// Measure component performance
measureComponentPerformance('ProductList', 'render', 16.5);
```

## Configuration

### BuildKitConfig

Complete configuration interface.

```typescript
interface BuildKitConfig {
  tracking: {
    autoTrack: boolean;
    trackUserJourney: boolean;
    trackPerformance: boolean;
    trackErrors: boolean;
    trackNetwork: boolean;
    sessionTimeout?: number;
    eventPrefix?: string;
    
    analytics?: {
      firebase?: boolean;
      amplitude?: AmplitudeConfig;
      clarity?: ClarityConfig;
      custom?: CustomAnalyticsConfig;
    };
    
    errorTracking?: {
      sentry?: SentryConfig;
      crashlytics?: boolean;
      custom?: CustomErrorConfig;
    };
    
    platforms?: {
      ios?: IOSTrackingConfig;
      android?: AndroidTrackingConfig;
      web?: WebTrackingConfig;
    };
  };
  
  firebase?: FirebaseConfig;
  auth?: AuthConfig;
  updates?: UpdateConfig;
  offline?: OfflineConfig;
  theme?: ThemeConfig;
  i18n?: I18nConfig;
}
```

### Example Configuration

```typescript
export const buildKitConfig: BuildKitConfig = {
  tracking: {
    autoTrack: true,
    trackUserJourney: true,
    trackPerformance: true,
    trackErrors: true,
    trackNetwork: true,
    sessionTimeout: 1800000, // 30 minutes
    
    analytics: {
      firebase: true,
      amplitude: {
        apiKey: process.env.VITE_AMPLITUDE_API_KEY,
      },
      clarity: {
        projectId: process.env.VITE_CLARITY_PROJECT_ID,
      },
    },
    
    errorTracking: {
      sentry: {
        dsn: process.env.VITE_SENTRY_DSN,
        environment: 'production',
      },
      crashlytics: true,
    },
  },
  
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  },
  
  theme: {
    defaultMode: 'system',
    useCssVariables: true,
  },
  
  i18n: {
    defaultLanguage: 'en',
    languages: ['en', 'es', 'fr'],
  },
  
  offline: {
    queueSize: 1000,
    syncInterval: 60000, // 1 minute
    persistQueue: true,
    retryFailed: true,
    maxRetries: 3,
  },
};
```

## CLI Commands

### create-buildkit-app

Create a new Capacitor app with BuildKit UI.

```bash
npx create-buildkit-app my-app

# With options
npx create-buildkit-app my-app --template auth --package-manager yarn
```

#### Options

- `--template <type>` - Project template: basic, auth, dashboard
- `--package-manager <pm>` - Package manager: npm, yarn, pnpm
- `--typescript` - Use TypeScript (default)
- `--javascript` - Use JavaScript

### buildkit-ui CLI

Manage BuildKit UI in your project.

#### init

Initialize BuildKit UI in an existing project.

```bash
npx buildkit-ui init

# Force reinitialize
npx buildkit-ui init --force
```

#### configure

Configure specific features.

```bash
npx buildkit-ui configure firebase
npx buildkit-ui configure amplitude
npx buildkit-ui configure sentry
```

#### audit

Audit tracking implementation.

```bash
npx buildkit-ui audit

# Audit specific directory
npx buildkit-ui audit --dir src/components
```

#### generate

Generate components or pages.

```bash
# Generate component
npx buildkit-ui generate component MyButton
npx buildkit-ui g component MyButton --with-tracking --with-aria

# Generate page
npx buildkit-ui generate page Dashboard
npx buildkit-ui g page Dashboard --with-tracking
```

## Manual Configuration

If the automated setup doesn't work, you can configure BuildKit UI manually:

### 1. Install Dependencies

```bash
npm install buildkit-ui @capacitor/core @capacitor/app @capacitor/device @capacitor/network @capacitor/preferences react react-dom
```

### 2. Create Configuration File

Create `src/config/buildkit.ts`:

```typescript
import type { BuildKitConfig } from 'buildkit-ui';

export const buildKitConfig: BuildKitConfig = {
  tracking: {
    autoTrack: true,
    trackUserJourney: true,
    trackPerformance: true,
    trackErrors: true,
    trackNetwork: true,
  },
};
```

### 3. Add Provider to App

Update your main App component:

```tsx
import { BuildKitProvider } from 'buildkit-ui';
import { buildKitConfig } from './config/buildkit';

function App() {
  return (
    <BuildKitProvider config={buildKitConfig}>
      {/* Your app content */}
    </BuildKitProvider>
  );
}
```

### 4. Configure Capacitor

Initialize Capacitor in your project:

```bash
npx cap init
npx cap add ios
npx cap add android
```

### 5. Add Platform-Specific Configuration

#### iOS (ios/App/App/Info.plist)

Add required permissions:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library</string>
```

#### Android (android/app/src/main/AndroidManifest.xml)

Add required permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
```

### 6. Configure Analytics Providers

#### Firebase

1. Add Firebase configuration files:
   - iOS: `ios/App/App/GoogleService-Info.plist`
   - Android: `android/app/google-services.json`

2. Update configuration:

```typescript
firebase: {
  apiKey: 'your-api-key',
  authDomain: 'your-auth-domain',
  projectId: 'your-project-id',
  storageBucket: 'your-storage-bucket',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
}
```

#### Sentry

```typescript
errorTracking: {
  sentry: {
    dsn: 'your-sentry-dsn',
    environment: 'production',
  }
}
```

### 7. Build and Run

```bash
# Build web assets
npm run build

# Sync with native platforms
npx cap sync

# Run on iOS
npx cap run ios

# Run on Android
npx cap run android
```

## Best Practices

1. **Component Tracking**: Always provide meaningful `componentType` values for better analytics.

2. **Error Boundaries**: Wrap major sections of your app with error boundaries to catch and track errors.

3. **Performance Monitoring**: Use performance traces for critical user flows.

4. **User Properties**: Set user properties early in the app lifecycle for better segmentation.

5. **Offline Support**: Test your app's offline behavior and ensure critical events are queued.

6. **Privacy**: Review tracked data and ensure compliance with privacy regulations.

7. **Custom Events**: Use consistent naming conventions for custom events.