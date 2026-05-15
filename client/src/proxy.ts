import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PROTECTED = ['/profile'];
const AUTH_ONLY = ['/auth/sign-in', '/auth/sign-up'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!accessToken && refreshToken) {
    try {
      const refreshResponse = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
          'User-Agent': request.headers.get('user-agent') || 'next-proxy',
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        const hasSession = true;
        let response: NextResponse;

        if (hasSession && AUTH_ONLY.some((path) => pathname.startsWith(path))) {
          console.log('AUTH_ONLY was worked');
          response = NextResponse.redirect(new URL('/', request.url));
        } else {
          response = NextResponse.next();
        }

        response.cookies.set('accessToken', data.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 60,
        });

        response.cookies.set('refreshToken', data.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
        });

        return response;
      }

      if (PROTECTED.some((p) => pathname.startsWith(p))) {
        console.log('PROTECTED was worked');
        const response = NextResponse.redirect(new URL('/auth/sign-in', request.url));
        response.cookies.delete('refreshToken');
        return response;
      }

      return NextResponse.next();
    } catch {
      return NextResponse.next();
    }
  }

  const hasSession = !!(accessToken || refreshToken);

  if (hasSession && AUTH_ONLY.some((path) => pathname.startsWith(path))) {
    console.log('AUTH_ONLY was worked');
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!hasSession && PROTECTED.some((p) => pathname.startsWith(p))) {
    console.log('PROTECTED was worked');
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
