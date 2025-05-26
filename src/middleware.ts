import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { hostname } = url;

  const mainDomain = 'toolkits.gg';

  // Dynamic subdomain handling
  if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
    const subdomain = hostname.replace(`.${mainDomain}`, '');

    const allowedSubdomains = ['coe33'];
    if (allowedSubdomains.includes(subdomain)) {
      url.hostname = mainDomain;
      url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
