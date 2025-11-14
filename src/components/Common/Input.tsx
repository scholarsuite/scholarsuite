"use client";
import React, { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  description?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', description, ...props }, ref) => {
    return (
      <div className={`w-full ${description ? 'space-y-1' : ''}`}>
        <input
          ref={ref}
          {...props}
          className={
            `w-full px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 bg-white/20 dark:bg-white/6 border border-white/10 dark:border-white/10 backdrop-blur-md shadow-sm ${className}`
          }
        />
        {description ? (
          <p className="text-xs text-slate-500 dark:text-white/70 mt-1">{description}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
