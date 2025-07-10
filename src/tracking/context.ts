import type { TrackingContext, PlatformInfo } from './types';
import { BuildKitUI } from '../index';

let trackingContext: TrackingContext | null = null;

/**
 * Initialize tracking context
 */
export async function initializeTrackingContext(): Promise<void> {
  const platformInfo = await BuildKitUI.getPlatformInfo();
  
  trackingContext = {
    sessionId: generateSessionId(),
    userId: undefined,
    userJourney: [],
    platformInfo,
    isTracking: true,
  };
}

/**
 * Get current tracking context
 */
export function getTrackingContext(): TrackingContext {
  if (!trackingContext) {
    throw new Error('Tracking context not initialized. Call initializeTrackingContext first.');
  }
  return trackingContext;
}

/**
 * Update tracking context
 */
export function updateTrackingContext(updates: Partial<TrackingContext>): void {
  if (!trackingContext) {
    throw new Error('Tracking context not initialized. Call initializeTrackingContext first.');
  }
  
  trackingContext = {
    ...trackingContext,
    ...updates,
  };
}

/**
 * Set user ID in tracking context
 */
export function setTrackingUserId(userId: string | undefined): void {
  updateTrackingContext({ userId });
}

/**
 * Enable/disable tracking
 */
export function setTrackingEnabled(enabled: boolean): void {
  updateTrackingContext({ isTracking: enabled });
}

/**
 * Add to user journey
 */
export function addToUserJourney(step: string): void {
  const context = getTrackingContext();
  context.userJourney.push(step);
  
  // Keep only last 20 steps
  if (context.userJourney.length > 20) {
    context.userJourney.shift();
  }
}

/**
 * Get user journey
 */
export function getUserJourney(): string[] {
  const context = getTrackingContext();
  return [...context.userJourney];
}

/**
 * Clear user journey
 */
export function clearUserJourney(): void {
  updateTrackingContext({ userJourney: [] });
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get platform-specific context
 */
export async function getPlatformContext(): Promise<Record<string, any>> {
  const context = getTrackingContext();
  const { platform, device, network } = context.platformInfo;

  const platformContext: Record<string, any> = {
    platform: platform,
    deviceModel: device.model,
    osVersion: device.osVersion,
    isOnline: network.isOnline,
    connectionType: network.connectionType,
  };

  // Add platform-specific context
  switch (platform) {
    case 'ios':
      platformContext.isSimulator = device.isSimulator;
      platformContext.deviceId = device.deviceId;
      break;
    case 'android':
      platformContext.manufacturer = device.manufacturer;
      platformContext.deviceId = device.deviceId;
      break;
    case 'web':
      platformContext.userAgent = navigator.userAgent;
      platformContext.screenResolution = `${window.screen.width}x${window.screen.height}`;
      platformContext.viewport = `${window.innerWidth}x${window.innerHeight}`;
      platformContext.pixelRatio = window.devicePixelRatio;
      break;
  }

  return platformContext;
}

/**
 * Get enriched event context
 */
export async function getEnrichedEventContext(): Promise<Record<string, any>> {
  const context = getTrackingContext();
  const platformContext = await getPlatformContext();

  return {
    sessionId: context.sessionId,
    userId: context.userId,
    userJourney: context.userJourney.slice(-5), // Last 5 steps
    ...platformContext,
    timestamp: Date.now(),
  };
}