import { Middleware } from '../types/middleware';

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

export const useHeaders: Middleware = async (
  context,
  next,
) => {
  const { request, options } = context;
  if (options.headers === undefined) {
    await next();
    return;
  }

  const requestHeaders = new Headers(request.headers);
  setForwardedHeaders(requestHeaders);

  if (options.headers.request !== undefined) {
    for (const [key, value] of Object.entries(options.headers.request)) {
      requestHeaders.set(key, value);
    }
  }

  context.request = new Request(request.url, {
    body: request.body,
    method: request.method,
    headers: requestHeaders,
  });

  await next();

  const { response } = context;
  const responseHeaders = new Headers(response.headers);

  if (options.headers.response !== undefined) {
    for (const [key, value] of Object.entries(options.headers.response)) {
      responseHeaders.set(key, value);
    }
  }

  context.response = new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    },
  );
};
