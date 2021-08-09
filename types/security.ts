export interface SecurityOptions {
  /**
   * Sets the `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` headers.
   */
   forwarded?: boolean;

  /**
   * Removes the `X-Powered-By` header, which is set by default
   * in some frameworks such as Express.
   */
   hidePoweredBy?: boolean;

   /**
    * Sets the `X-Download-Options` header, which is specific to Internet Explorer 8.
    * It forces potentially-unsafe downloads to be saved, mitigating execution of HTML
    * in your site's context.
    */
   ieNoOpen?: boolean;

   /**
    * Sets the `X-XSS-Protection` header to `0`
    * to disable browsers' buggy cross-site scripting filter.
    */
   xssFilter?: boolean;

   /**
    * Sets the `X-Content-Type-Options` header to `nosniff`.
    * This mitigates MIME type sniffing which can cause security vulnerabilities.
    */
   noSniff?: boolean;
}
