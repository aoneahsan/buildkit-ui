# BuildKit UI - Capacitor Package for React

## 📚 Documentation

For complete documentation covering every feature in detail, see:
- **[Complete Guide](docs/COMPLETE_GUIDE.md)** - Comprehensive documentation of all features
- **[API Reference](docs/API.md)** - Detailed API documentation
- **[Usage Guide](docs/USAGE.md)** - Usage patterns and examples
- **[Migration Guide](docs/MIGRATION.md)** - Migrating from other UI libraries

## 🎯 Project Overview

**BuildKit UI** is a Capacitor package that provides React UI components with comprehensive cross-platform tracking. It ensures every user interaction, error, and analytics event is captured with full platform context across Web, iOS, and Android by leveraging a powerful ecosystem of Capacitor packages.

### Package Identity

- **Package ID**: `com.aoneahsan.buildkit_ui`
- **NPM Package**: `buildkit-ui`
- **Type**: Capacitor Plugin with React Components
- **Target**: React + Capacitor Applications
- **GitHub Repository**: `github.com/aoneahsan/buildkit-ui`
- **CLI Package**: `create-buildkit-app`

### Core Mission

**"Every Tap, Every Error, Every Platform"** - BuildKit UI ensures no user interaction goes untracked across Web, iOS, and Android platforms.

### What Makes BuildKit UI a Capacitor Package?

- **Native-First Architecture**: Components directly communicate with native APIs
- **Platform Context**: Every component knows which platform it's running on
- **Deep Native Integration**: Uses Capacitor's bridge for all native features
- **Offline-First**: Native storage and queue management
- **Hardware Access**: Direct access to camera, biometrics, and sensors

---

## 🚀 Key Features

### 1. Capacitor-Native Components

Every BuildKit UI component is built with Capacitor at its core:

```typescript
// Example: Every component captures platform context
<Button
  label="Purchase"
  onClick={async () => {
    // Automatically captured with each interaction:
    // - Platform (iOS/Android/Web)
    // - Device ID, Model, OS Version
    // - Network Status (WiFi/Cellular/Offline)
    // - App Version & Build Number
    // - Session ID & User Journey
    // - Performance Metrics (render time, interaction delay)
    // - Memory Usage & Battery Level
  }}
/>
```

### 2. Integrated Authentication System

Leveraging the power of **capacitor-auth-manager**, BuildKit UI provides:

```typescript
// Every auth attempt is tracked with platform context
<LoginPage
  // All authentication providers
  providers={{
    google: true,
    apple: true,
    microsoft: true,
    facebook: true,
    github: true,
    slack: true,
    linkedin: true,
    firebase: true,
    emailMagicLink: true,
    sms: true,
    emailPassword: true,
    phonePassword: true,
    usernamePassword: true,
    emailCode: true,
    biometric: true  // via capacitor-biometric-authentication
  }}

  // Each auth event tracked with:
  // - Provider used
  // - Platform (iOS/Android/Web)
  // - Success/Failure reason
  // - Time taken
  // - Network conditions
  // - Device fingerprint
/>
```

### 3. Comprehensive Firebase Integration

Using **capacitor-firebase-kit**, every component automatically integrates Firebase services:

```typescript
// Analytics - Every interaction tracked
<Button onClick={() => {
  // Automatically logs to Firebase Analytics with:
  // - Event name: 'button_click'
  // - Component: 'Button'
  // - Platform: Capacitor.getPlatform()
  // - Device: await Device.getInfo()
  // - Session: Current session ID
  // - User properties: All set properties
}} />

// Crashlytics - Every error captured
<DataTable
  onError={(error) => {
    // Automatically logged to Crashlytics with:
    // - Full stack trace
    // - Platform context
    // - User actions leading to error
    // - Device state (memory, battery)
    // - Network status
  }}
/>

// Performance - Every render measured
<ProductList
  // Automatically tracks:
  // - Component mount time
  // - Data fetch duration
  // - Render performance
  // - User interaction delays
  // - Memory usage
/>

// Remote Config - Dynamic UI updates
<FeatureFlag
  flag="new_checkout_flow"
  // UI updates based on Remote Config
  // No app update required
/>
```

