// Dynamic import wrappers for heavy dependencies
// This helps reduce initial bundle size by loading dependencies only when needed

export interface DynamicImports {
  amplitude?: typeof import('@amplitude/analytics-browser');
  clarity?: typeof import('@microsoft/clarity');
  sentry?: typeof import('@sentry/react');
  primereact?: typeof import('primereact/api');
  i18next?: typeof import('i18next');
  reactI18next?: typeof import('react-i18next');
}

const imports: DynamicImports = {};

export const loadAmplitude = async () => {
  if (!imports.amplitude) {
    imports.amplitude = await import('@amplitude/analytics-browser');
  }
  return imports.amplitude;
};

export const loadClarity = async () => {
  if (!imports.clarity) {
    imports.clarity = await import('@microsoft/clarity');
  }
  return imports.clarity;
};

export const loadSentry = async () => {
  if (!imports.sentry) {
    imports.sentry = await import('@sentry/react');
  }
  return imports.sentry;
};

export const loadPrimeReact = async () => {
  if (!imports.primereact) {
    imports.primereact = await import('primereact/api');
  }
  return imports.primereact;
};

export const loadI18next = async () => {
  if (!imports.i18next) {
    imports.i18next = await import('i18next');
  }
  return imports.i18next;
};

export const loadReactI18next = async () => {
  if (!imports.reactI18next) {
    imports.reactI18next = await import('react-i18next');
  }
  return imports.reactI18next;
};

// Preload critical dependencies
export const preloadCriticalDependencies = () => {
  // These will be loaded in the background
  loadPrimeReact().catch(() => {});
  loadI18next().catch(() => {});
};