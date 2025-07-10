// Test script to verify component exports and basic functionality
const { 
  Button, 
  Card, 
  Input, 
  Form, 
  Dialog,
  Dropdown,
  Checkbox,
  RadioButton,
  ProgressBar,
  DataTable,
  Toast,
  BuildKitProvider,
  ThemeProvider,
  TrackingProvider,
  ToastProvider,
  themes,
  initializeTracking,
  trackEvent,
  cn
} = require('../dist/plugin.cjs.js');

console.log('🧪 Testing BuildKit UI Components\n');

// Test 1: Verify all components are exported
console.log('✅ Test 1: Component Exports');
const components = {
  Button,
  Card,
  Input,
  Form,
  Dialog,
  Dropdown,
  Checkbox,
  RadioButton,
  ProgressBar,
  DataTable,
  Toast
};

Object.entries(components).forEach(([name, component]) => {
  console.log(`   - ${name}: ${typeof component === 'function' ? '✓' : '✗'}`);
});

// Test 2: Verify providers
console.log('\n✅ Test 2: Provider Exports');
const providers = {
  BuildKitProvider,
  ThemeProvider,
  TrackingProvider,
  ToastProvider
};

Object.entries(providers).forEach(([name, provider]) => {
  console.log(`   - ${name}: ${typeof provider === 'function' ? '✓' : '✗'}`);
});

// Test 3: Verify utility functions
console.log('\n✅ Test 3: Utility Functions');
console.log(`   - cn (classname utility): ${typeof cn === 'function' ? '✓' : '✗'}`);
console.log(`   - initializeTracking: ${typeof initializeTracking === 'function' ? '✓' : '✗'}`);
console.log(`   - trackEvent: ${typeof trackEvent === 'function' ? '✓' : '✗'}`);

// Test 4: Verify themes
console.log('\n✅ Test 4: Theme System');
console.log(`   - themes object: ${typeof themes === 'object' ? '✓' : '✗'}`);
console.log(`   - light theme: ${themes.light ? '✓' : '✗'}`);
console.log(`   - dark theme: ${themes.dark ? '✓' : '✗'}`);

// Test 5: Check component props (using Button as example)
console.log('\n✅ Test 5: Component Structure');
try {
  // Components should have expected React component properties
  console.log(`   - Button.$$typeof: ${Button.$$typeof ? '✓ (React component)' : '✗'}`);
  console.log(`   - Button.render: ${Button.render ? '✓' : '✗'}`);
} catch (e) {
  console.log('   - Component structure check: ✗', e.message);
}

// Test 6: Verify page components
console.log('\n✅ Test 6: Page Components');
const { 
  LoginPage,
  RegisterPage,
  ProfilePage,
  NotFoundPage,
  MaintenancePage,
  ErrorBoundaryPage,
  OfflinePage
} = require('../dist/plugin.cjs.js');

const pages = {
  LoginPage,
  RegisterPage,
  ProfilePage,
  NotFoundPage,
  MaintenancePage,
  ErrorBoundaryPage,
  OfflinePage
};

Object.entries(pages).forEach(([name, page]) => {
  console.log(`   - ${name}: ${typeof page === 'function' ? '✓' : '✗'}`);
});

// Test 7: Verify tracking functions
console.log('\n✅ Test 7: Tracking Functions');
const {
  addBreadcrumb,
  clearBreadcrumbs,
  trackError,
  trackInteraction,
  trackComponentMount,
  trackComponentUnmount,
  captureException,
  captureMessage
} = require('../dist/plugin.cjs.js');

const trackingFunctions = {
  addBreadcrumb,
  clearBreadcrumbs,
  trackError,
  trackInteraction,
  trackComponentMount,
  trackComponentUnmount,
  captureException,
  captureMessage
};

Object.entries(trackingFunctions).forEach(([name, func]) => {
  console.log(`   - ${name}: ${typeof func === 'function' ? '✓' : '✗'}`);
});

// Test 8: Platform detection utilities
console.log('\n✅ Test 8: Platform Utilities');
const {
  isWeb,
  isNative,
  isIOS,
  isAndroid,
  isMobile,
  getPlatform
} = require('../dist/plugin.cjs.js');

const platformUtils = {
  isWeb,
  isNative,
  isIOS,
  isAndroid,
  isMobile,
  getPlatform
};

Object.entries(platformUtils).forEach(([name, util]) => {
  console.log(`   - ${name}: ${typeof util === 'function' ? '✓' : '✗'}`);
});

console.log('\n✨ All tests completed!');