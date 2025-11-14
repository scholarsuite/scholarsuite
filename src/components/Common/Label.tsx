"use client";
import React from 'react';

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  srOnly?: boolean;
};

const Label: React.FC<LabelProps> = ({ children, className = '', srOnly = false, ...rest }) => {
  const base = srOnly ? 'sr-only' : 'block text-sm font-medium mb-2 text-slate-700 dark:text-white/80';
  return (
    <label {...rest} className={`${base} ${className}`}>
      {children}
    </label>
  );
};

export { Label };
export default Label;
