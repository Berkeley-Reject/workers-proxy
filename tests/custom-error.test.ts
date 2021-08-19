import { mocked } from 'ts-jest/utils';
import * as upstream from '../src/upstream';
import { useCustomError } from '../src/custom-error';
import { Context } from '../types/middleware';

jest.mock('../src/upstream');

test('custom-error.ts -> useCustomError()', async () => {
  const mockResponse = new Response(
    'Test error response body',
    {
      status: 200,
    },
  );
  const mockURL = 'https://httpbin.org';
  mocked(upstream).sendRequest.mockResolvedValue(mockResponse);
  mocked(upstream).getURL.mockReturnValue(mockURL);

  const context: Context = {
    request: new Request('https://httpbin.org'),
    response: new Response(
      'Test response body',
      {
        status: 400,
      },
    ),
    hostname: 'httpbin.org',
    upstream: {
      domain: 'httpbin.org',
      protocol: 'https',
    },
    options: {
      upstream: {
        domain: 'httpbin.org',
        protocol: 'https',
      },
      error: [{
        errorCode: [400, 401],
        responsePath: '/path',
        responseCode: 403,
      }],
    },
  };

  await useCustomError(context, () => null);
  await expect(context.response.text()).resolves.toEqual('Test error response body');
  expect(context.response.status).toEqual(403);
});
