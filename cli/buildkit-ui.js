#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');

program
  .name('buildkit-ui')
  .description('BuildKit UI CLI for managing your project')
  .version('0.0.1');

// Init command
program
  .command('init')
  .description('Initialize BuildKit UI in an existing project')
  .option('--force', 'Force initialization even if already initialized')
  .action(async (options) => {
    console.log(chalk.blue('\n🚀 Initializing BuildKit UI...\n'));
    
    const spinner = ora('Checking project...').start();

    try {
      // Check if package.json exists
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        spinner.fail('No package.json found');
        console.log(chalk.red('Please run this command in a project directory'));
        process.exit(1);
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Check if already initialized
      if (packageJson.dependencies?.['buildkit-ui'] && !options.force) {
        spinner.fail('BuildKit UI is already installed');
        console.log(chalk.yellow('Use --force to reinitialize'));
        process.exit(1);
      }

      spinner.succeed('Project checked');

      // Get configuration
      const config = await prompts([
        {
          type: 'confirm',
          name: 'typescript',
          message: 'Are you using TypeScript?',
          initial: fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))
        },
        {
          type: 'multiselect',
          name: 'features',
          message: 'Select features to configure',
          choices: [
            { title: 'Firebase Analytics', value: 'firebase' },
            { title: 'Amplitude Analytics', value: 'amplitude' },
            { title: 'Microsoft Clarity', value: 'clarity' },
            { title: 'Sentry Error Tracking', value: 'sentry' },
            { title: 'Internationalization', value: 'i18n' },
            { title: 'Tailwind CSS', value: 'tailwind' },
          ]
        }
      ]);

      spinner.start('Installing BuildKit UI...');

      // Add dependencies
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies['buildkit-ui'] = '^0.0.1';

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
      if (config.features.includes('i18n')) {
        packageJson.dependencies['i18next'] = '^24.0.0';
        packageJson.dependencies['react-i18next'] = '^16.0.0';
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      spinner.succeed('Dependencies added');

      // Create config file
      spinner.start('Creating configuration...');

      const configDir = path.join(process.cwd(), 'src', 'config');
      fs.mkdirSync(configDir, { recursive: true });

      const configContent = generateConfigFile(config);
      const configPath = path.join(configDir, config.typescript ? 'buildkit.ts' : 'buildkit.js');
      fs.writeFileSync(configPath, configContent);

      spinner.succeed('Configuration created');

      // Create example component
      const exampleDir = path.join(process.cwd(), 'src', 'components');
      fs.mkdirSync(exampleDir, { recursive: true });

      const examplePath = path.join(exampleDir, config.typescript ? 'ExampleButton.tsx' : 'ExampleButton.jsx');
      fs.writeFileSync(examplePath, generateExampleComponent(config.typescript));

      console.log(chalk.green('\n✅ BuildKit UI initialized successfully!\n'));
      console.log(chalk.white('Next steps:'));
      console.log(chalk.cyan('  1. Install dependencies: npm install'));
      console.log(chalk.cyan('  2. Import BuildKitProvider in your app'));
      console.log(chalk.cyan('  3. Wrap your app with BuildKitProvider'));
      console.log(chalk.white('\nExample usage:'));
      console.log(chalk.gray(`
import { BuildKitProvider } from 'buildkit-ui';
import { buildKitConfig } from './config/buildkit';

function App() {
  return (
    <BuildKitProvider config={buildKitConfig}>
      {/* Your app content */}
    </BuildKitProvider>
  );
}
      `));

    } catch (error) {
      spinner.fail('Initialization failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Configure command
program
  .command('configure <feature>')
  .description('Configure a specific feature')
  .action(async (feature) => {
    console.log(chalk.blue(`\n⚙️  Configuring ${feature}...\n`));

    const configPath = findConfigFile();
    if (!configPath) {
      console.log(chalk.red('No BuildKit configuration file found'));
      console.log(chalk.yellow('Run "buildkit-ui init" first'));
      process.exit(1);
    }

    switch (feature) {
      case 'firebase':
        await configureFirebase(configPath);
        break;
      case 'amplitude':
        await configureAmplitude(configPath);
        break;
      case 'sentry':
        await configureSentry(configPath);
        break;
      default:
        console.log(chalk.red(`Unknown feature: ${feature}`));
        console.log(chalk.yellow('Available features: firebase, amplitude, sentry'));
        process.exit(1);
    }
  });

// Audit command
program
  .command('audit')
  .description('Audit tracking implementation')
  .option('-d, --dir <directory>', 'Directory to audit', 'src')
  .action(async (options) => {
    console.log(chalk.blue('\n🔍 Auditing tracking implementation...\n'));

    const spinner = ora('Scanning files...').start();

    try {
      const dir = path.join(process.cwd(), options.dir);
      if (!fs.existsSync(dir)) {
        spinner.fail('Directory not found');
        process.exit(1);
      }

      const files = await scanDirectory(dir);
      const report = analyzeFiles(files);

      spinner.succeed('Audit complete');

      // Display report
      console.log(chalk.white('\n📊 Tracking Audit Report\n'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.white(`Total files scanned: ${report.totalFiles}`));
      console.log(chalk.white(`Components found: ${report.componentsFound}`));
      console.log(chalk.green(`Tracked components: ${report.trackedComponents}`));
      console.log(chalk.yellow(`Untracked components: ${report.untrackedComponents}`));
      console.log(chalk.white(`Events tracked: ${report.eventsTracked}`));
      console.log(chalk.gray('─'.repeat(40)));

      if (report.untrackedComponents > 0) {
        console.log(chalk.yellow('\n⚠️  Some components are not tracked'));
        console.log(chalk.gray('Consider adding tracking to improve analytics'));
      } else {
        console.log(chalk.green('\n✅ All components are tracked!'));
      }

    } catch (error) {
      spinner.fail('Audit failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate a new component or page')
  .option('-t, --with-tracking', 'Include tracking', true)
  .option('-a, --with-aria', 'Include accessibility', true)
  .action(async (type, name, options) => {
    console.log(chalk.blue(`\n🏗️  Generating ${type}: ${name}\n`));

    const spinner = ora('Generating...').start();

    try {
      const isTypeScript = fs.existsSync(path.join(process.cwd(), 'tsconfig.json'));
      
      switch (type) {
        case 'component':
          await generateComponent(name, options, isTypeScript);
          break;
        case 'page':
          await generatePage(name, options, isTypeScript);
          break;
        default:
          spinner.fail(`Unknown type: ${type}`);
          console.log(chalk.yellow('Available types: component, page'));
          process.exit(1);
      }

      spinner.succeed(`${type} generated successfully`);
      console.log(chalk.green(`\n✅ Created ${name} ${type}`));

    } catch (error) {
      spinner.fail('Generation failed');
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();

// Helper functions

function generateConfigFile(config) {
  const imports = config.typescript
    ? "import type { BuildKitConfig } from 'buildkit-ui';"
    : "// @ts-check\n/** @type {import('buildkit-ui').BuildKitConfig} */";

  const exportStatement = config.typescript
    ? 'export const buildKitConfig: BuildKitConfig ='
    : 'export const buildKitConfig =';

  return `${imports}

${exportStatement} {
  tracking: {
    autoTrack: true,
    trackUserJourney: true,
    trackPerformance: true,
    trackErrors: true,
    trackNetwork: true,
    analytics: {
      ${config.features.includes('firebase') ? 'firebase: true,' : ''}
      ${config.features.includes('amplitude') ? "amplitude: { apiKey: process.env.VITE_AMPLITUDE_API_KEY || '' }," : ''}
      ${config.features.includes('clarity') ? "clarity: { projectId: process.env.VITE_CLARITY_PROJECT_ID || '' }," : ''}
    },
    errorTracking: {
      ${config.features.includes('sentry') ? "sentry: { dsn: process.env.VITE_SENTRY_DSN || '' }," : ''}
      ${config.features.includes('firebase') ? 'crashlytics: true,' : ''}
    },
  },
  ${config.features.includes('firebase') ? `
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || '',
  },` : ''}
  ${config.features.includes('i18n') ? `
  i18n: {
    defaultLanguage: 'en',
    languages: ['en', 'es', 'fr'],
  },` : ''}
};`;
}

function generateExampleComponent(isTypeScript) {
  const ext = isTypeScript ? '.tsx' : '.jsx';
  const typeAnnotations = isTypeScript ? ': React.FC' : '';

  return `import React from 'react';
import { Button } from 'buildkit-ui';

export const ExampleButton${typeAnnotations} = () => {
  const handleClick = () => {
    alert('Button clicked! This interaction is automatically tracked.');
  };

  return (
    <Button 
      variant="primary"
      onClick={handleClick}
      trackingMetadata={{ source: 'example' }}
    >
      Click Me
    </Button>
  );
};`;
}

function findConfigFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'src/config/buildkit.ts'),
    path.join(process.cwd(), 'src/config/buildkit.js'),
    path.join(process.cwd(), 'config/buildkit.ts'),
    path.join(process.cwd(), 'config/buildkit.js'),
  ];

  for (const configPath of possiblePaths) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }

  return null;
}

async function configureFirebase(configPath) {
  const config = await prompts([
    { type: 'text', name: 'apiKey', message: 'Firebase API Key:' },
    { type: 'text', name: 'authDomain', message: 'Firebase Auth Domain:' },
    { type: 'text', name: 'projectId', message: 'Firebase Project ID:' },
    { type: 'text', name: 'storageBucket', message: 'Firebase Storage Bucket:' },
    { type: 'text', name: 'messagingSenderId', message: 'Firebase Messaging Sender ID:' },
    { type: 'text', name: 'appId', message: 'Firebase App ID:' },
  ]);

  // Update config file
  console.log(chalk.green('\n✅ Firebase configured successfully!'));
  console.log(chalk.yellow('\nAdd these environment variables to your .env file:'));
  Object.entries(config).forEach(([key, value]) => {
    console.log(chalk.gray(`VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}=${value}`));
  });
}

async function configureAmplitude(configPath) {
  const config = await prompts([
    { type: 'text', name: 'apiKey', message: 'Amplitude API Key:' },
  ]);

  console.log(chalk.green('\n✅ Amplitude configured successfully!'));
  console.log(chalk.yellow('\nAdd this environment variable to your .env file:'));
  console.log(chalk.gray(`VITE_AMPLITUDE_API_KEY=${config.apiKey}`));
}

async function configureSentry(configPath) {
  const config = await prompts([
    { type: 'text', name: 'dsn', message: 'Sentry DSN:' },
  ]);

  console.log(chalk.green('\n✅ Sentry configured successfully!'));
  console.log(chalk.yellow('\nAdd this environment variable to your .env file:'));
  console.log(chalk.gray(`VITE_SENTRY_DSN=${config.dsn}`));
}

async function scanDirectory(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...await scanDirectory(fullPath));
    } else if (item.isFile() && /\.(jsx?|tsx?)$/.test(item.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeFiles(files) {
  const report = {
    totalFiles: files.length,
    componentsFound: 0,
    trackedComponents: 0,
    untrackedComponents: 0,
    eventsTracked: 0,
  };

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for React components
    if (/(?:function|const|class)\s+\w+.*(?:React|Component|jsx|tsx)/.test(content)) {
      report.componentsFound++;
      
      // Check if using BuildKit tracking
      if (/buildkit-ui|useTracking|withTracking|TrackedComponent/.test(content)) {
        report.trackedComponents++;
      } else {
        report.untrackedComponents++;
      }
    }

    // Count tracked events
    const eventMatches = content.match(/trackEvent|trackInteraction|trackingMetadata/g);
    if (eventMatches) {
      report.eventsTracked += eventMatches.length;
    }
  });

  return report;
}

async function generateComponent(name, options, isTypeScript) {
  const ext = isTypeScript ? '.tsx' : '.jsx';
  const componentDir = path.join(process.cwd(), 'src/components', name);
  
  fs.mkdirSync(componentDir, { recursive: true });

  const componentContent = `import React from 'react';
${options.withTracking ? "import { useTracking } from 'buildkit-ui';" : ''}
${options.withAria ? "import { useButton } from 'react-aria';" : ''}

export interface ${name}Props {
  // Add your props here
}

export const ${name}${isTypeScript ? ': React.FC<' + name + 'Props>' : ''} = (props) => {
  ${options.withTracking ? `const { trackEvent } = useTracking({
    componentType: '${name}',
  });` : ''}

  return (
    <div className="${name.toLowerCase()}">
      {/* Your component content */}
    </div>
  );
};`;

  fs.writeFileSync(path.join(componentDir, `${name}${ext}`), componentContent);
  fs.writeFileSync(path.join(componentDir, `index${isTypeScript ? '.ts' : '.js'}`), 
    `export * from './${name}';\nexport { ${name} as default } from './${name}';`);
}

async function generatePage(name, options, isTypeScript) {
  const ext = isTypeScript ? '.tsx' : '.jsx';
  const pageDir = path.join(process.cwd(), 'src/pages');
  
  fs.mkdirSync(pageDir, { recursive: true });

  const pageContent = `import React, { useEffect } from 'react';
${options.withTracking ? "import { trackPageView } from 'buildkit-ui';" : ''}

export const ${name}Page${isTypeScript ? ': React.FC' : ''} = () => {
  ${options.withTracking ? `useEffect(() => {
    trackPageView('${name}');
  }, []);` : ''}

  return (
    <div className="${name.toLowerCase()}-page">
      <h1>${name}</h1>
      {/* Your page content */}
    </div>
  );
};`;

  fs.writeFileSync(path.join(pageDir, `${name}${ext}`), pageContent);
}