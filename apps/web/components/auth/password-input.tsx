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
        className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white ring-0 outline-none placeholder:text-slate-500 ${className ?? ''}`}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-2xl px-3 text-slate-400 transition hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-300/60 focus-visible:outline-none"
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
