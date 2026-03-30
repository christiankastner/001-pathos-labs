import { defineMiddleware } from 'astro:middleware';
import { ADMIN_COOKIE, ADMIN_TOKEN } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const isLoginPage  = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  const isAdminRoute = pathname === '/admin'        || pathname.startsWith('/admin/');
  const isAdminApi   = pathname.startsWith('/api/questions') || pathname.startsWith('/api/answers') || pathname.startsWith('/api/buckets');

  const isAdminRoot  = pathname === '/admin' || pathname === '/admin/';
  const authenticated = context.cookies.get(ADMIN_COOKIE)?.value === ADMIN_TOKEN;

  // Bare /admin — redirect based on auth state.
  if (isAdminRoot) {
    return context.redirect(authenticated ? '/admin/questions' : '/admin/login');
  }

  // Already logged in — skip the login form.
  if (isLoginPage && authenticated) {
    return context.redirect('/admin/questions');
  }

  // All other /admin routes and the admin API require auth.
  if ((isAdminRoute && !isLoginPage) || isAdminApi) {
    if (!authenticated) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
