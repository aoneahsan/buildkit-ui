# BuildKit UI Setup Guide

This guide walks you through setting up BuildKit UI in your React + Capacitor project with all the available integrations.

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Analytics Setup](#analytics-setup)
4. [Error Tracking Setup](#error-tracking-setup)
5. [Capacitor Integrations](#capacitor-integrations)
6. [Platform-Specific Setup](#platform-specific-setup)
7. [Advanced Configuration](#advanced-configuration)

## Installation

### Using NPM
```bash
npm install buildkit-ui
```

### Using Yarn
```bash
yarn add buildkit-ui
```

### Quick Start with CLI
```bash
npx create-buildkit-app my-app
cd my-app
npm start
```

## Basic Setup

### 1. Initialize BuildKit UI

```typescript
import { BuildKitUI } from 'buildkit-ui';
import 'buildkit-ui/dist/styles/buildkit-ui.css';

// Initialize in your app's entry point
await BuildKitUI.initialize({
  appId: 'com.yourcompany.app',
  appName: 'Your App Name',
  version: '1.0.0',
  environment: 'production',
  
  tracking: {
    enabled: true,
    autoTrack: {
      clicks: true,
      pageViews: true,
      errors: true,
      performance: true
    }
  }
});
```

### 2. Wrap Your App

```tsx
import { BuildKitProvider } from 'buildkit-ui';

function App() {
  return (
    <BuildKitProvider
      config={{
        theme: 'light',
        locale: 'en',
        debug: process.env.NODE_ENV === 'development'
      }}
    >
      <YourApp />
    </BuildKitProvider>
  );
}
```

## Analytics Setup

### Firebase Analytics

```typescript
import { BuildKitUI } from 'buildkit-ui';

await BuildKitUI.initialize({
  // ... other config
  
  tracking: {
    analytics: {
      firebase: true // Requires capacitor-firebase-kit
    }
  },
  
  firebase: {
    config: {
      apiKey: "your-api-key",
      authDomain: "your-auth-domain",
      projectId: "your-project-id",
      storageBucket: "your-storage-bucket",
      messagingSenderId: "your-sender-id",
      appId: "your-app-id",
      measurementId: "your-measurement-id"
    }
  }
});
```

### Amplitude Analytics

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  tracking: {
    analytics: {
      amplitude: {
        apiKey: 'your-amplitude-api-key',
        options: {
          trackingSessionEvents: true,
          includeReferrer: true,
          includeUtm: true
        }
      }
    }
  }
});
```

### Microsoft Clarity

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  tracking: {
    analytics: {
      clarity: {
        projectId: 'your-clarity-project-id'
      }
    }
  }
});
```

### Using Unified Tracking

For the best experience, use the unified-tracking package:

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  integrations: {
    unifiedTracking: {
      enabled: true,
      providers: ['firebase', 'amplitude', 'clarity']
    }
  }
});
```

## Error Tracking Setup

### Sentry Integration

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  tracking: {
    errorTracking: {
      sentry: {
        dsn: 'your-sentry-dsn',
        environment: 'production',
        tracesSampleRate: 1.0,
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay()
        ]
      }
    }
  }
});
```

### Using Unified Error Handling

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  integrations: {
    unifiedErrorHandling: {
      enabled: true,
      providers: ['sentry']
    }
  }
});
```

## Capacitor Integrations

### Authentication (capacitor-auth-manager)

```typescript
import { AuthManager } from 'buildkit-ui/integrations';

// Initialize authentication
await AuthManager.initialize({
  providers: {
    google: {
      clientId: 'your-google-client-id',
      scope: ['email', 'profile']
    },
    apple: {
      clientId: 'your-apple-client-id',
      redirectUrl: 'your-redirect-url'
    }
  }
});

// Use in components
<LoginForm
  onSuccess={(user) => {
    console.log('User logged in:', user);
  }}
/>
```

### Biometric Authentication

```typescript
import { BiometricAuth } from 'buildkit-ui/integrations';

// Check availability
const isAvailable = await BiometricAuth.isAvailable();

