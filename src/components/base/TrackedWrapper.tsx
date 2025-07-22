import React from 'react';
import { TrackedComponent, TrackedComponentProps } from './TrackedComponent';

export interface TrackedWrapperProps extends TrackedComponentProps {
  componentType: string;
}

/**
 * Concrete implementation of TrackedComponent for wrapping other components
 */
export class TrackedWrapper extends TrackedComponent<TrackedWrapperProps> {
  constructor(props: TrackedWrapperProps) {
    super(props);
    this.componentType = props.componentType;
  }

  renderComponent() {
    const { children, className } = this.props;
    
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderError();
    }
    
    return this.renderComponent();
  }
}