import { Middleware } from '../types/middleware';
import { RewriteOptions } from '../types/rewrite';

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

export const useRewrite: Middleware = async (
  context,
  next,
) => {
  const { request, options } = context;
  if (options.rewrite === undefined) {
    await next();
    return;
  }

  const url = new URL(request.url);
  url.pathname = rewritePath(
    url.pathname,
    options.rewrite,
  );

  context.request = new Request(url.href, {
    body: request.body,
    method: request.method,
    headers: request.headers,
  });

  await next();
};