### 4. Native Update Management

With **capacitor-native-update** integration:

```typescript
<UpdateManager
  config={{
    checkOnLaunch: true,
    checkInterval: 3600000, // 1 hour
    showReleaseNotes: true,
    allowSkip: true, // For non-mandatory updates
    autoDownload: 'wifi-only'
  }}

  // Tracks update events:
  // - Update available
  // - Download progress
  // - Install success/failure
  // - User actions (skip/install)
/>
```

### 5. Biometric Security

Seamless biometric integration via **capacitor-biometric-authentication**:

```typescript
<SecureForm
  requireBiometric={true}
  onSubmit={async (data) => {
    // Biometric verification before submission
    // Tracks:
    // - Biometric type used (Face/Fingerprint)
    // - Success/Failure
    // - Fallback method used
    // - Time taken
  }}
/>
```

### 6. Platform-Specific Tracking Details

#### **Web Platform**

- Page views with referrer
- Browser and version
- Screen resolution
- Mouse vs touch interactions
- PWA install status
- Online/offline events

#### **iOS Platform**

- Device model and iOS version
- App Store vs TestFlight
- Push notification permissions
- Location permissions
- Camera/Photo library access
- Face ID availability
- Network type (WiFi/Cellular)
- Jailbreak detection

#### **Android Platform**

- Device manufacturer and model
- Android version and API level
- Google Play vs sideload
- Permission status for all features
- Fingerprint sensor availability
- Network type and strength
- Root detection

### 7. Comprehensive Event Tracking

Every BuildKit UI component automatically tracks:

```typescript
interface AutoTrackedEvent {
  // Event Details
  eventName: string;
  componentType: string;
  componentProps: object;
  timestamp: number;

  // User Context
  userId?: string;
  sessionId: string;
  userJourney: string[]; // Previous screens/actions

  // Platform Context
  platform: 'ios' | 'android' | 'web';
  platformVersion: string;
  appVersion: string;
  buildNumber: string;

  // Device Context
  deviceId: string;
  deviceModel: string;
  deviceManufacturer?: string; // Android only
  isSimulator: boolean;

  // Performance Context
  renderTime: number;
  interactionDelay: number;
  memoryUsage?: number;
  batteryLevel?: number;

  // Network Context
  isOnline: boolean;
  connectionType?: string;
  downloadSpeed?: number;

  // Location Context (if permitted)
  country?: string;
  region?: string;
  city?: string;

  // Error Context (if applicable)
  errorMessage?: string;
  errorStack?: string;
  errorCode?: string;
}
```

### 8. Pre-built Tracked Templates

Complete page templates with built-in tracking:

```typescript
// Authentication Pages
<LoginPage
  onEvent={(event) => {
    // Tracks: login_attempt, login_success, login_failure
    // With: method used, time taken, error reason
  }}
/>

<RegisterPage
  onEvent={(event) => {
    // Tracks: registration_start, field_completed, registration_success
    // With: completion time, validation errors, drop-off points
  }}
/>

<BiometricSetupPage
  onEvent={(event) => {
    // Tracks: biometric_enrollment, setup_success, setup_skipped
    // With: biometric type, device capability, user choice
  }}
/>

// User Journey Pages
<OnboardingFlow
  onEvent={(event) => {
    // Tracks: onboarding_start, step_completed, onboarding_finished
    // With: time per step, skip actions, completion rate
  }}
/>

<ProfilePage
  onEvent={(event) => {
    // Tracks: profile_view, edit_start, photo_changed, save_success
    // With: fields edited, photo source, save duration
  }}
/>

// Utility Pages with Tracking
<OfflinePage
  onEvent={(event) => {
    // Tracks: offline_detected, retry_attempt, connection_restored
    // With: offline duration, retry count, connection type
  }}
/>

<UpdateRequiredPage
  onEvent={(event) => {
    // Tracks: update_prompted, update_started, update_completed
    // With: current version, new version, user action
  }}
/>
```

