'use client';

import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';

import { registerAction } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

function SignUp() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, {});

  useEffect(() => {
    if (state.success) {
      router.push('/auth/pending-verification');
    }
  }, [state.success, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-12">
        <Link href="/" className="text-4xl font-bold text-center">
          BAYDA
        </Link>
        <form action={formAction}>
          <FieldSet>
            <FieldGroup>
              <FieldLegend>Sign-up</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="e-mail-79j-input">E-mail</FieldLabel>
                  <Input
                    id="e-mail-79j-input"
                    name="email"
                    placeholder="joe.dou@mail.com"
                    required
                  />
                  {state.errors?.email && <FieldError>{state.errors.email[0]}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password-79j-input">Password</FieldLabel>
                  <Input id="password-79j-input" name="password" placeholder="******" required />
                  {state.errors?.password && <FieldError>{state.errors.password[0]}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="fullName-79j-input">Full name</FieldLabel>
                  <Input id="fullName-79j-input" name="fullName" placeholder="Joe Dou" required />
                  {state.errors?.fullName && <FieldError>{state.errors.fullName[0]}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone-79j-input">Phone</FieldLabel>
                  <Input id="phone-79j-input" name="phone" placeholder="+380504518984" required />
                  {state.errors?.phone && <FieldError>{state.errors.phone[0]}</FieldError>}
                </Field>
              </FieldGroup>
              <Link href="#" className="text-right text-sm text-gray-500">
                Forgot password?
              </Link>
            </FieldGroup>
            {state.serverError && <FieldError>{state.serverError}</FieldError>}
            <Button type="submit" disabled={isPending}>
              {isPending ? <LoaderCircle className="animate-spin" color="#fff" /> : 'Sign up'}
            </Button>
          </FieldSet>
        </form>
        <p className="pt-4">
          Already have an account?{' '}
          <Link href={'/auth/sign-in'} className="text-blue-300 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
