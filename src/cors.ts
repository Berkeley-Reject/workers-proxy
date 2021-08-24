import { Middleware } from '../types/middleware';

export const useCORS: Middleware = async (
  context,
  next,
) => {
  await next();

  const { request, response, options } = context;

  const corsOptions = options.cors;
  if (corsOptions === undefined) {
    return;
  }

  const {
    origin,
    methods,
    exposedHeaders,
    allowedHeaders,
    credentials,
    maxAge,
  } = corsOptions;

  const requestOrigin = request.headers.get('origin');
  if (requestOrigin === null || origin === false) {
    return;
  }

  const corsHeaders = new Headers(
    response.headers,
  );

  if (origin === true) {
    corsHeaders.set('Access-Control-Allow-Origin', requestOrigin);
  } else if (Array.isArray(origin)) {
    if (origin.includes(requestOrigin)) {
      corsHeaders.set('Access-Control-Allow-Origin', requestOrigin);
    }
  } else if (origin === '*') {
    corsHeaders.set('Access-Control-Allow-Origin', '*');
  }

  if (Array.isArray(methods)) {
    corsHeaders.set('Access-Control-Allow-Methods', methods.join(','));
  } else if (methods === '*') {
    corsHeaders.set('Access-Control-Allow-Methods', '*');
  } else {
    const requestMethod = request.headers.get('Access-Control-Request-Method');
    if (requestMethod !== null) {
      corsHeaders.set('Access-Control-Allow-Methods', requestMethod);
    }
  }

  if (Array.isArray(exposedHeaders)) {
    corsHeaders.set('Access-Control-Expose-Headers', exposedHeaders.join(','));
  } else if (exposedHeaders === '*') {
    corsHeaders.set('Access-Control-Expose-Headers', '*');
  }

  if (Array.isArray(allowedHeaders)) {
    corsHeaders.set('Access-Control-Allow-Headers', allowedHeaders.join(','));
  } else if (allowedHeaders === '*') {
    corsHeaders.set('Access-Control-Allow-Headers', '*');
  } else {
    const requestHeaders = request.headers.get('Access-Control-Request-Headers');
    if (requestHeaders !== null) {
      corsHeaders.set('Access-Control-Allow-Headers', requestHeaders);
    }
  }

  if (credentials === true) {
    corsHeaders.set('Access-Control-Allow-Credentials', 'true');
  }

  if (maxAge !== undefined && Number.isInteger(maxAge)) {
    corsHeaders.set('Access-Control-Max-Age', maxAge.toString());
  }

  context.response = new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers: corsHeaders,
    },
  );
};
