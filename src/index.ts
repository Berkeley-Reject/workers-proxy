import { useValidate } from './validate';
import { useFirewall } from './firewall';
import { useRequestHeaders, useResponseHeaders } from './headers';
import { useSelectUpstream } from './load-balancing';
import { useWebSocket } from './websocket';
import { useUpstream } from './upstream';
import { useCustomError } from './custom-error';
import { useCORS } from './cors';

import { createResponse, getHostname } from './utils';
import { usePipeline } from './middleware';

import { Proxy, Configuration, Pattern } from '../types/proxy';
import { Context } from '../types/middleware';

const filter = (
  path: string,
  patterns: Pattern[],
): Configuration | null => {
  for (const { pattern, options } of patterns) {
    const test = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`).test(path);
    if (test === true) {
      return options;
    }
  }
  return null;
};

export default function useProxy(
  globalOptions?: Configuration,
): Proxy {
  const pipeline = usePipeline(
    useValidate,
    useFirewall,
    useRequestHeaders,
    useSelectUpstream,
    useUpstream,
    useWebSocket,
    useCustomError,
    useCORS,
    useResponseHeaders,
  );

  const routes: Pattern[] = [];
  if (globalOptions !== undefined) {
    routes.push({
      pattern: '*',
      options: globalOptions,
    });
  }

  const use = (
    pattern: string,
    options: Configuration,
  ) => {
    routes.push({
      pattern,
      options,
    });
  };

  const apply = async (
    request: Request,
  ): Promise<Response> => {
    const url = new URL(request.url);
    const options = filter(url.pathname, routes);
    if (options === null) {
      return createResponse('Failed to find a route that matches the path of the current request', 500);
    }

    const context: Context = {
      options,
      request,
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
