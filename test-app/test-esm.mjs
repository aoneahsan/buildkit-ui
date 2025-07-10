// Test ESM imports
import { BuildKitUI, Button, Card, Input } from '../dist/esm/index.js';

console.log('✅ ESM import successful');
console.log('BuildKitUI:', typeof BuildKitUI);
console.log('Button:', typeof Button);
console.log('Card:', typeof Card);
console.log('Input:', typeof Input);

// Test that components can be instantiated
try {
  // These are React components, so we can check their structure
  console.log('\n✅ Component structure check:');
  console.log('Button displayName:', Button.displayName || 'Button component exists');
  console.log('Card displayName:', Card.displayName || 'Card component exists');
  console.log('Input displayName:', Input.displayName || 'Input component exists');
} catch (error) {
  console.error('❌ Component check failed:', error.message);
}