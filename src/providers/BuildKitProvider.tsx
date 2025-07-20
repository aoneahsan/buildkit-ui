import React, { ReactNode, useEffect, useState, Suspense, lazy } from 'react';
import type { i18n as I18n } from 'i18next';
import { BuildKitUI } from '../index';
import type { BuildKitConfig } from '../definitions';
import { TrackingProvider } from './TrackingProvider';
import { ThemeProvider } from './ThemeProvider';
import { initializeTracking, initializeWebVitals } from '../tracking';
import { loadPrimeReact, loadI18next, loadReactI18next, preloadCriticalDependencies } from '../utils/dynamic-imports';

export interface BuildKitProviderProps {
  /**
   * BuildKit configuration
   */
  config: BuildKitConfig;
  
  /**
   * Child components
   */
  children: ReactNode;
  
  /**
   * PrimeReact configuration
   */
  primeConfig?: any;
  
  /**
   * Custom i18n instance
   */
  i18nInstance?: I18n;
}

// Lazy load the providers
const LazyProviders = lazy(async () => {
  const [primeReactModule, reactI18nextModule] = await Promise.all([
    loadPrimeReact(),
    loadReactI18next()
  ]);
  
  const PrimeReactProvider = primeReactModule.PrimeReactProvider;
  const I18nextProvider = reactI18nextModule.I18nextProvider;
  
  // Return a component that uses both providers
  return {
    default: ({ children, primeConfig, i18n }: { children: ReactNode; primeConfig: any; i18n: I18n }) => (
      <PrimeReactProvider value={primeConfig || {}}>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </PrimeReactProvider>
    )
  };
});

export function BuildKitProvider({
  config,
  children,
  primeConfig,
  i18nInstance,
}: BuildKitProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [i18n, setI18n] = useState<I18n | null>(i18nInstance || null);

  useEffect(() => {
    // Preload critical dependencies in the background
    preloadCriticalDependencies();
    initializeBuildKit();
  }, []);

  const initializeBuildKit = async () => {
    try {
      // Initialize BuildKit plugin
      const result = await BuildKitUI.initialize(config);
      
      if (!result.success) {
        throw new Error('BuildKit initialization failed');
      }

      // Initialize tracking system
      initializeTracking();
      
      // Initialize web vitals for web platform
      if (typeof window !== 'undefined') {
        initializeWebVitals();
      }

      // Initialize i18n if not provided
      if (!i18nInstance && config.i18n) {
        const i18nInst = await initializeI18n(config.i18n);
        setI18n(i18nInst);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('BuildKit initialization error:', error);
      setInitError(error as Error);
      setIsInitialized(true); // Still render children
    }
  };

  const initializeI18n = async (i18nConfig: any): Promise<I18n> => {
    const [i18nextModule, reactI18nextModule] = await Promise.all([
      loadI18next(),
      loadReactI18next()
    ]);
    
    const i18n = i18nextModule.default;
    const { initReactI18next } = reactI18nextModule;
    
    await i18n
      .use(initReactI18next)
      .init({
        lng: i18nConfig.defaultLanguage,
        fallbackLng: i18nConfig.fallbackLanguage || 'en',
        debug: i18nConfig.debug || false,
        ns: i18nConfig.namespaces || ['translation'],
        defaultNS: 'translation',
        
        interpolation: {
          escapeValue: false,
        },

        resources: {}, // Will be loaded dynamically
      });

    // Load translations
    if (i18nConfig.loadPath) {
      // Load from remote
      for (const language of i18nConfig.languages) {
        try {
          const response = await fetch(
            i18nConfig.loadPath.replace('{{lng}}', language)
          );
          const translations = await response.json();
          i18n.addResourceBundle(language, 'translation', translations);
        } catch (error) {
          console.warn(`Failed to load translations for ${language}:`, error);
        }
      }
    }
    
    return i18n;
  };

  const i18nToUse = i18nInstance || i18n;

  // Show loading state while initializing
  if (!isInitialized || !i18nToUse) {
    return (
      <div className="buildkit-loading flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buildkit-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing BuildKit UI...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    console.error('BuildKit Provider Error:', initError);
  }

  return (
    <TrackingProvider config={config.tracking}>
      <ThemeProvider config={config.theme}>
        <Suspense fallback={
          <div className="buildkit-loading flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buildkit-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading UI components...</p>
            </div>
          </div>
        }>
          <LazyProviders primeConfig={primeConfig} i18n={i18nToUse}>
            {children}
          </LazyProviders>
        </Suspense>
      </ThemeProvider>
    </TrackingProvider>
  );
}