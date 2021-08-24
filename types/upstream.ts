export interface UpstreamOptions {
  domain: string;
  protocol?: 'http' | 'https';
  port?: number;
  timeout?: number;
  weight?: number;
}
