import { UpstreamOptions } from './upstream';
import { FirewallOptions } from './firewall';
import { CORSOptions } from './cors';
import { HeadersOptions } from './headers';
import { RewriteOptions } from './rewrite';

export interface Options {
  upstream: UpstreamOptions | UpstreamOptions[];
  firewall?: FirewallOptions[];
  cors?: CORSOptions;
  rewrite?: RewriteOptions;
  headers?: HeadersOptions;
  methods?: string[],
}

export interface Route {
  pattern: string;
  options: Options;
}

export interface Proxy {
  use: (
    pattern: string,
    options: Options,
  ) => void;
  apply: (
    request: Request,
  ) => Promise<Response>;
}
