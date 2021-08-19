export interface RewriteOptions {
  /**
   * Rewrite the `location` header for responses with
   * 3xx or 201 status if exists.
   */
  location?: boolean;

  /**
   * Rewrite the domain in `set-cookie` header for response if exists.
   */
  cookie?: boolean;

  /**
   * Rewrite the `x-pjax-url` header for response if exists.
   */
  pjax?: boolean;

  path?: Record<string, string>;
}
