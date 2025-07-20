import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';

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
      },
      sourcemap: !production,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: !production,
      inlineDynamicImports: true,
      exports: 'named',
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
    peerDepsExternal({
      includeDependencies: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      preventAssignment: true,
    }),
    resolve({
      preferBuiltins: false,
      browser: true,
      dedupe: ['react', 'react-dom'],
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
    }),
    commonjs({
      transformMixedEsModules: true,
      dynamicRequireTargets: [],
    }),
    json(),
  ],
};