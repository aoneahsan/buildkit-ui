/**
 * Lazy loading utilities for heavy dependencies
 */

let amplitudeInstance: any = null;
let clarityInstance: any = null;
let sentryInstance: any = null;

export async function getAmplitude() {
  if (!amplitudeInstance) {
    const { createInstance } = await import('@amplitude/analytics-browser');
    amplitudeInstance = createInstance();
  }
  return amplitudeInstance;
}

export async function getClarity() {
  if (!clarityInstance) {
    const clarity = await import('@microsoft/clarity');
    clarityInstance = clarity;
  }
  return clarityInstance;
}

export async function getSentry() {
  if (!sentryInstance) {
    const Sentry = await import('@sentry/react');
    sentryInstance = Sentry;
  }
  return sentryInstance;
}

export async function getPrimeReact() {
  return import('primereact/api');
}

export async function getI18next() {
  return import('i18next');
}

export async function getReactI18next() {
  return import('react-i18next');
}