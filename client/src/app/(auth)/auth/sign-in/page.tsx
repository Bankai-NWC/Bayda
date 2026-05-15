'use client';

import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';

import { loginAction } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input, PasswordInput } from '@/components/ui/input';
import { useUserStore } from '@/store/useUserStore';

function SignIn() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [state, formAction, isPending] = useActionState(loginAction, {});

  useEffect(() => {
    if (state.success && state.user) {
      setUser(state.user);
      router.push('/');
    }
  }, [state.success, router, setUser, state.user]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-12">
        <Link href="/" className="text-4xl font-bold text-center">
          BAYDA
        </Link>
        <form action={formAction}>
          <FieldSet>
            <FieldGroup>
              <FieldLegend>Sign-in</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="e-mail-79j-input">E-mail</FieldLabel>
                  <Input id="e-mail-79j-input" name="email" placeholder="user@mail.com" required />
                  {state.errors?.email && <FieldError>{state.errors.email[0]}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password-79j-input">Password</FieldLabel>
                  <PasswordInput
                    id="password-79j-input"
                    name="password"
                    placeholder="···········"
                    required
                  />
                  {state.errors?.password && <FieldError>{state.errors.password[0]}</FieldError>}
                </Field>
              </FieldGroup>
              <Link href="#" className="text-right text-sm text-gray-500">
                Forgot password?
              </Link>
            </FieldGroup>
            {state.serverError && <FieldError>{state.serverError}</FieldError>}
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="animate-spin" color="#fff" /> : 'Sign in'}
            </Button>
          </FieldSet>
        </form>
        <p className="pt-4">
          Don&apos;t have an account?{' '}
          <Link href={'/auth/sign-up'} className="text-blue-300 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
