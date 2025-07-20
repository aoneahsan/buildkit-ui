import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Form, Input, Button } from '../../components';
import { BuildKitProvider } from '../../providers/BuildKitProvider';
import { BuildKitUI } from '../../index';
import type { BuildKitConfig } from '../../definitions';

// Mock BuildKitUI plugin
jest.mock('../../index', () => ({
  ...jest.requireActual('../../index'),
  BuildKitUI: {
    initialize: jest.fn().mockResolvedValue({ success: true }),
    trackEvent: jest.fn().mockResolvedValue({ success: true }),
    trackError: jest.fn().mockResolvedValue({ success: true }),
  }
}));

const mockConfig: BuildKitConfig = {
  tracking: {
    analytics: { firebase: { enabled: true } }
  }
};

describe('Form Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with children', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Form>
            <Input name="test" label="Test Input" />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      expect(getByRole('form')).toBeInTheDocument();
      expect(getByRole('textbox')).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <BuildKitProvider config={mockConfig}>
          <Form className="custom-form">
            <Input name="test" />
          </Form>
        </BuildKitProvider>
      );

      expect(container.querySelector('.custom-form')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle form submission', async () => {
      const onSubmit = jest.fn();
      const { getByLabelText, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit}>
            <Input name="username" label="Username" />
            <Input name="email" label="Email" type="email" />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      fireEvent.change(getByLabelText('Username'), { target: { value: 'testuser' } });
      fireEvent.change(getByLabelText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com'
        });
      });

      expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
        eventName: 'form_submit',
        componentType: 'Form',
        parameters: expect.objectContaining({
          formData: {
            username: 'testuser',
            email: 'test@example.com'
          },
          timestamp: expect.any(Number)
        })
      });
    });

    it('should prevent default form submission', async () => {
      const onSubmit = jest.fn();
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Form onSubmit={onSubmit}>
              <Button type="submit" label="Submit" />
            </Form>
          </form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should handle async submission', async () => {
      const onSubmit = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit}>
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Submit'));

      // Button should be disabled during submission
      expect(getByText('Submit')).toBeDisabled();

      await waitFor(() => {
        expect(getByText('Submit')).not.toBeDisabled();
      });
    });

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      const onSubmit = jest.fn(() => Promise.reject(error));
      const onError = jest.fn();

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit} onError={onError}>
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
        expect(BuildKitUI.trackError).toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const onSubmit = jest.fn();
      const { getByText, getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit}>
            <Input name="required" label="Required Field" required />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      // Submit without filling required field
      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
        const input = getByLabelText('Required Field');
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should validate on change when specified', async () => {
      const { getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form validateOnChange>
            <Input 
              name="email" 
              label="Email" 
              type="email"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            />
          </Form>
        </BuildKitProvider>
      );

      const input = getByLabelText('Email');
      fireEvent.change(input, { target: { value: 'invalid-email' } });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should validate on blur when specified', async () => {
      const { getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form validateOnBlur>
            <Input 
              name="email" 
              label="Email" 
              type="email"
              required
            />
          </Form>
        </BuildKitProvider>
      );

      const input = getByLabelText('Email');
      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should support custom validation', async () => {
      const customValidation = (data: any) => {
        const errors: any = {};
        if (data.password !== data.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        return errors;
      };

      const onSubmit = jest.fn();
      const { getByLabelText, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit} validate={customValidation}>
            <Input name="password" label="Password" type="password" />
            <Input name="confirmPassword" label="Confirm Password" type="password" />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      fireEvent.change(getByLabelText('Password'), { target: { value: 'password123' } });
      fireEvent.change(getByLabelText('Confirm Password'), { target: { value: 'different' } });
      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
        expect(getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset form fields', () => {
      const { getByLabelText, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form>
            <Input name="field1" label="Field 1" defaultValue="initial" />
            <Input name="field2" label="Field 2" />
            <Button type="reset" label="Reset" />
          </Form>
        </BuildKitProvider>
      );

      const field1 = getByLabelText('Field 1') as HTMLInputElement;
      const field2 = getByLabelText('Field 2') as HTMLInputElement;

      fireEvent.change(field1, { target: { value: 'changed' } });
      fireEvent.change(field2, { target: { value: 'new value' } });

      fireEvent.click(getByText('Reset'));

      expect(field1.value).toBe('initial');
      expect(field2.value).toBe('');
    });

    it('should call onReset handler', () => {
      const onReset = jest.fn();
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onReset={onReset}>
            <Button type="reset" label="Reset" />
          </Form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Reset'));
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('Form State Management', () => {
    it('should track form state changes', async () => {
      const { getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form>
            <Input name="tracked" label="Tracked Field" />
          </Form>
        </BuildKitProvider>
      );

      const input = getByLabelText('Tracked Field');
      fireEvent.change(input, { target: { value: 'new value' } });

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'form_field_change',
          componentType: 'Form',
          parameters: expect.objectContaining({
            fieldName: 'tracked',
            timestamp: expect.any(Number)
          })
        });
      });
    });

    it('should handle controlled form state', () => {
      const Component = () => {
        const [values, setValues] = React.useState({ name: 'initial' });

        return (
          <BuildKitProvider config={mockConfig}>
            <Form 
              values={values}
              onChange={setValues}
            >
              <Input name="name" label="Name" />
            </Form>
          </BuildKitProvider>
        );
      };

      const { getByLabelText } = render(<Component />);
      const input = getByLabelText('Name') as HTMLInputElement;

      expect(input.value).toBe('initial');

      fireEvent.change(input, { target: { value: 'updated' } });
      expect(input.value).toBe('updated');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { getByRole } = render(
        <BuildKitProvider config={mockConfig}>
          <Form aria-label="Test Form">
            <Input name="test" label="Test" />
          </Form>
        </BuildKitProvider>
      );

      const form = getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Test Form');
    });

    it('should announce form errors', async () => {
      const { getByText, getByLabelText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form>
            <Input name="required" label="Required" required />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        const input = getByLabelText('Required');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Tracking', () => {
    it('should track form abandonment', async () => {
      const { getByLabelText, unmount } = render(
        <BuildKitProvider config={mockConfig}>
          <Form>
            <Input name="field" label="Field" />
          </Form>
        </BuildKitProvider>
      );

      // Start filling form
      fireEvent.change(getByLabelText('Field'), { target: { value: 'partial' } });

      // Unmount without submitting
      unmount();

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'form_abandoned',
          componentType: 'Form',
          parameters: expect.objectContaining({
            filledFields: ['field'],
            timestamp: expect.any(Number)
          })
        });
      });
    });

    it('should track form completion time', async () => {
      const onSubmit = jest.fn();
      const { getByLabelText, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <Form onSubmit={onSubmit}>
            <Input name="field" label="Field" />
            <Button type="submit" label="Submit" />
          </Form>
        </BuildKitProvider>
      );

      // Focus to start timing
      fireEvent.focus(getByLabelText('Field'));

      // Fill and submit
      fireEvent.change(getByLabelText('Field'), { target: { value: 'value' } });
      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(BuildKitUI.trackEvent).toHaveBeenCalledWith({
          eventName: 'form_submit',
          componentType: 'Form',
          parameters: expect.objectContaining({
            completionTime: expect.any(Number),
            timestamp: expect.any(Number)
          })
        });
      });
    });
  });
});