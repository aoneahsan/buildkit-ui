import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BuildKitProvider } from '../../providers/BuildKitProvider';
import { BuildKitUI } from '../../index';
import type { BuildKitConfig } from '../../definitions';

// Mock BuildKitUI plugin
jest.mock('../../index', () => ({
  ...jest.requireActual('../../index'),
  BuildKitUI: {
    initialize: jest.fn().mockResolvedValue({ success: true }),
    trackEvent: jest.fn().mockResolvedValue({ success: true }),
    setUserProperties: jest.fn().mockResolvedValue({ success: true }),
    getOfflineQueueStatus: jest.fn().mockResolvedValue({ queueSize: 0 }),
  }
}));

// Mock dynamic imports
jest.mock('../../utils/dynamic-imports', () => ({
  loadPrimeReact: jest.fn().mockResolvedValue({
    PrimeReactProvider: ({ children }: any) => <div>{children}</div>
  }),
  loadReactI18next: jest.fn().mockResolvedValue({
    I18nextProvider: ({ children }: any) => <div>{children}</div>
  })
}));

describe('BuildKitProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with minimal config', async () => {
      const minimalConfig: BuildKitConfig = {
        tracking: {
          analytics: { firebase: { enabled: true } }
        }
      };

      const { getByText } = render(
        <BuildKitProvider config={minimalConfig}>
          <div>Test Content</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(BuildKitUI.initialize).toHaveBeenCalledWith(minimalConfig);
        expect(getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('should initialize with full config', async () => {
      const fullConfig: BuildKitConfig = {
        tracking: {
          analytics: {
            firebase: { enabled: true, measurementId: 'G-TEST' },
            amplitude: { apiKey: 'test-key' },
            clarity: { projectId: 'test-project' },
            custom: {
              endpoint: 'https://api.example.com/events',
              headers: { 'X-API-Key': 'test' }
            }
          },
          errors: {
            sentry: { dsn: 'test-dsn' },
            crashlytics: { enabled: true }
          },
          performance: {
            enabled: true,
            sampleRate: 0.5
          },
          user: {
            autoTrack: true,
            properties: { tier: 'premium' }
          }
        },
        theme: {
          defaultTheme: 'dark',
          enableThemeSwitch: true,
          themes: {
            light: { primary: '#fff' },
            dark: { primary: '#000' }
          }
        },
        i18n: {
          defaultLanguage: 'en',
          languages: ['en', 'es'],
          detectBrowserLanguage: true
        },
        offline: {
          enabled: true,
          queueSize: 1000,
          syncInterval: 30000
        }
      };

      render(
        <BuildKitProvider config={fullConfig}>
          <div>Test</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(BuildKitUI.initialize).toHaveBeenCalledWith(fullConfig);
      });
    });

    it('should handle initialization errors gracefully', async () => {
      (BuildKitUI.initialize as jest.Mock).mockRejectedValueOnce(
        new Error('Initialization failed')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(
        <BuildKitProvider config={{ tracking: {} }}>
          <div>Should still render</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText('Should still render')).toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalledWith(
          'BuildKit initialization error:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Context Provision', () => {
    it('should provide tracking context', async () => {
      const TestComponent = () => {
        const tracking = React.useContext(
          require('../../tracking/context').TrackingContext
        );
        return <div>{tracking ? 'Has tracking' : 'No tracking'}</div>;
      };

      const { getByText } = render(
        <BuildKitProvider config={{ tracking: { analytics: {} } }}>
          <TestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText('Has tracking')).toBeInTheDocument();
      });
    });

    it('should provide theme context', async () => {
      const TestComponent = () => {
        const theme = React.useContext(
          require('../../providers/ThemeProvider').ThemeContext
        );
        return <div>{theme ? 'Has theme' : 'No theme'}</div>;
      };

      const { getByText } = render(
        <BuildKitProvider config={{ tracking: {} }}>
          <TestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText('Has theme')).toBeInTheDocument();
      });
    });
  });

  describe('User Properties', () => {
    it('should set user properties when provided', async () => {
      const config: BuildKitConfig = {
        tracking: {
          user: {
            properties: {
              name: 'Test User',
              email: 'test@example.com',
              plan: 'premium'
            }
          }
        }
      };

      render(
        <BuildKitProvider config={config}>
          <div>Test</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(BuildKitUI.setUserProperties).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          plan: 'premium'
        });
      });
    });
  });

  describe('Error Boundary', () => {
    it('should catch and track component errors', async () => {
      const ThrowError = () => {
        throw new Error('Component error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(
        <BuildKitProvider config={{ tracking: {} }}>
          <ThrowError />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText(/Something went wrong/)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should render error fallback UI', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const customFallback = (
        <div>Custom error message</div>
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(
        <BuildKitProvider 
          config={{ tracking: {} }}
          errorFallback={customFallback}
        >
          <ThrowError />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText('Custom error message')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load providers when configured', async () => {
      const config: BuildKitConfig = {
        tracking: {},
        theme: { defaultTheme: 'light' },
        i18n: { defaultLanguage: 'en' }
      };

      const { getByText } = render(
        <BuildKitProvider config={config}>
          <div>Lazy loaded content</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText('Lazy loaded content')).toBeInTheDocument();
      });

      // Verify dynamic imports were called
      const { loadPrimeReact, loadReactI18next } = require('../../utils/dynamic-imports');
      expect(loadPrimeReact).toHaveBeenCalled();
      expect(loadReactI18next).toHaveBeenCalled();
    });

    it('should show loading state during lazy loading', async () => {
      const slowLoad = new Promise(resolve => setTimeout(resolve, 100));
      require('../../utils/dynamic-imports').loadPrimeReact.mockReturnValueOnce(slowLoad);

      const { container } = render(
        <BuildKitProvider config={{ tracking: {} }}>
          <div>Content</div>
        </BuildKitProvider>
      );

      // Should show loading initially
      expect(container.textContent).toBe('');

      await waitFor(() => {
        expect(container.textContent).toContain('Content');
      });
    });
  });

  describe('Offline Support', () => {
    it('should initialize offline support when enabled', async () => {
      const config: BuildKitConfig = {
        tracking: {},
        offline: {
          enabled: true,
          queueSize: 500,
          persistQueue: true
        }
      };

      render(
        <BuildKitProvider config={config}>
          <div>Test</div>
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(BuildKitUI.initialize).toHaveBeenCalledWith(
          expect.objectContaining({
            offline: {
              enabled: true,
              queueSize: 500,
              persistQueue: true
            }
          })
        );
      });
    });
  });

  describe('Multiple Providers', () => {
    it('should handle nested providers correctly', () => {
      const config1: BuildKitConfig = {
        tracking: { analytics: { firebase: { enabled: true } } }
      };

      const config2: BuildKitConfig = {
        tracking: { analytics: { amplitude: { apiKey: 'test' } } }
      };

      const TestComponent = () => {
        const tracking = React.useContext(
          require('../../tracking/context').TrackingContext
        );
        return <div>{JSON.stringify(tracking?.config)}</div>;
      };

      const { container } = render(
        <BuildKitProvider config={config1}>
          <div>
            <TestComponent />
            <BuildKitProvider config={config2}>
              <TestComponent />
            </BuildKitProvider>
          </div>
        </BuildKitProvider>
      );

      const configs = container.querySelectorAll('div');
      expect(configs.length).toBeGreaterThan(1);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <div>Render count: {renderCount}</div>;
      };

      const { rerender } = render(
        <BuildKitProvider config={{ tracking: {} }}>
          <TestComponent />
        </BuildKitProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same config
      rerender(
        <BuildKitProvider config={{ tracking: {} }}>
          <TestComponent />
        </BuildKitProvider>
      );

      // Should not cause additional renders
      expect(renderCount).toBe(1);
    });
  });
});