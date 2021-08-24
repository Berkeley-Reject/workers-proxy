import { UpstreamOptions } from './upstream';

export type LoadBalancingPolicy = 'random' | 'ip-hash';

export type LoadBalancingHandler = (
  upstream: UpstreamOptions[],
  request: Request,
) => UpstreamOptions;

export interface LoadBalancingOptions {
  policy?: LoadBalancingPolicy;
}
