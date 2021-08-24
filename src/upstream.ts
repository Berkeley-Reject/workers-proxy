import { Middleware } from '../types/middleware';
import { UpstreamOptions } from '../types/upstream';

export const cloneRequest = (
  url: string,
  request: Request,
): Request => {
  const requestInit: CfRequestInit = {
    body: request.body,
    method: request.method,
    headers: request.headers,
  };
  return new Request(url, requestInit);
};

export const getURL = (
  url: string,
  upstream: UpstreamOptions,
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
  const { request, upstream } = context;
  if (upstream === null) {
    await next();
    return;
  }

  const timeout = upstream.timeout || 10000;
  const url = getURL(
    request.url,
    upstream,
  );

  const upstreamRequest = cloneRequest(
    url,
    request,
  );

  context.response = await sendRequest(
    upstreamRequest,
    timeout,
  );

  await next();
};
