'use client';

import { useEffect, useState } from 'react';

interface StatusState {
  serverError?: string;
  success?: boolean;
}

export function FormStatus({ state }: { state: StatusState & Record<string, unknown> }) {
  // export function FormStatus({ state }: { state: { serverError?: string; success?: boolean } }) {
  const [lastProcessedState, setLastProcessedState] = useState<typeof state | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  const { serverError, success } = state;

  if (
    (serverError !== lastProcessedState?.serverError || success !== lastProcessedState?.success) &&
    (success || serverError)
  ) {
    setLastProcessedState({ serverError, success });
    setIsHidden(false);
  }

  useEffect(() => {
    if ((serverError || success) && !isHidden) {
      const timer = setTimeout(() => {
        setIsHidden(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [serverError, success, isHidden]);

  if (isHidden || (!serverError && !success)) return null;

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
      {state.serverError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {state.serverError}
        </div>
      )}
      {state.success && (
        <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm font-medium border border-green-200">
          Saved successfully ✓
        </div>
      )}
    </div>
  );
}
