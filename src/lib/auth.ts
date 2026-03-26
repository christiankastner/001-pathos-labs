export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_PASSWORD = 'aiforgood';

// Opaque token stored in the httpOnly cookie after a successful login.
// The plain-text password is only compared server-side in the login handler;
// this token is what the middleware checks on every subsequent request.
export const ADMIN_TOKEN = 'pathos_admin_authenticated_v1';
