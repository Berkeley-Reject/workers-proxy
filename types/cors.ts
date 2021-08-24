export interface CORSOptions {
  /**
   * Configures the `Access-Control-Allow-Origin` CORS header. Possible values:
   * - boolean - set to `true` to reflect the request origin,
   * or set to `false` to disable CORS.
   * - string[] - an array of acceptable origins.
   * - `*` - allow any origin to access the resource
   */
  origin?: boolean | string[] | '*';

  /**
   * Configures the `Access-Control-Allow-Methods` CORS header.
   * Expects an array of valid HTTP methods or `*`.
   * If not specified, defaults to reflecting the method specified
   * in the request’s `Access-Control-Request-Method` header.
   */
  methods?: string[] | '*';

  /**
   * Configures the `Access-Control-Expose-Headers` CORS header.
   * Expects an array of HTTP headers or `*`.
   * If not specified, no custom headers are exposed.
   */
  exposedHeaders?: string[] | '*';

  /**
   * Configures the `Access-Control-Allow-Headers` CORS header.
   * Expects an array of HTTP headers or `*`.
   * If not specified, defaults to reflecting the headers specified
   * in the request’s `Access-Control-Request-Headers` header.
   */
  allowedHeaders?: string[] | '*';

  /**
   * Configures the `Access-Control-Allow-Credentials` CORS header.
   * Set to `true` to pass the header, otherwise it is omitted.
   */
  credentials?: boolean;

  /**
   * Configures the `Access-Control-Max-Age` CORS header.
   * Set to an integer to pass the header, otherwise it is omitted.
   */
  maxAge?: number;
}
