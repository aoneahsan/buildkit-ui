import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Input } from '../../components/Input';
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

describe('Input Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render basic text input', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" placeholder="Enter text" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter text');
    });

    it('should render with label', () => {
      const { getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" label="Test Label" />
        </BuildKitProvider>
      );

      expect(getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('should render different input types', () => {
      const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const;

      types.forEach(type => {
        const { container } = render(
          <BuildKitProvider config={mockConfig}>
            <Input name={`test-${type}`} type={type} />
          </BuildKitProvider>
        );

        const input = container.querySelector(`input[type="${type}"]`);
        expect(input).toBeInTheDocument();
      });
    });

    it('should render as textarea when multiline', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" multiline rows={5} />
        </BuildKitProvider>
      );

      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should show helper text', () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" helperText="This is helper text" />
        </BuildKitProvider>
      );

      expect(getByText('This is helper text')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" label="Required Field" required />
        </BuildKitProvider>
      );

      expect(getByText('*')).toBeInTheDocument();
    });
  });

  describe('Value Management', () => {
    it('should handle controlled value', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" value="controlled value" onChange={() => {}} />
        </BuildKitProvider>
      );

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('controlled value');
    });

    it('should handle uncontrolled value with defaultValue', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" defaultValue="default value" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('default value');
    });

    it('should call onChange handler', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" onChange={onChange} />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        target: expect.objectContaining({
          value: 'new value'
        })
      }));
    });
  });

  describe('Validation', () => {
    it('should validate required field', async () => {
      const { getByRole, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <form>
            <Input name="test" required />
            <button type="submit">Submit</button>
          </form>
        </BuildKitProvider>
      );

      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const input = getByRole('textbox');
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should validate pattern', async () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input 
            name="test" 
            type="email"
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
            name: 'test',
            errorType: 'pattern'
          })
        });
      });
    });

    it('should validate min/max length', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input 
            name="test" 
            validation={{
              minLength: 5,
              maxLength: 10
            }}
          />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should validate min/max for number input', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input 
            name="test" 
            type="number"
            validation={{
              min: 0,
              max: 100
            }}
          />
        </BuildKitProvider>
      );

      const input = getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should show error message', () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" error errorMessage="This field has an error" />
        </BuildKitProvider>
      );

      expect(getByText('This field has an error')).toBeInTheDocument();
    });
  });

  describe('Tracking', () => {
    it('should track input changes with debouncing', async () => {
      jest.useFakeTimers();
      
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });

      // Advance timers past debounce delay
      jest.advanceTimersByTime(600);

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'input_change',
          componentType: 'Input',
          parameters: expect.objectContaining({
            name: 'test',
            value: 'test value',
            timestamp: expect.any(Number)
          })
        });
      });

      jest.useRealTimers();
    });

    it('should track focus events', async () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'input_focus',
          componentType: 'Input',
          parameters: expect.objectContaining({
            name: 'test',
            timestamp: expect.any(Number)
          })
        });
      });
    });

    it('should track blur events', async () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'input_blur',
          componentType: 'Input',
          parameters: expect.objectContaining({
            name: 'test',
            timestamp: expect.any(Number)
          })
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input 
            name="test" 
            label="Accessible Input"
            required
            error
            errorMessage="Error message"
            aria-describedby="custom-description"
          />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should associate label with input', () => {
      const { getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" label="Test Input" />
        </BuildKitProvider>
      );

      const input = getByLabelText('Test Input');
      expect(input).toBeInTheDocument();
    });

    it('should handle disabled state', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" disabled />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should handle readonly state', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" readOnly value="readonly value" />
        </BuildKitProvider>
      );

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Special Features', () => {
    it('should mask password input', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="password" type="password" />
        </BuildKitProvider>
      );

      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should handle number input with step', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" type="number" step={0.1} />
        </BuildKitProvider>
      );

      const input = getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.1');
    });

    it('should handle input with icon', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" icon="pi pi-user" />
        </BuildKitProvider>
      );

      const icon = container.querySelector('.pi-user');
      expect(icon).toBeInTheDocument();
    });

    it('should handle input with prefix and suffix', () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Input name="test" prefix="$" suffix=".00" />
        </BuildKitProvider>
      );

      expect(getByText('$')).toBeInTheDocument();
      expect(getByText('.00')).toBeInTheDocument();
    });
  });
});