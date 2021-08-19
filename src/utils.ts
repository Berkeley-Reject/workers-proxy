import { UpstreamOptions } from '../types/upstream';

export const isMobile = (userAgent: string): boolean => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => userAgent.match(toMatchItem));
};

export const createResponse = (
  body: string,
  status: number,
): Response => new Response(body, {
  status,
});

export const getHostname = (
  request: Request,
): string => {
  const url = new URL(request.url);
  return url.host;
};

export const isSameOrigin = (
  url: URL,
  upstream: UpstreamOptions,
): boolean => {
  if (url.hostname !== upstream.domain) {
    return false;
  }

  if (url.port !== '') {
    return false;
  }

  if (
    upstream.protocol === undefined
    && url.protocol !== 'https:'
  ) {
    return false;
  }

  if (
    upstream.protocol !== undefined
    && `${upstream.protocol}:` !== url.protocol
  ) {
    return false;
  }
  return true;
};
