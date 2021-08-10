import { Middleware } from '../types/middleware';

const ipToNum = (
  ip: string,
) :number => ip.split('.').map((octect, index, array) => parseInt(octect, 10) * (256 ** (array.length - index - 1))).reduce((accumulator, current) => accumulator + current);

export const useSelectUpstream: Middleware = (
  context,
  next,
) => {
  const { options } = context;
  const upstreamOptions = options.upstream;
  const upstream = Array.isArray(upstreamOptions) ? upstreamOptions : [upstreamOptions];
  const ipString = context.request.headers.get('cf-connecting-ip');
  if (ipString === null) {
    context.upstream = upstream[Math.floor(Math.random() * upstream.length)];
  } else {
    const userIP = ipToNum(ipString);
    context.upstream = upstream[userIP % upstream.length];
  }
  return next();
};