---

## 🛠️ Technical Architecture

### Package Structure as a Capacitor Plugin

```
buildkit-ui/
├── src/
│   ├── definitions.ts      # Capacitor plugin definitions
│   ├── index.ts           # Main plugin export
│   ├── web.ts             # Web implementation
│   │
│   ├── components/        # React components with native bridges
│   │   ├── Button/
│   │   │   ├── Button.tsx          # React component
│   │   │   ├── Button.native.ts    # Native communication
│   │   │   ├── Button.tracking.ts  # Tracking logic
│   │   │   └── Button.types.ts     # TypeScript types
│   │   └── [other components...]
│   │
│   ├── native/            # Native feature integrations
│   │   ├── auth/          # capacitor-auth-manager bridge
│   │   ├── firebase/      # capacitor-firebase-kit bridge
│   │   ├── biometric/     # capacitor-biometric bridge
│   │   └── updates/       # capacitor-native-update bridge
│   │
│   ├── tracking/          # Cross-platform tracking system
│   │   ├── analytics.ts   # Analytics orchestration
│   │   ├── errors.ts      # Error tracking
│   │   ├── performance.ts # Performance monitoring
│   │   └── platform.ts    # Platform detection
│   │
│   └── utils/             # Utilities
│       ├── device.ts      # Device information
│       ├── network.ts     # Network status
│       └── storage.ts     # Offline queue
│
├── ios/                   # iOS native code
│   ├── Plugin/
│   │   ├── BuildKitPlugin.swift
│   │   ├── BuildKitPlugin.m
│   │   └── Tracking/
│   │       ├── EventTracker.swift
│   │       └── ErrorHandler.swift
│   └── Podfile
│
├── android/               # Android native code
│   ├── src/main/java/com/aoneahsan/buildkit_ui/
│   │   ├── BuildKitPlugin.java
│   │   ├── tracking/
│   │   │   ├── EventTracker.kt
│   │   │   └── ErrorHandler.kt
│   │   └── AndroidManifest.xml
│   └── build.gradle
│
├── package.json
└── capacitor.config.json
```

### Dependencies

```json
{
  "name": "buildkit-ui",
  "version": "1.0.0",
  "description": "Capacitor package for React with comprehensive cross-platform tracking",
  "main": "dist/plugin.cjs.js",
  "module": "dist/esm/index.js",
  "types": "dist/esm/index.d.ts",
  "unpkg": "dist/plugin.js",
  "author": {
    "name": "Ahsan Mahmood",
    "email": "aoneahsan@gmail.com",
    "url": "https://aoneahsan.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/aoneahsan/buildkit-ui"
  },
  "homepage": "https://github.com/aoneahsan/buildkit-ui",
  "bugs": {
    "url": "https://github.com/aoneahsan/buildkit-ui/issues"
  },
  "keywords": [
    "capacitor",
    "plugin",
    "react",
    "ui",
    "components",
    "tracking",
    "analytics",
    "cross-platform",
    "mobile",
    "ios",
    "android",
    "web"
  ],
  "capacitor": {
    "ios": {
      "src": "ios"
    },
    "android": {
      "src": "android"
    }
  },
  "dependencies": {
    "@capacitor/core": "^5.0.0",
    "capacitor-auth-manager": "^latest",
    "capacitor-firebase-kit": "^latest",
    "capacitor-biometric-authentication": "^latest",
    "capacitor-native-update": "^latest",
    "primereact": "^10.x",
    "react": "^18.x"
  },
  "peerDependencies": {
    "@capacitor/app": "^5.0.0",
    "@capacitor/device": "^5.0.0",
    "@capacitor/network": "^5.0.0",
    "@capacitor/preferences": "^5.0.0"
  },
  "devDependencies": {
    "@capacitor/ios": "^5.0.0",
    "@capacitor/android": "^5.0.0"
  },
  "license": "MIT"
}
```

