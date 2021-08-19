import { UpstreamOptions } from './upstream';
import { FirewallOptions } from './firewall';
import { ErrorOptions } from './custom-error';
import { CORSOptions } from './cors';
import { OptimizationOptions } from './optimization';
import { HeaderOptions } from './headers';
import { SecurityOptions } from './security';
import { RewriteOptions } from './rewrite';

export interface Configuration {
  upstream: UpstreamOptions | UpstreamOptions[];
  firewall?: FirewallOptions[];
  error?: ErrorOptions[];
  cors?: CORSOptions;
  optimization?: OptimizationOptions;
  header?: HeaderOptions;
  security?: SecurityOptions;
  rewrite?: RewriteOptions;
}

export interface Pattern {
  pattern: string;
  options: Configuration;
}

export interface Proxy {
  use: (
    pattern: string,
    options: Configuration,
  ) => void;
  apply: (
    request: Request,
  ) => Promise<Response>;
}
