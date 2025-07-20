import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BuildKitProvider, Button, Input, useTranslation } from '../../index';
import type { BuildKitConfig } from '../../definitions';

const mockTranslations = {
  en: {
    translation: {
      welcome: 'Welcome',
      button: {
        submit: 'Submit',
        cancel: 'Cancel'
      },
      validation: {
        required: 'This field is required',
        email: 'Invalid email address'
      }
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido',
      button: {
        submit: 'Enviar',
        cancel: 'Cancelar'
      },
      validation: {
        required: 'Este campo es obligatorio',
        email: 'Dirección de correo inválida'
      }
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue',
      button: {
        submit: 'Soumettre',
        cancel: 'Annuler'
      },
      validation: {
        required: 'Ce champ est requis',
        email: 'Adresse e-mail invalide'
      }
    }
  }
};

const mockConfig: BuildKitConfig = {
  tracking: {
    analytics: { firebase: { enabled: true } }
  },
  i18n: {
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    languages: ['en', 'es', 'fr'],
    resources: mockTranslations,
    debug: false
  }
};

const I18nTestComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div data-testid="i18n-test">
      <p data-testid="welcome-text">{t('welcome')}</p>
      <p data-testid="current-language">{i18n.language}</p>
      <Button label={t('button.submit')} />
      <button onClick={() => i18n.changeLanguage('es')}>Spanish</button>
      <button onClick={() => i18n.changeLanguage('fr')}>French</button>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
    </div>
  );
};

describe('i18n Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  describe('Language Initialization', () => {
    it('should initialize with default language', async () => {
      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Welcome');
        expect(getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should restore language from localStorage', async () => {
      localStorage.setItem('buildkit-language', 'es');

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Bienvenido');
        expect(getByTestId('current-language')).toHaveTextContent('es');
      });
    });

    it('should detect browser language', async () => {
      // Mock browser language
      Object.defineProperty(window.navigator, 'language', {
        value: 'fr-FR',
        configurable: true
      });

      const { getByTestId } = render(
        <BuildKitProvider config={{
          ...mockConfig,
          i18n: {
            ...mockConfig.i18n,
            detectBrowserLanguage: true
          }
        }}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Bienvenue');
        expect(getByTestId('current-language')).toHaveTextContent('fr');
      });
    });
  });

  describe('Language Switching', () => {
    it('should switch languages dynamically', async () => {
      const { getByText, getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      // Initial state
      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Welcome');
      });

      // Switch to Spanish
      fireEvent.click(getByText('Spanish'));
      
      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Bienvenido');
        expect(getByTestId('current-language')).toHaveTextContent('es');
        expect(localStorage.getItem('buildkit-language')).toBe('es');
      });

      // Switch to French
      fireEvent.click(getByText('French'));
      
      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Bienvenue');
        expect(getByTestId('current-language')).toHaveTextContent('fr');
        expect(localStorage.getItem('buildkit-language')).toBe('fr');
      });

      // Switch back to English
      fireEvent.click(getByText('English'));
      
      await waitFor(() => {
        expect(getByTestId('welcome-text')).toHaveTextContent('Welcome');
        expect(getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should update component translations on language change', async () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      // Check initial button text
      await waitFor(() => {
        expect(getByText('Submit')).toBeInTheDocument();
      });

      // Switch to Spanish
      fireEvent.click(getByText('Spanish'));
      
      await waitFor(() => {
        expect(getByText('Enviar')).toBeInTheDocument();
      });
    });
  });

  describe('Translation Functions', () => {
    it('should handle nested translations', async () => {
      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByText('Submit')).toBeInTheDocument();
      });
    });

    it('should fallback to key if translation missing', async () => {
      const TestComponent = () => {
        const { t } = useTranslation();
        return <div data-testid="missing">{t('missing.key')}</div>;
      };

      const { getByTestId } = render(
        <BuildKitProvider config={mockConfig}>
          <TestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('missing')).toHaveTextContent('missing.key');
      });
    });

    it('should support interpolation', async () => {
      const configWithInterpolation = {
        ...mockConfig,
        i18n: {
          ...mockConfig.i18n,
          resources: {
            en: {
              translation: {
                greeting: 'Hello {{name}}!'
              }
            }
          }
        }
      };

      const TestComponent = () => {
        const { t } = useTranslation();
        return <div data-testid="greeting">{t('greeting', { name: 'John' })}</div>;
      };

      const { getByTestId } = render(
        <BuildKitProvider config={configWithInterpolation}>
          <TestComponent />
        </BuildKitProvider>
      );

      await waitFor(() => {
        expect(getByTestId('greeting')).toHaveTextContent('Hello John!');
      });
    });
  });

  describe('Component Translations', () => {
    it('should translate validation messages', async () => {
      const { getByRole, getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <form>
            <Input 
              name="email" 
              type="email" 
              required 
              label="Email"
            />
            <Button type="submit" label="Submit" />
          </form>
        </BuildKitProvider>
      );

      // Submit empty form
      fireEvent.click(getByText('Submit'));

      await waitFor(() => {
        expect(getByText('This field is required')).toBeInTheDocument();
      });
    });
  });

  describe('Language Change Tracking', () => {
    it('should track language changes', async () => {
      const mockTrackEvent = jest.fn();
      jest.spyOn(require('../../index').BuildKitUI, 'trackEvent').mockImplementation(mockTrackEvent);

      const { getByText } = render(
        <BuildKitProvider config={mockConfig}>
          <I18nTestComponent />
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Spanish'));

      await waitFor(() => {
        expect(mockTrackEvent).toHaveBeenCalledWith({
          eventName: 'language_changed',
          componentType: 'i18n',
          parameters: expect.objectContaining({
            from: 'en',
            to: 'es',
            timestamp: expect.any(Number)
          })
        });
      });
    });
  });

  describe('RTL Support', () => {
    it('should apply RTL for appropriate languages', async () => {
      const rtlConfig = {
        ...mockConfig,
        i18n: {
          ...mockConfig.i18n,
          languages: ['en', 'ar'],
          resources: {
            ...mockTranslations,
            ar: {
              translation: {
                welcome: 'مرحبا'
              }
            }
          }
        }
      };

      const { getByText } = render(
        <BuildKitProvider config={rtlConfig}>
          <div>
            <I18nTestComponent />
            <button onClick={() => require('i18next').default.changeLanguage('ar')}>
              Arabic
            </button>
          </div>
        </BuildKitProvider>
      );

      fireEvent.click(getByText('Arabic'));

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });
    });
  });
});