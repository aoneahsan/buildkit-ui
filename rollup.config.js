import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const production = !process.env.ROLLUP_WATCH;

export default {
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
        'primereact': 'primereact',
        'react-i18next': 'reactI18next',
        'i18next': 'i18next',
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
    /^primereact/,
    'react-i18next',
    'i18next',
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    json(),
  ],
};