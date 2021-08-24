import { Middleware } from '../types/middleware';
import { UpstreamOptions } from '../types/upstream';

const ipToNum = (
  ip: string,
): number => ip.split('.').map(
  (octect, index, array) => parseInt(octect, 10) * (256 ** (array.length - index - 1)),
).reduce(
  (accumulator, current) => accumulator + current,
);

const validateUpstream = (
  upstream: UpstreamOptions,
): void => {
  if (upstream.domain === undefined) {
    throw new Error('Invalid \'upstream\' field in the option object');
  }
};

export const useLoadBalancing: Middleware = async (
  context,
  next,
) => {
  const { options } = context;
  const upstreamOptions = options.upstream;
  if (upstreamOptions === undefined) {
    throw new Error('The required \'upstream\' field in the option object is missing');
  } else if (Array.isArray(upstreamOptions)) {
    upstreamOptions.forEach(validateUpstream);
  } else {
    validateUpstream(upstreamOptions);
  }

  const upstream = Array.isArray(upstreamOptions) ? upstreamOptions : [upstreamOptions];
  const ipString = context.request.headers.get('cf-connecting-ip');
  if (ipString === null) {
    context.upstream = upstream[Math.floor(Math.random() * upstream.length)];
  } else {
    const userIP = ipToNum(ipString);
    context.upstream = upstream[userIP % upstream.length];
  }

  await next();
};
