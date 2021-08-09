import {
  setForwardedHeaders,
  useRequestHeaders,
  useResponseHeaders,
} from '../src/headers';
import { Context } from '../types/middleware';

test('headers.ts -> setForwardedHeaders()', () => {
  const request = new Request(
    'https://httpbin.org/get',
    {
      headers: new Headers({
        host: 'https://httpbin.org',
        'cf-connecting-ip': '1.1.1.1',
        'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
      }),
      method: 'GET',
    },
  );

  setForwardedHeaders(request.headers);
  expect(request.headers.get('X-Forwarded-Proto')).toEqual('https');
  expect(request.headers.get('X-Forwarded-Host')).toEqual('https://httpbin.org');
  expect(request.headers.get('X-Forwarded-For')).toEqual('127.0.0.1, 127.0.0.2');
});

test('headers.ts -> useRequestHeaders()', () => {
  const context: Context = {
    request: new Request(
      'https://httpbin.org/get',
      {
        headers: new Headers({
          'cf-connecting-ip': '1.1.1.1',
        }),
        method: 'GET',
      },
    ),
    response: new Response(),
    hostname: 'https://httpbin.org',
    upstream: null,
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      header: {
        request: {
          'X-Test': 'Test header',
          'X-Forwarded-For': 'Test override',
        },
      },
    },
  };
  useRequestHeaders(context, () => null);

  expect(context.request.headers.get('X-Test')).toEqual('Test header');
  expect(context.request.headers.get('X-Forwarded-For')).toEqual('Test override');
});

test('headers.ts -> useSecurityHeaders()', () => {
  const context: Context = {
    response: new Response(
      'https://httpbin.org/get',
      {
        headers: new Headers({
          'X-Powered-By': 'Express',
        }),
      },
    ),
    request: new Request('https://httpbin.org'),
    hostname: 'httpbin.org',
    upstream: null,
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      security: {
        noSniff: true,
        xssFilter: true,
        hidePoweredBy: true,
        ieNoOpen: true,
        forwarded: true,
      },
    },
  };
  useResponseHeaders(context, () => null);

  expect(context.response.headers.has('X-Powered-By')).toEqual(false);
  expect(context.response.headers.get('X-XSS-Protection')).toEqual('0');
  expect(context.response.headers.get('X-Content-Type-Options')).toEqual('nosniff');
  expect(context.response.headers.get('X-Download-Options')).toEqual('noopen');
});

test('headers.ts -> useRewriteHeaders()', () => {
  const context: Context = {
    response: new Response(
      'https://httpbin.org',
      {
        headers: new Headers({
          'x-pjax-url': 'https://upstream.httpbin.org/pjax',
          location: 'https://upstream.httpbin.org/redirect',
          'Set-Cookie': 'cookie_1=test; domain=<domain-value>; secure; samesite=strict; cookie_2=test; domain=<domain-value>; secure; httpOnly;',
        }),
      },
    ),
    request: new Request('https://upstream.httpbin.org'),
    hostname: 'httpbin.org',
    upstream: {
      domain: 'upstream.httpbin.org',
    },
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      header: {
        rewrite: {
          pjax: true,
          location: true,
          cookie: true,
        },
      },
    },
  };
  useResponseHeaders(context, () => null);

  const cookie = 'cookie_1=test;domain=httpbin.org;secure;samesite=strict;cookie_2=test;domain=httpbin.org;secure;httpOnly;';
  expect(context.response.headers.get('set-cookie')).toEqual(cookie);
  expect(context.response.headers.get('x-pjax-url')).toEqual('https://httpbin.org/pjax');
  expect(context.response.headers.get('location')).toEqual('https://httpbin.org/redirect');
});
