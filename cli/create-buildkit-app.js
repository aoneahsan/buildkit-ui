#!/usr/bin/env node

const { program } = require('commander');
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { execSync } = require('child_process');

program
  .name('create-buildkit-app')
  .description('Create a new Capacitor app with BuildKit UI')
  .version('0.0.1')
  .argument('[project-name]', 'Name of the project')
  .option('-t, --template <template>', 'Project template (basic, auth, dashboard)', 'basic')
  .option('-p, --package-manager <pm>', 'Package manager to use (npm, yarn, pnpm)', 'npm')
  .option('--typescript', 'Use TypeScript (default)', true)
  .option('--javascript', 'Use JavaScript')
  .parse();

async function run() {
  const options = program.opts();
  const args = program.args;
  
  console.log(chalk.blue('\n🚀 Welcome to BuildKit UI!\n'));

  // Get project name
  let projectName = args[0];
  if (!projectName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-buildkit-app',
      validate: value => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Project name can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      }
    });
    projectName = response.projectName;
  }

  if (!projectName) {
    console.log(chalk.red('Project name is required'));
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Directory ${projectName} already exists!`));
    process.exit(1);
  }

  // Get configuration
  const config = await prompts([
    {
      type: 'select',
      name: 'template',
      message: 'Select a template',
      choices: [
        { title: 'Basic - Minimal setup with core components', value: 'basic' },
        { title: 'Authentication - Includes auth pages and flows', value: 'auth' },
        { title: 'Dashboard - Admin dashboard template', value: 'dashboard' },
      ],
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select features to include',
      choices: [
        { title: 'Firebase Analytics', value: 'firebase', selected: true },
        { title: 'Amplitude Analytics', value: 'amplitude' },
        { title: 'Microsoft Clarity', value: 'clarity' },
        { title: 'Sentry Error Tracking', value: 'sentry', selected: true },
        { title: 'Biometric Authentication', value: 'biometric' },
        { title: 'Native Updates', value: 'updates' },
      ]
    },
    {
      type: 'multiselect',
      name: 'platforms',
      message: 'Which platforms will you target?',
      choices: [
        { title: 'iOS', value: 'ios', selected: true },
        { title: 'Android', value: 'android', selected: true },
        { title: 'Web/PWA', value: 'web', selected: true },
      ]
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Include Tailwind CSS configuration?',
      initial: true
    },
    {
      type: 'confirm',
      name: 'i18n',
      message: 'Include internationalization setup?',
      initial: true
    }
  ]);

  console.log(chalk.blue('\n📦 Creating your BuildKit UI app...\n'));

  // Create project directory
  fs.mkdirSync(projectPath, { recursive: true });

  // Initialize package.json
  const spinner = ora('Initializing project...').start();
  
  try {
    // Create package.json
    const packageJson = {
      name: projectName,
      version: '0.0.1',
      private: true,
      scripts: {
        start: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        'build:ios': 'npm run build && cap sync ios',
        'build:android': 'npm run build && cap sync android',
        'open:ios': 'cap open ios',
        'open:android': 'cap open android',
        lint: 'eslint src --ext ts,tsx',
        test: 'jest',
      },
      dependencies: {
        '@capacitor/app': '^7.0.0',
        '@capacitor/core': '^7.0.0',
        '@capacitor/device': '^7.0.0',
        '@capacitor/network': '^7.0.0',
        '@capacitor/preferences': '^7.0.0',
        'buildkit-ui': '^0.0.1',
        'react': '^18.3.1',
        'react-dom': '^18.3.1',
      },
      devDependencies: {
        '@capacitor/cli': '^7.0.0',
        '@types/react': '^18.3.3',
        '@types/react-dom': '^18.3.0',
        '@vitejs/plugin-react': '^4.3.1',
        'typescript': '^5.5.3',
        'vite': '^5.3.3',
      }
    };

    // Add platform dependencies
    if (config.platforms.includes('ios')) {
      packageJson.devDependencies['@capacitor/ios'] = '^7.0.0';
    }
    if (config.platforms.includes('android')) {
      packageJson.devDependencies['@capacitor/android'] = '^7.0.0';
    }

    // Add feature dependencies
    if (config.features.includes('firebase')) {
      packageJson.dependencies['@vettabase/capacitor-firebase-kit'] = '^1.0.0';
    }
    if (config.features.includes('amplitude')) {
      packageJson.dependencies['@amplitude/analytics-browser'] = '^2.11.10';
    }
    if (config.features.includes('clarity')) {
      packageJson.dependencies['@microsoft/clarity'] = '^0.8.18';
    }
    if (config.features.includes('sentry')) {
      packageJson.dependencies['@sentry/react'] = '^8.48.0';
    }
    if (config.features.includes('biometric')) {
      packageJson.dependencies['@vettabase/capacitor-biometric-authentication'] = '^1.0.0';
    }
    if (config.features.includes('updates')) {
      packageJson.dependencies['@vettabase/capacitor-native-update'] = '^1.0.0';
    }

    // Add Tailwind if selected
    if (config.tailwind) {
      packageJson.devDependencies['tailwindcss'] = '^3.4.0';
      packageJson.devDependencies['autoprefixer'] = '^10.4.19';
      packageJson.devDependencies['postcss'] = '^8.4.38';
    }

    // Add i18n if selected
    if (config.i18n) {
      packageJson.dependencies['i18next'] = '^24.0.0';
      packageJson.dependencies['react-i18next'] = '^16.0.0';
    }

    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    spinner.succeed('Project initialized');

    // Create project structure
    spinner.start('Creating project structure...');
    
    const dirs = [
      'src',
      'src/components',
      'src/pages',
      'src/hooks',
      'src/utils',
      'src/config',
      'src/assets',
      'public',
    ];

    dirs.forEach(dir => {
      fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
    });

    // Create configuration files
    await createConfigFiles(projectPath, config);

    // Create source files based on template
    await createSourceFiles(projectPath, config);

    spinner.succeed('Project structure created');

    // Install dependencies
    spinner.start('Installing dependencies...');
    
    const pm = options.packageManager;
    const installCmd = pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm install' : 'npm install';
    
    execSync(installCmd, {
      cwd: projectPath,
      stdio: 'ignore'
    });

    spinner.succeed('Dependencies installed');

    // Initialize Capacitor
    spinner.start('Initializing Capacitor...');
    
    execSync(`npx cap init ${projectName} com.example.${projectName} --web-dir dist`, {
      cwd: projectPath,
      stdio: 'ignore'
    });

    // Add platforms
    for (const platform of config.platforms) {
      if (platform !== 'web') {
        execSync(`npx cap add ${platform}`, {
          cwd: projectPath,
          stdio: 'ignore'
        });
      }
    }

    spinner.succeed('Capacitor initialized');

    // Success message
    console.log(chalk.green('\n✅ Your BuildKit UI app is ready!\n'));
    console.log(chalk.white('To get started:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  ${pm === 'yarn' ? 'yarn' : pm === 'pnpm' ? 'pnpm' : 'npm run'} start`));
    console.log(chalk.white('\nOther available commands:'));
    console.log(chalk.gray('  • npm run build     - Build for production'));
    console.log(chalk.gray('  • npm run build:ios - Build and sync iOS'));
    console.log(chalk.gray('  • npm run build:android - Build and sync Android'));
    console.log(chalk.gray('  • npm run open:ios  - Open in Xcode'));
    console.log(chalk.gray('  • npm run open:android - Open in Android Studio'));
    console.log(chalk.white('\nHappy coding! 🎉\n'));

  } catch (error) {
    spinner.fail('Setup failed');
    console.error(chalk.red('\nError:'), error.message);
    
    // Cleanup on failure
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    
    process.exit(1);
  }
}

