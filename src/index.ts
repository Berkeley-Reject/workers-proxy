import { useFirewall } from './firewall';
import { useHeaders } from './headers';
import { useLoadBalancing } from './load-balancing';
import { useUpstream } from './upstream';
import { useCORS } from './cors';
import { useRewrite } from './rewrite';

import { createResponse, getHostname } from './utils';
import { usePipeline } from './middleware';

import { Proxy, Options, Route } from '../types/proxy';
import { Context } from '../types/middleware';

const filter = (
  request: Request,
  routes: Route[],
): Options | null => {
  const url = new URL(request.url);
  for (const { pattern, options } of routes) {
    if (
      options.methods === undefined
      || options.methods.includes(request.method)
    ) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}`);
      if (regex.test(url.pathname)) {
        return options;
      }
    }
  }
  return null;
};

export default function useProxy(
  globalOptions?: Partial<Options>,
): Proxy {
  const pipeline = usePipeline(
    useFirewall,
    useLoadBalancing,
    useHeaders,
    useCORS,
    useRewrite,
    useUpstream,
  );

  const routes: Route[] = [];
  const use = (
    pattern: string,
    options: Options,
  ) => {
    routes.push({
      pattern,
      options: {
        ...globalOptions,
        ...options,
      },
    });
  };

  const apply = async (
    request: Request,
  ): Promise<Response> => {
    const options = filter(request, routes);
    if (options === null) {
      return createResponse('Failed to find a route that matches the path and method of the current request', 500);
    }

    const context: Context = {
      request,
      options,
      hostname: getHostname(request),
      response: new Response('Unhandled response'),
      upstream: null,
    };

    try {
      await pipeline.execute(context);
    } catch (error) {
      context.response = createResponse(error, 500);
    }
    return context.response;
  };

  return {
    use,
    apply,
  };
}
