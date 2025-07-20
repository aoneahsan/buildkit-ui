import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BuildKitProvider, ThemeProvider, useTheme, Button } from '../../index';
import type { BuildKitConfig } from '../../definitions';

const mockConfig: BuildKitConfig = {
  tracking: {
    analytics: { firebase: { enabled: true } }
  },
  theme: {
    defaultTheme: 'light',
    enableThemeSwitch: true,
    themes: {
      light: {
        primary: '#0ea5e9',
        secondary: '#6b7280',
        background: '#ffffff',
        text: '#000000'
      },
      dark: {
        primary: '#38bdf8',
        secondary: '#9ca3af',
        background: '#1f2937',
        text: '#ffffff'
      }
    }
  }
};

const ThemeTestComponent = () => {
  const { theme, setTheme, isDark } = useTheme();
  
  return (
    <div data-testid="theme-test">
      <p data-testid="current-theme">{theme}</p>
      <p data-testid="is-dark">{isDark ? 'dark' : 'light'}</p>
      <Button 
        label="Toggle Theme" 
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      />
    </div>
  );
};

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset document classes
    document.documentElement.classList.remove('dark', 'light');
  });

  describe('Theme Initialization', () => {
    it('should initialize with default theme', () => {
      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <ThemeTestComponent />
        </BuildKitProvider>
      );

      expect(getByTestId('current-theme')).toHaveTextContent('light');
      expect(getByTestId('is-dark')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('should restore theme from localStorage', () => {
      localStorage.setItem('buildkit-theme', 'dark');

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <ThemeTestComponent />
        </BuildKitProvider>
      );

      expect(getByTestId('current-theme')).toHaveTextContent('dark');
      expect(getByTestId('is-dark')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should respect system preference when no saved theme', () => {
      // Mock dark mode preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <ThemeTestComponent />
        </BuildKitProvider>
      );

      expect(getByTestId('current-theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Theme Switching', () => {
    it('should switch theme when button clicked', async () => {
      const { getByText, getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <ThemeTestComponent />
        </BuildKitProvider>
      );

      const toggleButton = getByText('Toggle Theme');
      
      // Initial state
      expect(getByTestId('current-theme')).toHaveTextContent('light');
      
      // Toggle to dark
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(getByTestId('current-theme')).toHaveTextContent('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('buildkit-theme')).toBe('dark');
      });

      // Toggle back to light
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(getByTestId('current-theme')).toHaveTextContent('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(localStorage.getItem('buildkit-theme')).toBe('light');
      });
    });

    it('should apply theme-specific styles to components', () => {
      const { getByText, rerender } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Themed Button" />
        </BuildKitProvider>
      );

      const button = getByText('Themed Button');
      
      // Check light theme styles
      expect(button).toHaveClass('buildkit-button');
      
      // Switch to dark theme
      const darkConfig = { ...mockConfig, theme: { ...mockConfig.theme, defaultTheme: 'dark' } };
      
      rerender(
        <BuildKitProvider config={darkConfig}>
          <Button label="Themed Button" />
        </BuildKitProvider>
      );

      // Dark theme should be applied
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Custom Themes', () => {
    it('should support custom theme colors', () => {
      const customConfig: BuildKitConfig = {
        ...mockConfig,
        theme: {
          ...mockConfig.theme,
          themes: {
            light: {
              primary: '#ff0000',
              secondary: '#00ff00',
              background: '#ffffff',
              text: '#000000'
            }
          }
        }
      };

      render(
        <BuildKitProvider config={customConfig}>
          <Button label="Custom Theme Button" />
        </BuildKitProvider>
      );

      // Check that custom CSS variables are set
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--buildkit-primary')).toBe('#ff0000');
      expect(styles.getPropertyValue('--buildkit-secondary')).toBe('#00ff00');
    });
  });

  describe('Theme Provider Isolation', () => {
    it('should isolate theme contexts', () => {
      const { getAllByTestId } = render(
        <div>
          <BuildKitProvider config={{ ...mockConfig, theme: { ...mockConfig.theme, defaultTheme: 'light' } }}>
            <ThemeTestComponent />
          </BuildKitProvider>
          <BuildKitProvider config={{ ...mockConfig, theme: { ...mockConfig.theme, defaultTheme: 'dark' } }}>
            <ThemeTestComponent />
          </BuildKitProvider>
        </div>
      );

      const themes = getAllByTestId('current-theme');
      expect(themes[0]).toHaveTextContent('light');
      expect(themes[1]).toHaveTextContent('dark');
    });
  });

  describe('Theme Change Events', () => {
    it('should track theme changes', async () => {
      const mockTrackEvent = jest.fn();
      jest.spyOn(require('../../index').BuildKitUI, 'trackEvent').mockImplementation(mockTrackEvent);

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <ThemeTestComponent />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Toggle Theme'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith({
          eventName: 'theme_changed',
          componentType: 'ThemeProvider',
          parameters: expect.objectContaining({
            from: 'light',
            to: 'dark',
            timestamp: expect.any(Number)
          })
        });
      });
    });
  });
});