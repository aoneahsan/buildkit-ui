import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BuildKitProvider, Button, Input, Form } from '../../index';
import { BuildKitUI } from '../../index';
import type { BuildKitConfig } from '../../definitions';

// Mock BuildKitUI plugin
jest.mock('../../index', () => ({
  ...jest.requireActual('../../index'),
  BuildKitUI: {
    initialize: jest.fn().mockResolvedValue({ success: true }),
    trackEvent: jest.fn().mockResolvedValue({ success: true }),
    trackError: jest.fn().mockResolvedValue({ success: true }),
    setUserProperties: jest.fn().mockResolvedValue({ success: true }),
    setUserId: jest.fn().mockResolvedValue({ success: true }),
    startTrace: jest.fn().mockResolvedValue({ traceId: 'test-trace' }),
    stopTrace: jest.fn().mockResolvedValue({ success: true }),
    logBreadcrumb: jest.fn().mockResolvedValue({ success: true }),
  }
}));

const mockConfig: BuildKitConfig = {
  tracking: {
    analytics: {
      firebase: { enabled: true },
      amplitude: { apiKey: 'test-key' },
      custom: {
        endpoint: 'https://api.example.com/events',
        headers: { 'X-API-Key': 'test' }
      }
    },
    errors: {
      sentry: { dsn: 'test-dsn' },
      crashlytics: { enabled: true }
    }
  },
  theme: {
    defaultTheme: 'light',
    enableThemeSwitch: true
  },
  i18n: {
    defaultLanguage: 'en',
    languages: ['en', 'es', 'fr']
  }
};

describe('Tracking Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Tracking', () => {
    it('should track button clicks with full context', async () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Test Button" onClick={() => {}} />
        </BuildKitProvider>
      );

      const button = getByText('Test Button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'button_click',
          componentType: 'Button',
          parameters: expect.objectContaining({
            label: 'Test Button',
            timestamp: expect.any(Number)
          })
        });
      });
    });

    it('should track input changes with debouncing', async () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" placeholder="Type here" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test input' } });

      // Wait for debounce
      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'input_change',
          componentType: 'Input',
          parameters: expect.objectContaining({
            name: 'test',
            value: 'test input',
            timestamp: expect.any(Number)
          })
        });
      }, { timeout: 600 }); // Debounce is 500ms
    });

    it('should track form submissions', async () => {
      const onSubmit = jest.fn();
      const { getByText, getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit}>
            <Input name="email" label="Email" type="email" />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      const emailInput = getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'form_submit',
          componentType: 'Form',
          parameters: expect.objectContaining({
            formData: { email: 'test@example.com' },
            timestamp: expect.any(Number)
          })
        });
      });
    });
  });

  describe('Error Tracking', () => {
    it('should track component errors', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button 
            label="Error Button" 
            onClick={() => {
              try {
                throw new Error('Button click error');
              } catch (error) {
                // Error boundary should catch this
              }
            }} 
          />
        </BuildKitProvider>
      );

      const button = getByText('Error Button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(BuildKitUI.trackError).toHaveBeenCalled();
      });
    });

    it('should track validation errors', async () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input 
            name="email" 
            type="email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'validation_error',
          componentType: 'Input',
          parameters: expect.objectContaining({
            name: 'email',
            errorType: 'pattern',
            timestamp: expect.any(Number)
          })
        });
      });
    });
  });

  describe('Performance Tracking', () => {
    it('should track component render performance', async () => {
      const { rerender } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Performance Test" />
        </BuildKitProvider>
      );

      // Re-render to trigger performance measurement
      rerender(
        <BuildKitProvider config={mockConfig}>
          <Button label="Performance Test Updated" />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(BuildKitUI.startTrace).toHaveBeenCalled();
        expect(BuildKitUI.stopTrace).toHaveBeenCalled();
      });
    });
  });

  describe('User Journey Tracking', () => {
    it('should track navigation breadcrumbs', async () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <div>
            <Button label="Page 1" onClick={() => {}} />
            <Button label="Page 2" onClick={() => {}} />
          </div>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Page 1'));
      fireEvent.click(getByText('Page 2'));

      await waitFor(() => {
        expect(BuildKitUI.logBreadcrumb).toHaveBeenCalledWith({
          type: 'navigation',
          message: expect.stringContaining('Navigated'),
          data: expect.any(Object),
          timestamp: expect.any(Number)
        });
      });
    });
  });

  describe('Offline Queue', () => {
    it('should queue events when offline', async () => {
      // Mock offline state
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Offline Button" onClick={() => {}} />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Offline Button'));

      // Event should be queued, not sent immediately
      await waitFor(() => {
        expect(BuildKitUI.trackEvent).not.toHaveBeenCalled();
      });

      // Simulate coming back online
      Object.defineProperty(window.navigator, 'onLine', {
        value: true
      });
      window.dispatchEvent(new Event('online'));

      // Events should be sent
      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalled();
      });
    });
  });
});