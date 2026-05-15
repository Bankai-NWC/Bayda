import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'set-cookie-parser';

export async function GET(req: NextRequest, { params }: { params: { link: string } }) {
  const { link } = await params;
  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/activate/${link}`;

  const res = await fetch(url, {
    redirect: 'manual',
    headers: {
      Cookie: req.headers.get('cookie') ?? '',
      'User-Agent': req.headers.get('user-agent') ?? 'unknown',
    },
  });

  if (res.ok || res.status === 301 || res.status === 302) {
    const cookieStore = await cookies();

    for (const cookie of parse(res.headers.getSetCookie())) {
      cookieStore.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly ?? true,
        secure: cookie.secure ?? process.env.NODE_ENV === 'production',
        path: cookie.path || '/',
        maxAge: cookie.maxAge,
        sameSite: (cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') || 'lax',
      });
    }

    const data = await res.json();
    const user = encodeURIComponent(JSON.stringify(data.user));

    return NextResponse.redirect(new URL(`/auth/verify-email?success=true&user=${user}`, req.url));
  }

  return NextResponse.redirect(new URL('/auth/verify-email?error=invalid_link', req.url));
}