// Authenticate
const result = await BiometricAuth.authenticate({
  reason: 'Please authenticate to continue',
  title: 'Authentication Required',
  subtitle: 'Use your fingerprint or face to login',
  fallbackButtonTitle: 'Use Passcode'
});
```

### Camera Integration

```tsx
import { Camera } from 'buildkit-ui/components';

<Camera
  onCapture={(photo) => {
    console.log('Photo captured:', photo);
  }}
  quality={90}
  allowEditing={true}
/>
```

### Native Updates

```typescript
import { NativeUpdate } from 'buildkit-ui/integrations';

// Check for updates
const update = await NativeUpdate.checkForUpdate();

if (update.available) {
  await NativeUpdate.downloadUpdate();
  await NativeUpdate.installUpdate();
}
```

## Platform-Specific Setup

### iOS Setup

1. **Install Pods**
```bash
cd ios
pod install
```

2. **Info.plist Permissions**
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select images</string>
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for secure authentication</string>
```

3. **Enable Capabilities**
- Push Notifications
- Background Modes
- Keychain Sharing (for biometric auth)

### Android Setup

1. **AndroidManifest.xml Permissions**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

2. **Gradle Configuration**
```gradle
android {
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 33
    }
}
```

### Web Setup

No additional setup required for web. All features gracefully degrade on unsupported platforms.

## Advanced Configuration

### Custom Theme

```typescript
import { createTheme } from 'buildkit-ui';

const customTheme = createTheme({
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    fontSize: {
      base: '16px',
      small: '14px',
      large: '18px'
    }
  }
});

<BuildKitProvider theme={customTheme}>
  <App />
</BuildKitProvider>
```

### Custom Tracking Events

```typescript
import { trackEvent } from 'buildkit-ui/tracking';

// Track custom events
await trackEvent({
  eventName: 'purchase_completed',
  parameters: {
    item_id: '12345',
    price: 29.99,
    currency: 'USD'
  },
  componentType: 'custom'
});
```

### Performance Monitoring

```typescript
import { startTrace, stopTrace } from 'buildkit-ui/tracking';

// Start a custom trace
const traceId = await startTrace('api_call');

// Perform operation
const data = await fetchData();

// Stop trace with metrics
await stopTrace(traceId, {
  itemCount: data.length,
  success: true
});
```

### Offline Configuration

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  offline: {
    enabled: true,
    queueSize: 1000,
    syncInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 5000 // 5 seconds
  }
});
```

### Debug Mode

```typescript
await BuildKitUI.initialize({
  // ... other config
  
  debug: true, // Enable debug logging
  
  tracking: {
    console: {
      enabled: true,
      style: 'colored' // 'simple' | 'colored' | 'detailed'
    }
  }
});
```

## Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_BUILDKIT_APP_ID=com.yourcompany.app
REACT_APP_BUILDKIT_ENVIRONMENT=production
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_AMPLITUDE_API_KEY=your-amplitude-api-key
REACT_APP_CLARITY_PROJECT_ID=your-clarity-project-id
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

## Next Steps

- Check out the [API Reference](./API.md) for detailed component documentation
- See [Usage Guide](./USAGE.md) for code examples
- Read the [Complete Guide](./COMPLETE_GUIDE.md) for in-depth feature documentation
- Join our [Discord Community](https://discord.gg/buildkit) for support

## Troubleshooting

### Common Issues

1. **"BuildKit UI not initialized" error**
   - Ensure you call `BuildKitUI.initialize()` before using any components

2. **Analytics not tracking**
   - Check if tracking is enabled in configuration
   - Verify API keys are correct
   - Check browser console for errors

3. **Biometric authentication not working**
   - Ensure proper permissions are set
   - Check if device supports biometric authentication
   - Verify keychain sharing is enabled on iOS

4. **Camera not working on web**
   - Ensure HTTPS is being used
   - Check browser permissions

For more help, see our [troubleshooting guide](https://github.com/aoneahsan/buildkit-ui/wiki/Troubleshooting) or [open an issue](https://github.com/aoneahsan/buildkit-ui/issues).