import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactQueryProvider } from '@/lib/react-query/react-query-provider';
import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import { Header } from '@/app/_navigation/header';
import { Toaster } from 'sonner';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Toolkits.gg',
  description:
    'A site dedicated to toolkits and quality of life features for a variety of games.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <ThemeProvider>
            <ReactQueryProvider>
              <SidebarProvider>
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  {children}
                </main>
              </SidebarProvider>
              <Toaster expand />
            </ReactQueryProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
