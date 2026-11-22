import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full min-w-0">
        {label && <label className="mb-1.5 block text-sm font-medium text-surface-700">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-surface-50 disabled:text-surface-500',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {/* Added break-words to prevent overflow */}
        {error && <p className="mt-1.5 text-xs text-red-600 break-words leading-tight">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';