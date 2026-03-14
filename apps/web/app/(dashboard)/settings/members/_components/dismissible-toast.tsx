'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DismissibleToastProps = Readonly<{
  message: string;
  className?: string;
}>;

export function DismissibleToast({
  message,
  className,
}: DismissibleToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="rounded-full p-1 text-emerald-700 transition hover:bg-emerald-100"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
