import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'th'],
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Redirect to default locale when no locale is detected
  localeDetection: true,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(th|en)/:path*']
};