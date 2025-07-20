# Migration Guide

This guide helps you migrate from other UI libraries to BuildKit UI.

## Table of Contents

1. [From Material-UI (MUI)](#from-material-ui-mui)
2. [From Ant Design](#from-ant-design)
3. [From Chakra UI](#from-chakra-ui)
4. [From Native HTML/CSS](#from-native-htmlcss)
5. [From React Native](#from-react-native)
6. [General Migration Tips](#general-migration-tips)

## From Material-UI (MUI)

### Component Mapping

| MUI Component | BuildKit UI Component | Notes |
|---------------|----------------------|-------|
| `Button` | `Button` | Similar API, different variant names |
| `TextField` | `Input` | Simplified API with built-in tracking |
| `Dialog` | `Dialog` | Based on PrimeReact Dialog |
| `Select` | `Dropdown` | Different implementation |
| `DataGrid` | `DataTable` | PrimeReact-based |
| `Card` | `Card` | Similar structure |

### Code Examples

#### MUI Button → BuildKit Button

```tsx
// MUI
import { Button } from '@mui/material';

<Button variant="contained" color="primary" onClick={handleClick}>
  Click Me
</Button>

// BuildKit UI
import { Button } from 'buildkit-ui';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

#### MUI TextField → BuildKit Input

```tsx
// MUI
import { TextField } from '@mui/material';

<TextField
  label="Email"
  variant="outlined"
  fullWidth
  error={!!errors.email}
  helperText={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// BuildKit UI
import { Input } from 'buildkit-ui';

<Input
  label="Email"
  fullWidth
  error={errors.email}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### MUI Theme → BuildKit Theme

```tsx
// MUI
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>

// BuildKit UI
import { BuildKitProvider } from 'buildkit-ui';

const config = {
  theme: {
    themes: {
      custom: {
        name: 'custom',
        colors: {
          primary: '#1976d2',
        },
      },
    },
  },
};

<BuildKitProvider config={config}>
  <App />
</BuildKitProvider>
```

## From Ant Design

### Component Mapping

| Ant Design | BuildKit UI | Notes |
|------------|-------------|-------|
| `Button` | `Button` | Different variant system |
| `Input` | `Input` | Simpler API |
| `Form` | Custom implementation | Use React Hook Form |
| `Table` | `DataTable` | Different features |
| `Modal` | `Dialog` | Similar functionality |
| `Select` | `Dropdown` | Different API |

### Code Examples

#### Ant Design Form → BuildKit Form

```tsx
// Ant Design
import { Form, Input, Button } from 'antd';

<Form onFinish={handleSubmit}>
  <Form.Item name="email" rules={[{ required: true }]}>
    <Input placeholder="Email" />
  </Form.Item>
  <Form.Item>
    <Button type="primary" htmlType="submit">
      Submit
    </Button>
  </Form.Item>
</Form>

// BuildKit UI with React Hook Form
import { useForm } from 'react-hook-form';
import { Input, Button } from 'buildkit-ui';

const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <Input
    label="Email"
    {...register('email', { required: 'Email is required' })}
    error={errors.email?.message}
  />
  <Button type="submit">
    Submit
  </Button>
</form>
```

#### Ant Design Notification → BuildKit Toast

```tsx
// Ant Design
import { notification } from 'antd';

notification.success({
  message: 'Success',
  description: 'Operation completed successfully',
});

// BuildKit UI
import { toast } from 'buildkit-ui';

toast.success('Operation completed successfully', {
  position: 'top-right',
  duration: 3000,
});
```

## From Chakra UI

### Component Mapping

| Chakra UI | BuildKit UI | Notes |
|-----------|-------------|-------|
| `Button` | `Button` | Similar concepts |
| `Input` | `Input` | Built-in tracking |
| `Box` | `div` with Tailwind | Use utility classes |
| `Flex` | `div` with Tailwind | Use flex utilities |
| `Modal` | `Dialog` | Different API |
| `useColorMode` | `useTheme` | Different implementation |

### Code Examples

#### Chakra UI Layout → BuildKit Layout

```tsx
// Chakra UI
import { Box, Flex, Button } from '@chakra-ui/react';

<Box p={4} bg="gray.100">
  <Flex justify="space-between" align="center">
    <Button colorScheme="blue">Click Me</Button>
  </Flex>
</Box>

// BuildKit UI with Tailwind
import { Button } from 'buildkit-ui';

<div className="p-4 bg-gray-100">
  <div className="flex justify-between items-center">
    <Button variant="primary">Click Me</Button>
  </div>
</div>
```

#### Chakra UI Color Mode → BuildKit Theme

```tsx
// Chakra UI
import { useColorMode } from '@chakra-ui/react';

const { colorMode, toggleColorMode } = useColorMode();

<Button onClick={toggleColorMode}>
  Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
</Button>

// BuildKit UI
import { useTheme } from 'buildkit-ui';

const { mode, setMode, isDark } = useTheme();

<Button onClick={() => setMode(isDark ? 'light' : 'dark')}>
  Toggle {isDark ? 'Light' : 'Dark'}
</Button>
```

## From Native HTML/CSS

### Form Elements

```html
<!-- Native HTML -->
<form onsubmit="handleSubmit(event)">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  
  <label for="password">Password:</label>
  <input type="password" id="password" name="password" required>
  
  <button type="submit">Login</button>
</form>
```

```tsx
// BuildKit UI
import { Input, Button } from 'buildkit-ui';

<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    type="email"
    name="email"
    required
  />
  
  <Input
    label="Password"
    type="password"
    name="password"
    required
  />
  
  <Button type="submit">Login</Button>
</form>
```

### Styling Migration

```css
/* Native CSS */
.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}
```

```tsx
// BuildKit UI - Use variants or Tailwind
<Button variant="primary">
  Click Me
</Button>

// Or with custom classes
<Button className="bg-blue-500 hover:bg-blue-600 px-5 py-2.5">
  Click Me
</Button>
```

## From React Native

### Platform-Specific Code

```tsx
// React Native
import { Platform, View, Text, TouchableOpacity } from 'react-native';

<View style={styles.container}>
  <Text>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
  <TouchableOpacity onPress={handlePress}>
    <Text>Press Me</Text>
  </TouchableOpacity>
</View>

// BuildKit UI
import { Button } from 'buildkit-ui';
import { isIOS, isAndroid } from 'buildkit-ui/utils';

<div className="container">
  <p>{isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Web'}</p>
  <Button onClick={handlePress}>
    Press Me
  </Button>
</div>
```

### Navigation

```tsx
// React Native Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// BuildKit UI - Use React Router or similar
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { trackPageView } from 'buildkit-ui/tracking';

// Track navigation
const TrackedRoute = ({ component: Component, name, ...rest }) => {
  useEffect(() => {
    trackPageView(name);
  }, [name]);

  return <Component {...rest} />;
};
```

## General Migration Tips

### 1. Setup and Configuration

```bash
# Install BuildKit UI
npm install buildkit-ui

# Initialize in existing project
npx buildkit-ui init

# Remove old UI library
npm uninstall @mui/material @emotion/react @emotion/styled
# or
npm uninstall antd
# or
npm uninstall @chakra-ui/react
```

### 2. Update Imports

Create a mapping file during migration:

```typescript
// migration-mappings.ts
export const componentMap = {
  // MUI
  '@mui/material/Button': 'buildkit-ui',
  '@mui/material/TextField': 'buildkit-ui',
  
  // Ant Design
  'antd/es/button': 'buildkit-ui',
  'antd/es/input': 'buildkit-ui',
  
  // Chakra
  '@chakra-ui/react': 'buildkit-ui',
};
```

### 3. Gradual Migration Strategy

```tsx
// Step 1: Wrap with BuildKit Provider
import { BuildKitProvider } from 'buildkit-ui';

function App() {
  return (
    <BuildKitProvider config={config}>
      <ExistingApp /> {/* Your existing app */}
    </BuildKitProvider>
  );
}

// Step 2: Replace components one by one
// Start with leaf components (buttons, inputs)
// Move to complex components (forms, tables)
// Finally migrate layouts and providers
```

### 4. Handling Breaking Changes

```tsx
// Create adapter components during migration
import { Button as BuildKitButton } from 'buildkit-ui';

// Adapter for MUI Button API
export const Button = ({ variant, color, ...props }) => {
  const buildKitVariant = 
    color === 'primary' && variant === 'contained' ? 'primary' :
    color === 'secondary' && variant === 'contained' ? 'secondary' :
    variant === 'outlined' ? 'ghost' : 'primary';

  return <BuildKitButton variant={buildKitVariant} {...props} />;
};
```

### 5. Style Migration

```tsx
// If using CSS-in-JS (emotion, styled-components)
const StyledButton = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
  padding: 10px 20px;
`;

// Convert to Tailwind utilities
<Button 
  className={`
    ${primary ? 'bg-blue-500' : 'bg-gray-500'}
    text-white px-5 py-2.5
  `}
>
  Click Me
</Button>
```

### 6. Testing After Migration

```typescript
// Add tracking assertions to existing tests
import { trackEvent } from 'buildkit-ui/tracking';

jest.mock('buildkit-ui/tracking');

test('button click tracks event', async () => {
  render(<MyComponent />);
  
  fireEvent.click(screen.getByText('Click Me'));
  
  expect(trackEvent).toHaveBeenCalledWith({
    eventName: 'button_click',
    componentType: 'Button',
    parameters: expect.any(Object),
  });
});
```

### 7. Performance Considerations

- BuildKit UI includes tracking overhead (minimal, ~1-2ms per event)
- Bundle size comparison:
  - MUI: ~300KB (with emotion)
  - Ant Design: ~380KB
  - Chakra UI: ~250KB
  - BuildKit UI: ~150KB + PrimeReact (~200KB)

### 8. Common Gotchas

1. **Event Handler Names**: BuildKit uses standard React event names
2. **Styling System**: Tailwind utilities instead of CSS-in-JS
3. **Form Handling**: No built-in form state management (use React Hook Form)
4. **Icons**: Uses PrimeIcons by default
5. **Date Pickers**: Use PrimeReact Calendar component
6. **Animations**: Use Tailwind animations or Framer Motion

### 9. Migration Checklist

- [ ] Install BuildKit UI and dependencies
- [ ] Set up BuildKitProvider with configuration
- [ ] Map component imports
- [ ] Replace UI components starting with simple ones
- [ ] Migrate theme/styling system
- [ ] Update form handling
- [ ] Add tracking to key user flows
- [ ] Test on all target platforms
- [ ] Remove old UI library dependencies
- [ ] Update documentation

### 10. Getting Help

- Migration issues: [GitHub Issues](https://github.com/aoneahsan/buildkit-ui/issues)
- Examples: [Migration Examples Repo](https://github.com/aoneahsan/buildkit-ui-migration-examples)
- Community: Join our Discord for migration support