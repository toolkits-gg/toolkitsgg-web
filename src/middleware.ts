import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { allGameConfigs } from '@/features/game/constants';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { hostname } = url;

  const mainDomain = 'toolkits.gg';

  // This will redirect subdomains to their respective game paths
  // e.g. game1.toolkits.gg -> toolkits.gg/game1
  if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
    const allowedSubdomains = allGameConfigs.map(
      (gameConfig) => gameConfig.path
    );
    const subdomain = hostname.replace(`.${mainDomain}`, '');

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
