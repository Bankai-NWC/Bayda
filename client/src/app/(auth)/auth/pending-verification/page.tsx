'use client';

import { AlertCircle, LoaderCircle, MailCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { resendVerificationAction } from '@/actions/auth-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function PendingVerificationPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    setStatus('loading');
    const result = await resendVerificationAction();

    if (result.success) {
      setStatus('sent');
      setCooldown(60);
      setTimeout(() => setStatus('idle'), 10000);
    } else {
      setStatus('error');
      setError(result.error);
    }
  }

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="absolute top-0 w-full max-w-md p-4 space-y-4 animate-in fade-in slide-in-from-top-8 duration-500">
        {status === 'sent' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <MailCheck className="h-4 w-4 stroke-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-400">Email sent!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-500">
              We&apos;ve sent a new activation link. Please check your spam folder if you don&apos;t
              see it.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="text-center space-y-6 max-w-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent an email with an activation link to your address.
          </p>
        </div>

        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
          <Button
            className="w-full h-11"
            onClick={handleResend}
            disabled={status === 'loading' || cooldown > 0}
            variant={cooldown > 0 ? 'outline' : 'default'}
          >
            {status === 'loading' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}

            {cooldown > 0 ? `Resend in ${cooldown}с` : 'Resend activation link'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your address or wait a few moments.
          </p>
        </div>
      </div>
    </div>
  );
}
