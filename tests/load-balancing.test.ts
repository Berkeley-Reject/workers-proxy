import {
  useLoadBalancing,
  ipHashHandler,
  randomHandler,
} from '../src/load-balancing';
import { UpstreamOptions } from '../types/upstream';
import { Context } from '../types/middleware';

const upstreamArray: UpstreamOptions[] = [
  {
    domain: 'javascript.info',
    protocol: 'https',
    weight: 0,
  },
  {
    domain: 'httpbin.org',
    protocol: 'https',
    weight: 1,
  },
  {
    domain: 'google.com',
    protocol: 'https',
    weight: 0,
  },
];

const request = new Request(
  'https://httpbin.org/get',
  {
    headers: new Headers({
      host: 'github.com',
      'cf-connecting-ip': '1.1.1.1',
      'user-agent': 'Mozilla/5.0',
    }),
    method: 'GET',
  },
);

test('load-balancing.ts -> useLoadBalancing()', async () => {
  const context: Context = {
    request,
    response: new Response(),
    hostname: 'https://github.com',
    upstream: null,
    options: {
      upstream: upstreamArray,
      loadBalancing: {
        policy: 'ip-hash',
      },
    },
  };

  await useLoadBalancing(context, () => null);
  if (context.upstream === null) {
    throw Error('Failed to select the upstream service.');
  }
  expect(context.upstream.domain).toEqual('httpbin.org');
});

test('load-balancing.ts -> ipHashHandler()', () => {
  const upstream = ipHashHandler(
    upstreamArray,
    request,
  );
  expect(upstream.domain).toEqual('httpbin.org');
});

test('load-balancing.ts -> randomHandler()', () => {
  const upstream = randomHandler(
    upstreamArray,
    request,
  );
  expect(upstream.domain).toBeTruthy();
});

test('load-balancing.ts ->  randomHandler() | weighted', () => {
  const upstream = randomHandler(
    upstreamArray,
    request,
  );
  expect(upstream.domain).toEqual('httpbin.org');
});