---

## 📦 Installation & Setup

### Installation

```bash
# Install BuildKit UI
npm install buildkit-ui

# Install peer dependencies
npm install @capacitor/app @capacitor/device @capacitor/network @capacitor/preferences

# Sync Capacitor
npx cap sync
```

### Quick Setup with CLI

```bash
# Initialize BuildKit UI in your Capacitor project
npx buildkit-ui init

# This will:
# ✅ Configure all required packages
# ✅ Set up Firebase services
# ✅ Configure native projects
# ✅ Add tracking to all platforms
# ✅ Set up offline queuing
```

### Manual Configuration

```typescript
// 1. Configure Capacitor
import { BuildKitPlugin } from 'buildkit-ui';

// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.aoneahsan.buildkit_ui',
  appName: 'My App',
  plugins: {
    BuildKit: {
      enableTracking: true,
      platforms: ['ios', 'android', 'web'],
      firebase: {
        analytics: true,
        crashlytics: true,
        performance: true,
        remoteConfig: true
      }
    }
  }
};

// 2. Initialize in your app
import { BuildKitProvider, BuildKitConfig } from 'buildkit-ui';

const config: BuildKitConfig = {
  // Tracking Configuration
  tracking: {
    autoTrack: true,
    trackUserJourney: true,
    trackPerformance: true,
    trackErrors: true,
    trackNetwork: true,
    sessionTimeout: 1800000, // 30 minutes

    // Platform-specific tracking
    platforms: {
      ios: {
        trackDeviceInfo: true,
        trackAppStore: true,
        trackPermissions: true
      },
      android: {
        trackDeviceInfo: true,
        trackPlayStore: true,
        trackPermissions: true
      },
      web: {
        trackBrowser: true,
        trackPWA: true,
        trackViewport: true
      }
    }
  },

  // Firebase Configuration (via capacitor-firebase-kit)
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
  },

  // Auth Configuration (via capacitor-auth-manager)
  auth: {
    providers: {
      google: { clientId: 'your-google-client-id' },
      apple: { clientId: 'your-apple-client-id' },
      biometric: {
        required: false,
        fallbackToPasscode: true
      }
    }
  },

  // Update Configuration (via capacitor-native-update)
  updates: {
    enabled: true,
    checkOnLaunch: true,
    mandatoryUpdates: true
  },

  // Offline Configuration
  offline: {
    queueSize: 1000,
    syncInterval: 60000, // 1 minute
    persistQueue: true
  }
};

// 3. Wrap your app
function App() {
  return (
    <BuildKitProvider config={config}>
      <YourApp />
    </BuildKitProvider>
  );
}
```

---

## 🎨 Usage Examples

### Basic Component with Automatic Tracking

```typescript
import { Button, Form, DataTable } from 'buildkit-ui';

function MyComponent() {
  return (
    <>
      {/* Every interaction is tracked */}
      <Button
        label="Add to Cart"
        onClick={() => {
          // Automatically tracks:
          // - button_click event
          // - Platform context
          // - User session
          // - Performance metrics
          // - Network status
        }}
      />

      {/* Form tracking */}
      <Form
        onFieldChange={(field, value) => {
          // Tracks field interactions
          // Identifies drop-off points
        }}
        onSubmit={(data) => {
          // Tracks submission success/failure
          // Includes time to complete
        }}
      />

      {/* Data tracking */}
      <DataTable
        onSort={(column, direction) => {
          // Tracks user preferences
        }}
        onFilter={(filters) => {
          // Tracks search patterns
        }}
        onError={(error) => {
          // Full error context to Crashlytics
        }}
      />
    </>
  );
}
```

### Authentication with Full Tracking

