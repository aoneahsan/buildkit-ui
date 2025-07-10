import React, { Component, ReactNode } from 'react';
import type { ComponentTrackingProps } from '../../tracking/types';
import {
  trackComponentMount,
  trackComponentUnmount,
  trackComponentRender,
  trackInteraction,
  trackError,
} from '../../tracking';
import { logInteractionBreadcrumb } from '../../tracking/errors';

export interface TrackedComponentProps extends ComponentTrackingProps {
  children?: ReactNode;
  className?: string;
}

export interface TrackedComponentState {
  hasError: boolean;
  error?: Error;
}

/**
 * Base class for all tracked components
 */
export abstract class TrackedComponent<
  P extends TrackedComponentProps = TrackedComponentProps,
  S extends TrackedComponentState = TrackedComponentState
> extends Component<P, S> {
  protected componentId: string;
  protected componentType: string;
  private renderStartTime: number = 0;

  constructor(props: P) {
    super(props);
    
    this.componentId = props.trackingId || this.generateComponentId();
    this.componentType = this.constructor.name;
    
    this.state = {
      hasError: false,
    } as S;
  }

  componentDidMount(): void {
    if (this.isTrackingEnabled()) {
      trackComponentMount(this.componentType, this.componentId, this.getTrackableProps());
    }
  }

  componentWillUnmount(): void {
    if (this.isTrackingEnabled()) {
      trackComponentUnmount(this.componentId);
    }
  }

  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>): void {
    if (this.isTrackingEnabled()) {
      trackComponentRender(this.componentId);
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ hasError: true, error } as S);
    
    if (this.isTrackingEnabled()) {
      trackError(error, this.componentType, {
        componentId: this.componentId,
        errorInfo: errorInfo.componentStack,
        props: this.getTrackableProps(),
      });
    }
  }

  render(): ReactNode {
    this.renderStartTime = performance.now();
    
    if (this.state.hasError) {
      return this.renderError();
    }

    try {
      const content = this.renderComponent();
      
      if (this.isTrackingEnabled()) {
        const renderTime = performance.now() - this.renderStartTime;
        if (renderTime > 16) { // Log slow renders
          console.warn(`Slow render detected for ${this.componentType}: ${renderTime}ms`);
        }
      }

      return content;
    } catch (error) {
      this.componentDidCatch(error as Error, { componentStack: '' });
      return this.renderError();
    }
  }

  /**
   * Override this method to render the component
   */
  protected abstract renderComponent(): ReactNode;

  /**
   * Override this method to customize error rendering
   */
  protected renderError(): ReactNode {
    return (
      <div className="buildkit-error-boundary p-4 border border-red-500 rounded bg-red-50">
        <h3 className="text-red-700 font-semibold">Something went wrong</h3>
        <p className="text-red-600 text-sm mt-1">
          {this.state.error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  /**
   * Track a user interaction
   */
  protected trackInteraction(
    type: 'click' | 'focus' | 'blur' | 'change' | 'submit' | 'hover' | 'scroll',
    target: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.isTrackingEnabled()) return;

    const interaction = {
      type,
      target,
      timestamp: Date.now(),
      metadata,
    };

    trackInteraction(interaction, this.componentType, this.componentId);
    
    // Add breadcrumb for error context
    logInteractionBreadcrumb(type, `${this.componentType}.${target}`, metadata);
  }

  /**
   * Get props that should be tracked (excluding sensitive data)
   */
  protected getTrackableProps(): Record<string, any> {
    const { children, trackingId, trackingEnabled, onTrackingEvent, ...trackableProps } = this.props;
    
    // Filter out functions and sensitive data
    const filtered: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(trackableProps)) {
      if (typeof value !== 'function' && !this.isSensitiveKey(key)) {
        filtered[key] = this.sanitizeValue(value);
      }
    }

    return filtered;
  }

  /**
   * Check if a prop key contains sensitive data
   */
  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /auth/i,
      /credential/i,
      /ssn/i,
      /credit/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(key));
  }

  /**
   * Sanitize prop values
   */
  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }

    if (Array.isArray(value)) {
      return `Array(${value.length})`;
    }

    if (typeof value === 'object') {
      return `Object(${Object.keys(value).length} keys)`;
    }

    return value;
  }

  /**
   * Check if tracking is enabled
   */
  protected isTrackingEnabled(): boolean {
    return this.props.trackingEnabled !== false;
  }

  /**
   * Generate unique component ID
   */
  private generateComponentId(): string {
    return `${this.componentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create tracked event handler
   */
  protected createTrackedHandler<T extends (...args: any[]) => any>(
    handler: T | undefined,
    eventName: string,
    extractMetadata?: (...args: Parameters<T>) => Record<string, any>
  ): T | undefined {
    if (!handler) return undefined;

    return ((...args: Parameters<T>) => {
      const startTime = performance.now();

      try {
        const result = handler(...args);

        if (this.isTrackingEnabled()) {
          const metadata = extractMetadata ? extractMetadata(...args) : {};
          this.trackInteraction('click', eventName, {
            ...metadata,
            responseTime: performance.now() - startTime,
          });
        }

        return result;
      } catch (error) {
        if (this.isTrackingEnabled()) {
          trackError(error as Error, this.componentType, {
            eventName,
            componentId: this.componentId,
          });
        }
        throw error;
      }
    }) as T;
  }
}