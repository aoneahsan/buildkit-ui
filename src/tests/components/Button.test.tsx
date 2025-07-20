import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '../../components/Button';
import { BuildKitProvider } from '../../providers/BuildKitProvider';
import { BuildKitUI } from '../../index';
import type { BuildKitConfig } from '../../definitions';

// Mock BuildKitUI plugin
jest.mock('../../index', () => ({
  ...jest.requireActual('../../index'),
  BuildKitUI: {
    initialize: jest.fn().mockResolvedValue({ success: true }),
    trackEvent: jest.fn().mockResolvedValue({ success: true }),
  }
}));

const mockConfig: BuildKitConfig = {
  tracking: {
    analytics: { firebase: { enabled: true } }
  }
};

describe('Button Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label', () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Click Me" />
        </BuildKitProvider>
      );

      expect(getByText('Click Me')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Button icon="pi pi-check" />
        </BuildKitProvider>
      );

      const icon = container.querySelector('.pi-check');
      expect(icon).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Test" className="custom-class" />
        </BuildKitProvider>
      );

      const button = container.querySelector('.custom-class');
      expect(button).toBeInTheDocument();
    });

    it('should render as different variants', () => {
      const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;

      variants.forEach(variant => {
        const { container } = render(
          <BuildKitProvider config={mockConfig}>
            <Button label={variant} variant={variant} />
          </BuildKitProvider>
        );

        const button = container.querySelector(`.buildkit-button-${variant}`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should render in different sizes', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach(size => {
        const { container } = render(
          <BuildKitProvider config={mockConfig}>
            <Button label={size} size={size} />
          </BuildKitProvider>
        );

        const button = container.querySelector(`.buildkit-button-${size}`);
        expect(button).toBeInTheDocument();
      });
    });

    it('should render as full width', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Full Width" fullWidth />
        </BuildKitProvider>
      );

      const button = container.querySelector('.buildkit-button-fullwidth');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const onClick = jest.fn();
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Click Me" onClick={onClick} />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Click Me'));

      expect(onClick).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'button_click',
          componentType: 'Button',
          parameters: expect.objectContaining({
            label: 'Click Me',
            timestamp: expect.any(Number)
          })
        });
      });
    });

    it('should handle double click events', async () => {
      const onDoubleClick = jest.fn();
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Double Click" onDoubleClick={onDoubleClick} />
        </BuildKitProvider>
      );

      fireEvent.doubleClick(getByText('Double Click'));

      expect(onDoubleClick).toHaveBeenCalled();
    });

    it('should respect disabled state', () => {
      const onClick = jest.fn();
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Disabled" onClick={onClick} disabled />
        </BuildKitProvider>
      );

      const button = getByText('Disabled');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
      expect(BuildKitUI.trackEvent).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      const { container, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Loading" loading />
        </BuildKitProvider>
      );

      const spinner = container.querySelector('.pi-spinner');
      expect(spinner).toBeInTheDocument();
      expect(getByText('Loading')).toBeDisabled();
    });
  });

  describe('Form Integration', () => {
    it('should work as submit button', () => {
      const onSubmit = jest.fn(e => e.preventDefault());
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <form onSubmit={onSubmit}>
            <Button type="submit" label="Submit" />
          </form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Submit'));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should work as reset button', () => {
      const onReset = jest.fn(e => e.preventDefault());
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <form onReset={onReset}>
            <Button type="reset" label="Reset" />
          </form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Reset'));
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Accessible" aria-label="Custom Label" />
        </BuildKitProvider>
      );

      const button = getByRole('button', { name: 'Custom Label' });
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const onClick = jest.fn();
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button label="Keyboard" onClick={onClick} />
        </BuildKitProvider>
      );

      const button = getByText('Keyboard');
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(onClick).toHaveBeenCalled();

      onClick.mockClear();
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Tracking', () => {
    it('should track click with custom parameters', async () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Button 
            label="Track Me" 
            trackingId="custom-button"
            data-category="navigation"
          />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Track Me'));

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'button_click',
          componentType: 'Button',
          parameters: expect.objectContaining({
            label: 'Track Me',
            trackingId: 'custom-button',
            category: 'navigation',
            timestamp: expect.any(Number)
          })
        });
      });
    });

    it('should not track when tracking is disabled', () => {
      const disabledConfig = {
        ...mockConfig,
        tracking: { enabled: false }
      };

      const { getByText } = render(
        <BuildKitProvider config={disabledConfig}>
          <Button label="No Track" />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('No Track'));
      expect(BuildKitUI.trackEvent).not.toHaveBeenCalled();
    });
  });
});