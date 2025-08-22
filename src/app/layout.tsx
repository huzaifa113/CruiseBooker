import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Phoenix Vacation Group - Luxury Cruise Bookings',
  description: 'Discover and book luxury cruise vacations with Phoenix Vacation Group. Explore the world\'s most beautiful destinations aboard premium cruise ships.',
  keywords: 'cruise, vacation, luxury travel, cruise booking, Phoenix Vacation Group',
  authors: [{ name: 'Phoenix Vacation Group' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Phoenix Vacation Group - Luxury Cruise Bookings',
    description: 'Discover and book luxury cruise vacations with Phoenix Vacation Group.',
    type: 'website',
    locale: 'en_US',
  },
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}