async function createConfigFiles(projectPath, config) {
  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      baseUrl: '.',
      paths: {
        '@/*': ['src/*']
      }
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  };

  fs.writeFileSync(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Create vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});`;

  fs.writeFileSync(path.join(projectPath, 'vite.config.ts'), viteConfig);

  // Create Tailwind config if selected
  if (config.tailwind) {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/buildkit-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};`;

    fs.writeFileSync(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);

    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

    fs.writeFileSync(path.join(projectPath, 'postcss.config.js'), postcssConfig);
  }

  // Create .gitignore
  const gitignore = `# Dependencies
node_modules
.pnp
.pnp.js

# Production
dist
build

# Capacitor
ios/App/Pods
android/.gradle
android/app/build
android/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea
.vscode
*.swp
*.swo`;

  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
}

async function createSourceFiles(projectPath, config) {
  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BuildKit UI App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);

  // Create main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${config.tailwind ? "import './index.css';" : ''}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`;

  fs.writeFileSync(path.join(projectPath, 'src/main.tsx'), mainTsx);

  // Create index.css if Tailwind is selected
  if (config.tailwind) {
    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    fs.writeFileSync(path.join(projectPath, 'src/index.css'), indexCss);
  }

  // Create App.tsx based on template
  const appContent = await generateAppContent(config);
  fs.writeFileSync(path.join(projectPath, 'src/App.tsx'), appContent);

  // Create BuildKit config
  const buildkitConfig = await generateBuildKitConfig(config);
  fs.writeFileSync(path.join(projectPath, 'src/config/buildkit.ts'), buildkitConfig);
}

