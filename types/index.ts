import { UpstreamOptions } from './upstream';
import { FirewallOptions } from './firewall';
import { ErrorOptions } from './custom-error';
import { CORSOptions } from './cors';
import { OptimizationOptions } from './optimization';
import { HeaderOptions } from './headers';
import { SecurityOptions } from './security';

export interface Configuration {
  upstream: UpstreamOptions | UpstreamOptions[];
  firewall?: FirewallOptions[];
  error?: ErrorOptions[];
  cors?: CORSOptions;
  optimization?: OptimizationOptions;
  header?: HeaderOptions;
  security?: SecurityOptions;
}

export interface Proxy {
 apply: (request: Request) => Promise<Response>;
}
