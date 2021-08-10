export interface HeaderOptions {
  /**
   * Sets request header going upstream to the backend.
   */
  request?: {
    [key: string]: string;
  };

  /**
   * Sets response header coming downstream to the client.
   */
  response?: {
    [key: string]: string;
  };
}
