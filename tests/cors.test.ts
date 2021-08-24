import { useCORS } from '../src/cors';
import { Context } from '../types/middleware';

const request = new Request(
  'https://httpbin.org/post',
  {
    headers: new Headers({
      origin: 'https://httpbin.org',
      'Access-Control-Request-Method': 'GET',
    }),
    method: 'GET',
  },
);

const response = new Response(
  'Test response body',
  {
    headers: new Headers({}),
    status: 200,
  },
);

const baseContext: Context = {
  request,
  response,
  hostname: 'https://httpbin.org',
  upstream: null,
  options: {
    upstream: {
      domain: 'httpbin.org',
    },
  },
};

describe('cors.ts -> useCORS()', () => {
  test('undefined options', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response).toBe(response);
  });

  test('Access-Control-Max-Age (Invalid)', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
          maxAge: 86400.5,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.has('Access-Control-Max-Age')).toBeFalsy();
  });

  test('Access-Control-Max-Age (Valid)', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
          maxAge: 86400,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Max-Age')).toEqual('86400');
  });

  test('Access-Control-Allow-Credentials: false', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
          credentials: false,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.has('Access-Control-Allow-Credentials')).toBeFalsy();
  });

  test('Access-Control-Allow-Credentials: true', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
          credentials: true,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Credentials')).toEqual('true');
  });

  test('Access-Control-Allow-Methods: undefined', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Methods')).toEqual('GET');
  });

  test('Access-Control-Allow-Methods: array', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
          methods: ['GET', 'POST', 'OPTIONS'],
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Methods')).toEqual('GET,POST,OPTIONS');
  });

  test('Access-Control-Allow-Methods: wildcard', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
          methods: '*',
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Methods')).toEqual('*');
  });

  test('Access-Control-Allow-Origin: true', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: true,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Origin')).toEqual('https://httpbin.org');
  });

  test('Access-Control-Allow-Origin: false', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: false,
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.has('Access-Control-Allow-Origin')).toBeFalsy();
  });

  test('Access-Control-Allow-Origin: array', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: [
            'https://httpbin.org',
            'http://example.com',
          ],
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Origin')).toEqual('https://httpbin.org');
  });

  test('Access-Control-Allow-Origin: wildcard', async () => {
    const context: Context = {
      ...baseContext,
      options: {
        upstream: {
          domain: 'httpbin.org',
        },
        cors: {
          origin: '*',
        },
      },
    };
    await useCORS(context, () => null);
    expect(context.response.headers.get('Access-Control-Allow-Origin')).toEqual('*');
  });
});
