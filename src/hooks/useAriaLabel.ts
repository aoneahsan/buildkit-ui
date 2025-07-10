import { useMemo } from 'react';

export interface UseAriaLabelOptions {
  label?: string;
  required?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export function useAriaLabel(options: UseAriaLabelOptions) {
  const {
    label,
    required,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
  } = options;

  return useMemo(() => {
    const props: Record<string, any> = {};

    if (ariaLabel) {
      props['aria-label'] = ariaLabel;
    } else if (label) {
      props['aria-label'] = label;
    }

    if (ariaLabelledBy) {
      props['aria-labelledby'] = ariaLabelledBy;
    }

    if (ariaDescribedBy) {
      props['aria-describedby'] = ariaDescribedBy;
    }

    if (required) {
      props['aria-required'] = true;
    }

    return props;
  }, [label, required, ariaLabel, ariaLabelledBy, ariaDescribedBy]);
}