function generateAppContent(config) {
  const imports = [
    "import React from 'react';",
    "import { BuildKitProvider } from 'buildkit-ui';",
    "import { buildKitConfig } from './config/buildkit';",
  ];

  if (config.template === 'basic') {
    imports.push("import { Button, Input } from 'buildkit-ui';");
  }

  const appContent = `${imports.join('\n')}

function App() {
  return (
    <BuildKitProvider config={buildKitConfig}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome to BuildKit UI
          </h1>
          
          ${config.template === 'basic' ? `
          <div className="space-y-4 max-w-md">
            <Input 
              label="Your Name" 
              placeholder="Enter your name"
              helperText="This input is automatically tracked"
            />
            
            <Button 
              variant="primary"
              onClick={() => alert('Button clicked!')}
            >
              Click Me
            </Button>
          </div>` : ''}
        </div>
      </div>
    </BuildKitProvider>
  );
}

export default App;`;

  return appContent;
}

function generateBuildKitConfig(config) {
  const configObj = {
    tracking: {
      autoTrack: true,
      trackUserJourney: true,
      trackPerformance: true,
      trackErrors: true,
      trackNetwork: true,
      analytics: {},
      errorTracking: {},
    },
  };

  // Add Firebase config
  if (config.features.includes('firebase')) {
    configObj.firebase = {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'YOUR_AUTH_DOMAIN',
      projectId: 'YOUR_PROJECT_ID',
      storageBucket: 'YOUR_STORAGE_BUCKET',
      messagingSenderId: 'YOUR_SENDER_ID',
      appId: 'YOUR_APP_ID',
    };
    configObj.tracking.analytics.firebase = true;
    configObj.tracking.errorTracking.crashlytics = true;
  }

  // Add other analytics
  if (config.features.includes('amplitude')) {
    configObj.tracking.analytics.amplitude = {
      apiKey: 'YOUR_AMPLITUDE_API_KEY',
    };
  }

  if (config.features.includes('clarity')) {
    configObj.tracking.analytics.clarity = {
      projectId: 'YOUR_CLARITY_PROJECT_ID',
    };
  }

  if (config.features.includes('sentry')) {
    configObj.tracking.errorTracking.sentry = {
      dsn: 'YOUR_SENTRY_DSN',
      environment: 'development',
    };
  }

  // Add i18n config
  if (config.i18n) {
    configObj.i18n = {
      defaultLanguage: 'en',
      languages: ['en', 'es', 'fr'],
    };
  }

  return `import type { BuildKitConfig } from 'buildkit-ui';

export const buildKitConfig: BuildKitConfig = ${JSON.stringify(configObj, null, 2)
    .replace(/"YOUR_[^"]+"/g, match => `process.env.${match.replace(/"/g, '').replace('YOUR_', 'VITE_')}`)};`;
}

// Run the CLI
run().catch(console.error);