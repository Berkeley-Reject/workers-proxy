import { Middleware } from '../types/middleware';
import { RewriteOptions } from '../types/rewrite';
import { SecurityOptions } from '../types/security';
import { UpstreamOptions } from '../types/upstream';
import { isSameOrigin } from './utils';

export const setForwardedHeaders = (
  headers: Headers,
): void => {
  headers.set('X-Forwarded-Proto', 'https');

  const host = headers.get('Host');
  if (host !== null) {
    headers.set('X-Forwarded-Host', host);
  }

  const ip = headers.get('cf-connecting-ip');
  const forwardedForHeader = headers.get('X-Forwarded-For');
  if (ip !== null && forwardedForHeader === null) {
    headers.set('X-Forwarded-For', ip);
  }
};

export const useRequestHeaders: Middleware = (
  context,
  next,
) => {
  const { request, options } = context;

  const securityOptions = options.security;
  const headers = new Headers(request.headers);
  if (
    securityOptions !== undefined
    && securityOptions.forwarded === true
  ) {
    setForwardedHeaders(headers);
  }

  const headerOptions = options.header;
  if (
    headerOptions !== undefined
    && headerOptions.request !== undefined
  ) {
    for (const [key, value] of Object.entries(headerOptions.request)) {
      headers.set(key, value);
    }
  }

  context.request = new Request(request.url, {
    body: request.body,
    method: request.method,
    headers,
  });
  return next();
};

export const useSecurityHeaders = (
  headers: Headers,
  security: SecurityOptions | undefined,
): Headers => {
  if (security === undefined) {
    return headers;
  }

  const {
    xssFilter,
    noSniff,
    hidePoweredBy,
    ieNoOpen,
  } = security;

  if (xssFilter) {
    headers.set('X-XSS-Protection', '0');
  }

  if (noSniff) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }

  if (hidePoweredBy) {
    headers.delete('X-Powered-By');
  }

  if (ieNoOpen) {
    headers.set('X-Download-Options', 'noopen');
  }

  return headers;
};

export const useRewriteHeaders = (
  headers: Headers,
  rewrite: RewriteOptions | undefined,
  hostname: string,
  upstream: UpstreamOptions | null,
): Headers => {
  if (
    rewrite === undefined
    || upstream === null
  ) {
    return headers;
  }

  const { cookie, pjax, location } = rewrite;

  const setCookieHeader = headers.get('set-cookie');
  if (
    cookie
    && setCookieHeader !== null
  ) {
    const setCookieAttributes = setCookieHeader.split(';').map((attribute) => {
      if (attribute.toLowerCase().trim().startsWith('domain=')) {
        return `domain=${hostname}`;
      }
      return attribute.trim();
    });
    headers.set('set-cookie', setCookieAttributes.join(';'));
  }

  const pjaxHeader = headers.get('x-pjax-url');
  if (pjax && pjaxHeader !== null) {
    const pjaxUrl = new URL(pjaxHeader);
    if (isSameOrigin(pjaxUrl, upstream)) {
      pjaxUrl.hostname = hostname;
      headers.set('x-pjax-url', pjaxUrl.href);
    }
  }

  const locationHeader = headers.get('location');
  if (location && locationHeader !== null) {
    const locationUrl = new URL(locationHeader);
    if (isSameOrigin(locationUrl, upstream)) {
      locationUrl.hostname = hostname;
      headers.set('location', locationUrl.href);
    }
  }

  return headers;
};

export const useResponseHeaders: Middleware = (
  context,
  next,
) => {
  const {
    response,
    options,
    hostname,
    upstream,
  } = context;
  const headers = new Headers(response.headers);

  const securityOptions = options.security;
  const securityHeaders = useSecurityHeaders(
    headers,
    securityOptions,
  );

  const rewriteOptions = options.rewrite;
  const rewriteHeaders = useRewriteHeaders(
    securityHeaders,
    rewriteOptions,
    hostname,
    upstream,
  );

  const headerOptions = options.header;
  if (
    headerOptions !== undefined
    && headerOptions.response !== undefined
  ) {
    for (const [key, value] of Object.entries(headerOptions.response)) {
      headers.set(key, value);
    }
  }

  context.response = new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers: rewriteHeaders,
    },
  );
  return next();
};
