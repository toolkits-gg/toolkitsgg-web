import { allGameIds } from '@/features/games/constants';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { hostname } = url;

  const mainDomain = 'toolkits.gg';

  // Dynamic subdomain handling
  if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');

    const allowedSubdomains = allGameIds;
    if (allowedSubdomains.includes(subdomain)) {
      url.hostname = mainDomain;
      url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.redirect(
      process.env.NODE_ENV === 'production'
        ? `https://${mainDomain}`
        : `http://localhost:3000`
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
