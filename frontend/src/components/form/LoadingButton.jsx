import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingButton = ({ loading, children, className = '', ...props }) => {
  return (
    <button
      type="button"
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
};

export default LoadingButton;