```typescript
import { useAuth, LoginPage } from 'buildkit-ui';

function AuthExample() {
  const { signIn, signOut, user } = useAuth();

  return (
    <LoginPage
      onAuthAttempt={(provider) => {
        // Tracks: auth_attempt_started
        // With: provider, platform, device
      }}

      onAuthSuccess={(user, provider, duration) => {
        // Tracks: auth_success
        // With: provider, time_taken, platform
      }}

      onAuthFailure={(error, provider) => {
        // Tracks: auth_failure
        // With: error_code, provider, platform
        // Sends to Crashlytics
      }}

      onBiometricUsed={(type, success) => {
        // Tracks: biometric_used
        // With: type (face/fingerprint), success
      }}
    />
  );
}
```

### Performance Monitoring

```typescript
import { ScreenView, usePerformance } from 'buildkit-ui';

function PerformanceExample() {
  const { startTrace, stopTrace } = usePerformance();

  const loadProducts = async () => {
    // Start performance trace
    const traceId = await startTrace('product_load');

    try {
      const products = await api.getProducts();

      // Add metrics
      await addMetric(traceId, 'product_count', products.length);

      return products;
    } finally {
      // Stop trace (includes duration)
      await stopTrace(traceId);
    }
  };

  return (
    <ScreenView name="ProductList">
      {/* Automatically tracks:
          - Screen render time
          - Time to interactive
          - Component tree depth
          - Memory usage
      */}
    </ScreenView>
  );
}
```

### Offline Queue Management

```typescript
import { useOfflineQueue } from 'buildkit-ui';

function OfflineExample() {
  const { isOnline, queueSize, syncQueue } = useOfflineQueue();

  const submitData = async (data) => {
    try {
      await api.submit(data);

      // Track online submission
      track('data_submitted', {
        online: true,
        platform: getPlatform()
      });
    } catch (error) {
      if (!isOnline) {
        // Automatically queued for later
        // Tracks: data_queued_offline
      }
    }
  };

  return (
    <div>
      {!isOnline && (
        <Banner>
          Offline - {queueSize} items pending sync
          <Button onClick={syncQueue}>Sync Now</Button>
        </Banner>
      )}
    </div>
  );
}
```

### Native Features with Tracking

```typescript
import { Camera, FileUpload, BiometricPrompt } from 'buildkit-ui';

function NativeFeatures() {
  return (
    <>
      <Camera
        onPhoto={(photo, metadata) => {
          // Tracks: photo_taken
          // With: source (camera/gallery), size, duration
        }}
        onPermissionDenied={() => {
          // Tracks: camera_permission_denied
          // With: platform, prompt_count
        }}
      />

      <FileUpload
        onUploadProgress={(progress) => {
          // Tracks: upload_progress
          // With: percentage, network_type, speed
        }}
        onUploadComplete={(file, duration) => {
          // Tracks: upload_complete
          // With: file_size, duration, network_type
        }}
      />

      <BiometricPrompt
        reason="Confirm payment"
        onSuccess={(biometricType) => {
          // Tracks: biometric_success
          // With: type, device_capability
        }}
        onFallback={(method) => {
          // Tracks: biometric_fallback
          // With: fallback_method, reason
        }}
      />
    </>
  );
}
```

---

## 📊 What Gets Tracked

### User Interactions

- Every tap, click, swipe, long-press
- Form field interactions
- Navigation between screens
- Time spent on each screen
- Scroll depth and patterns
- Component visibility duration

### Technical Metrics

- App launch time (cold/warm start)
- Screen render performance
- API response times
- Component mount/unmount times
- Memory usage patterns
- Battery drain by feature

### Errors & Crashes

- JavaScript exceptions with stack traces
- Native crashes (iOS/Android)
- Network request failures
- Component render errors
- Promise rejections
- Native bridge communication errors

### Platform Context

- Device model and manufacturer
- OS version and build
- App version and build number
- Screen size and density
- Available storage and memory
- Network type and speed

### User Journey

- Session start/end
- Screen flow sequence
- Feature adoption
- Drop-off points
- Conversion funnels
- Engagement patterns

