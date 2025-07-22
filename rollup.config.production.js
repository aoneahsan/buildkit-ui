import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const external = [
  '@capacitor/core',
  '@capacitor/app', 
  '@capacitor/device',
  '@capacitor/network',
  '@capacitor/preferences',
  'react',
  'react-dom',
  'react/jsx-runtime'
];

const globals = {
  '@capacitor/core': 'capacitorExports',
  '@capacitor/app': 'capacitorApp',
  '@capacitor/device': 'capacitorDevice',
  '@capacitor/network': 'capacitorNetwork',
  '@capacitor/preferences': 'capacitorPreferences',
  'react': 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'jsxRuntime'
};

// Custom plugin to resolve unified-tracking correctly
const unifiedTrackingResolver = {
  name: 'unified-tracking-resolver',
  resolveId(source) {
    if (source === 'unified-tracking') {
      return path.resolve(__dirname, 'node_modules/unified-tracking/dist/esm/src/index.js');
    }
    return null;
  }
};

export default [
  // Main ESM build (keep dependencies external)
  {
    input: 'dist/esm/index.js',
    output: {
      dir: 'dist',
      entryFileNames: 'plugin.esm.js',
      chunkFileNames: 'chunks/[name]-[hash].js',
      format: 'es',
      sourcemap: false,
    },
    external: [
      ...external,
      // Keep heavy dependencies external for ESM
      '@amplitude/analytics-browser',
      '@microsoft/clarity',
      '@sentry/react',
      'primereact',
      'primeicons',
      'i18next',
      'react-i18next',
      'react-aria',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    plugins: [
      unifiedTrackingResolver,
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      json(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        },
        format: {
          comments: false,
        },
      }),
    ],
  },
  // Minimal CJS build (for Node.js compatibility)
  {
    input: 'dist/esm/index.js',
    output: {
      dir: 'dist',
      entryFileNames: 'plugin.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    external,
    plugins: [
      unifiedTrackingResolver,
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      json(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      }),
    ],
  },
  // IIFE build for direct browser usage (minimal core only)
  {
    input: 'dist/esm/index.js',
    output: {
      dir: 'dist',
      entryFileNames: 'plugin.js',
      format: 'iife',
      name: 'BuildKitUi',
      globals,
      sourcemap: false,
      inlineDynamicImports: true,
    },
    external,
    plugins: [
      unifiedTrackingResolver,
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      json(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      }),
    ],
  }
];