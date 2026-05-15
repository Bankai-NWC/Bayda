'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { apiFetch, SessionExpiredError } from '@/lib/api';
import { LoginSchema, RegisterSchema } from '@/lib/validate-schemas';
import { AuthResponse, FormState, IUser, LoginFields, RegisterFields } from '@/types/auth';

export async function registerAction(
  prevState: FormState<RegisterFields>,
  formData: FormData,
): Promise<FormState<RegisterFields>> {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const result = await apiFetch<AuthResponse>('/registration', {
      method: 'POST',
      data: validatedFields.data,
    });

    return { success: true, user: result.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration error';
    return { serverError: message };
  }
}

export async function loginAction(
  prevState: FormState<LoginFields>,
  formData: FormData,
): Promise<FormState<LoginFields>> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const result = await apiFetch<AuthResponse>('/login', {
      method: 'POST',
      data: validatedFields.data,
    });

    return { success: true, user: result.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login error';
    return { serverError: message };
  }
}

export async function logoutAction() {
  try {
    await apiFetch('/logout', { method: 'POST' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Logout error:', err);
    }
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
  }
}

export async function getProfileAction(): Promise<
  { success: true; user: IUser } | { success: false; error: string }
> {
  try {
    const user = await apiFetch<IUser>('/profile');

    if (!user) throw new Error('User not found');

    return { success: true, user };
  } catch (err) {
    if (err instanceof SessionExpiredError) {
      redirect('/auth/sign-in');
    }

    const message = err instanceof Error ? err.message : 'Unknown error';

    if (process.env.NODE_ENV === 'development') {
      console.error('getProfileAction error:', message);
    }

    return { success: false, error: message };
  }
}

export async function resendVerificationAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const token = accessToken || refreshToken;
    if (!token) throw new Error('No session');

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    await apiFetch('/resend-activation', {
      method: 'POST',
      data: { email: payload.email },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}