---

## 🔒 Privacy & Security

### Data Protection

- No PII collected by default
- User consent management built-in
- GDPR/CCPA compliant
- Data encryption in transit
- Secure storage for offline queue
- Configurable data retention

### Security Features

- Certificate pinning
- Jailbreak/root detection
- App attestation (iOS/Android)
- Secure key storage
- Biometric hardware security
- Code obfuscation

---

## 🚀 CLI Tools

```bash
# Create new Capacitor app with BuildKit UI
npx create-buildkit-app my-app

# Initialize in existing project
npx buildkit-ui init

# Configure platforms
npx buildkit-ui configure ios
npx buildkit-ui configure android
npx buildkit-ui configure web

# Generate tracked component
npx buildkit-ui generate component MyComponent --with-tracking

# Check tracking implementation
npx buildkit-ui audit tracking

# Test offline queue
npx buildkit-ui test offline

# View tracking dashboard
npx buildkit-ui dashboard
```

---

## 📈 Performance Impact

### Bundle Sizes

- Core tracking: ~25KB gzipped
- React components: ~75KB gzipped
- Total with all features: ~150KB gzipped

### Runtime Performance

- < 1ms tracking overhead per event
- Async tracking (non-blocking)
- Batched network requests
- Smart offline queue management
- Automatic performance budgets

---

## 🗓️ Roadmap

### Phase 1: Foundation (Months 1-2)

- [ ] Core Capacitor plugin structure
- [ ] Integration with ecosystem packages
- [ ] Basic component tracking
- [ ] Platform detection system
- [ ] Offline queue implementation

### Phase 2: Components (Months 2-4)

- [ ] Tracked PrimeReact components
- [ ] Page templates with analytics
- [ ] Native feature components
- [ ] Error boundary system
- [ ] Performance monitoring

### Phase 3: Advanced (Months 4-5)

- [ ] A/B testing framework
- [ ] User session replay
- [ ] Predictive analytics
- [ ] Custom dashboards
- [ ] Advanced debugging tools

### Phase 4: Launch (Month 6)

- [ ] Documentation site
- [ ] Example apps
- [ ] Migration guides
- [ ] Community building
- [ ] Enterprise features

---

## 🤝 Community & Support

### Resources

- **Documentation**: https://github.com/aoneahsan/buildkit-ui/wiki
- **GitHub**: https://github.com/aoneahsan/buildkit-ui
- **NPM**: https://www.npmjs.com/package/buildkit-ui
- **Examples**: https://github.com/aoneahsan/buildkit-ui-examples
- **Issues**: https://github.com/aoneahsan/buildkit-ui/issues

### Contributing

- Fork the repository
- Create your feature branch
- Commit your changes
- Push to the branch
- Create a Pull Request

All contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

## 📝 License

MIT License - Open source and free for commercial use

```
MIT License

Copyright (c) 2024 Ahsan Mahmood

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Developer

**Ahsan Mahmood**

- 🌐 Website: [https://aoneahsan.com](https://aoneahsan.com)
- 📧 Email: [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com)
- 💼 LinkedIn: [https://linkedin.com/in/aoneahsan](https://linkedin.com/in/aoneahsan)
- 📱 Phone: +923046619706

---

## 🎯 Summary

BuildKit UI is an open-source **Capacitor package** developed by Ahsan Mahmood for the community. It provides React components with unprecedented tracking capabilities across all platforms. By leveraging a powerful ecosystem of Capacitor packages, it ensures:

- ✅ **Every user interaction** is tracked with full platform context
- ✅ **Every error** includes native stack traces and device state
- ✅ **Every component** knows which platform it's running on
- ✅ **Every event** is queued offline and synced when connected
- ✅ **Every metric** helps you understand user behavior

This is not just a UI library - it's a complete platform tracking solution built as a Capacitor plugin with React components, designed to give developers unprecedented insight into their applications across Web, iOS, and Android platforms.
