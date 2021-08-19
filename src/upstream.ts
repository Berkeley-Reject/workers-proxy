import { createResponse } from './utils';
import { Middleware } from '../types/middleware';
import { UpstreamOptions } from '../types/upstream';
import { OptimizationOptions } from '../types/optimization';
import { RewriteOptions } from '../types/rewrite';

export const cloneRequest = (
  url: string,
  request: Request,
  optimization?: OptimizationOptions,
): Request => {
  const requestInit: CfRequestInit = {
    body: request.body,
    method: request.method,
    headers: request.headers,
  };

  if (optimization !== undefined) {
    requestInit.cf = {
      mirage: optimization.mirage,
      minify: optimization.minify,
    };
  }
  return new Request(url, requestInit);
};

export const rewritePath = (
  path: string,
  rewrite: RewriteOptions,
): string => {
  if (rewrite.path === undefined) {
    return path;
  }
  for (const [pattern, value] of Object.entries(rewrite.path)) {
    const regex = new RegExp(pattern);
    if (regex.test(path)) {
      return path.replace(regex, value);
    }
  }
  return path;
};

export const getURL = (
  url: string,
  upstream: UpstreamOptions,
  rewrite?: RewriteOptions,
): string => {
  const cloneURL = new URL(url);
  const {
    domain,
    port,
    protocol,
  } = upstream;

  cloneURL.hostname = domain;

  if (port !== undefined) {
    cloneURL.port = port.toString();
  }
  if (protocol !== undefined) {
    cloneURL.protocol = `${protocol}:`;
  }

  if (rewrite !== undefined) {
    cloneURL.pathname = rewritePath(
      cloneURL.pathname,
      rewrite,
    );
  }

  return cloneURL.href;
};

export const sendRequest = async (
  request: Request,
  timeout: number,
): Promise<Response> => {
  const timeoutId = setTimeout(() => {
    throw new Error('Fetch Timeout');
  }, timeout);

  const response = await fetch(request);
  clearTimeout(timeoutId);
  return response;
};

export const useUpstream: Middleware = async (
  context,
  next,
) => {
  const { request, upstream, options } = context;
  if (upstream === null) {
    return null;
  }
  const timeout = upstream.timeout || 10000;

  const { optimization, rewrite } = options;
  const url = getURL(
    request.url,
    upstream,
    rewrite,
  );

  const upstreamRequest = cloneRequest(
    url,
    request,
    optimization,
  );

  try {
    context.response = await sendRequest(
      upstreamRequest,
      timeout,
    );
    return next();
  } catch (error) {
    context.response = createResponse(
      error,
      500,
    );
    return null;
  }
};
