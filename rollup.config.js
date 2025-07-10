import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Main plugin bundle
  {
    input: 'dist/esm/index.js',
    output: [
      {
        file: 'dist/plugin.js',
        format: 'iife',
        name: 'BuildKitUi',
        globals: {
          '@capacitor/core': 'capacitorExports',
          '@capacitor/app': 'capacitorApp',
          '@capacitor/device': 'capacitorDevice',
          '@capacitor/network': 'capacitorNetwork',
          '@capacitor/preferences': 'capacitorPreferences',
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/plugin.cjs.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    external: [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/device',
      '@capacitor/network',
      '@capacitor/preferences',
      'react',
      'react-dom',
    ],
    plugins: [
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      json(),
    ],
  },
  
  // React components bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/components.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/components.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external: [
      '@capacitor/core',
      '@capacitor/app',
      '@capacitor/device',
      '@capacitor/network',
      '@capacitor/preferences',
      '@vettabase/capacitor-auth-manager',
      '@vettabase/capacitor-biometric-authentication',
      '@vettabase/capacitor-firebase-kit',
      '@vettabase/capacitor-native-update',
      '@amplitude/analytics-browser',
      '@microsoft/clarity',
      '@sentry/react',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'primereact',
      'primeicons',
      'react-aria',
      'react-i18next',
      'i18next',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        preferBuiltins: false,
        browser: true,
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      }),
      commonjs(),
      json(),
      postcss({
        modules: false,
        extract: 'buildkit-ui.css',
        minimize: production,
        use: ['sass'],
      }),
    ],
  },
];