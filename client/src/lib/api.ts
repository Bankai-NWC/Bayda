import { cookies, headers as getNextHeaders } from 'next/headers';
import { parse } from 'set-cookie-parser';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export class SessionExpiredError extends Error {
  constructor() {
    super('SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

async function handleSetCookies(response: Response) {
  const setCookieHeader = response.headers.getSetCookie();
  if (setCookieHeader.length === 0) return;

  const cookieStore = await cookies();
  const splitCookies = parse(setCookieHeader);

  for (const cookie of splitCookies) {
    try {
      cookieStore.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly ?? true,
        secure: cookie.secure ?? process.env.NODE_ENV === 'production',
        path: cookie.path || '/',
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: (cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none') || 'lax',
      });
    } catch {
      console.warn(`Could not set cookie: ${cookie.name}`);
    }
  }
}

function getCookieString(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...rest } = options;
  console.log('Fetching:', `${BASE_URL}${endpoint}`);
  const cookieStore = await cookies();
  const nextHeaders = await getNextHeaders();

  const accessToken = cookieStore.get('accessToken')?.value;
  const userAgent = nextHeaders.get('user-agent') || 'next-js-server';

  const buildConfig = (token: string | undefined, cookieString: string): RequestInit => ({
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieString,
      'User-Agent': userAgent,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    buildConfig(accessToken, getCookieString(cookieStore)),
  );

  await handleSetCookies(response);

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${response.status} ${response.statusText}`, result);
    }
    throw new Error(result.message || `Request error: ${response.status}`);
  }

  return result as T;
}

export async function apiFetchMultipart<T>(endpoint: string, body: FormData): Promise<T> {
  console.log(`apiFetchMultipart: ${endpoint}`);
  const cookieStore = await cookies();
  const nextHeaders = await getNextHeaders();

  const accessToken = cookieStore.get('accessToken')?.value;
  const userAgent = nextHeaders.get('user-agent') || 'next-js-server';

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Cookie: getCookieString(cookieStore),
      'User-Agent': userAgent,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  });

  await handleSetCookies(response);

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Request error: ${response.status}`);
  }

  return result as T;
}
