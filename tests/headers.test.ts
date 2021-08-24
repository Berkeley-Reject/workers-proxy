import {
  setForwardedHeaders,
  useHeaders,
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

test('headers.ts -> useHeaders()', async () => {
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
      headers: {
        request: {
          'X-Test': 'Test request header',
          'X-Forwarded-For': 'Test override',
        },
        response: {
          'X-Test': 'Test response header',
        },
      },
    },
  };

  await useHeaders(context, () => null);

  expect(context.request.headers.get('X-Test')).toEqual('Test request header');
  expect(context.request.headers.get('X-Forwarded-For')).toEqual('Test override');
  expect(context.response.headers.get('X-Test')).toEqual('Test response header');
});
