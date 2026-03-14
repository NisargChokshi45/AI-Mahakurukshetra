'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type PasswordInputProps = {
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function PasswordInput({
  name,
  placeholder,
  required,
  className,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        required={required}
        type={isVisible ? 'text' : 'password'}
        name={name}
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 transition duration-150 ease-in-out placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200/70 focus-visible:outline-none ${className ?? ''}`}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-2xl px-3 text-slate-500 transition hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-300/60 focus-visible:outline-none"
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
