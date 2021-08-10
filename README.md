![Header](https://raw.githubusercontent.com/booster-labs/rocket-booster/master/.github/img/header.png)

<div align="center">

[![GitHub Actions](https://img.shields.io/github/workflow/status/booster-labs/rocket-booster/Node.js%20Test%20and%20Build?style=for-the-badge&logo=github)](https://github.com/booster-labs/rocket-booster/actions)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/booster-labs/rocket-booster?style=for-the-badge&logo=codecov)](https://app.codecov.io/gh/booster-labs/rocket-booster/)
[![Package version](https://img.shields.io/npm/v/rocket-booster?style=for-the-badge&logo=npm&color=red)](https://www.npmjs.com/package/rocket-booster)
[![Bundle size](https://img.shields.io/bundlephobia/min/rocket-booster?style=for-the-badge&logo=webpack)](https://www.npmjs.com/package/rocket-booster)

[![forthebadge](https://forthebadge.com/images/badges/made-with-typescript.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/ctrl-c-ctrl-v.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)

[📦 Releases](https://github.com/booster-labs/rocket-booster/releases) |
[📔 Examples](#-examples) |
[⚙️ Configuration](#-configuration) |
[🌎 Contributing](#-contributing)
</div>

🚀 **rocket-booster** is a serverless reverse proxy and load balancing library built for [Cloudflare Workers](https://workers.cloudflare.com). It sits in front of web servers (e.g. web application, storage platform, or RESTful API), forwards HTTP requests or WebSocket traffics from clients to upstream servers and transforms responses with several optimizations to improve page loading time.

- ⚡ Serverless: Deploy instantly to the auto-scaling serverless platform built by Cloudflare. No virtual machines, servers, or containers to manage.
- ✈️ Load Balancing: Distribute incoming traffics evenly among different upstream servers.
- ⚙️ Hackable: Deliver unique content based on visitor attributes, conduct A/B testing, or build custom middleware to hook into the lifecycle. (Experimental)
- 📄 TypeScript: Extensive type declaration with TSDoc.

## 📦 Build and Deploy

### Start with templates

- [Install Wrangler CLI](https://github.com/cloudflare/wrangler#installation) and generate a project from the [rocket-booster-template](https://github.com/booster-labs/rocket-booster-template)

```sh
npm install -g @cloudflare/wrangler

# JavaScript Template
wrangler generate booster-app https://github.com/booster-labs/rocket-booster-template
```

- Install dependencies and edit the configuration in `src/index.js`

```sh
cd booster-app

npm install
```

- Login and publish to Cloudflare Workers

```sh
wrangler login

wrangler publish
```

### Integrate with existing project

- Install the `rocket-booster` package

```console
npm install --save rocket-booster
```

- Import the `useProxy` function from `rocket-booster` and invoke it with a configuration object. The function returns an object with an `apply()` method, which takes the inbound [Request](https://developers.cloudflare.com/workers/runtime-apis/request) to the Worker, and returns the [Response](https://developers.cloudflare.com/workers/runtime-apis/request) fetched from the upstream server.

```ts
import useProxy from 'rocket-booster';

const config = {
  upstream: {
    domain:  'example.com',
    protocol: 'https',
  },
};

addEventListener('fetch', (event) => {
  const proxy = useProxy(config);
  const response = proxy.apply(event.request);
  event.respondWith(response);
});
```

- Edit the configuration object to change the request and response. For example, the configuration below will add the header `Access-Control-Allow-Origin: *` to each response from the upstream server, which allows any origin to access the server.

```ts
const config = {
  upstream: {
    domain:  'example.com',
    protocol: 'https',
  },
  cors: {
    origin: '*',
  },
};
```

- Build and publish to Cloudflare Workers

```sh
wrangler build
wrangler publish
```

## 📔 Examples

### MDN Web Docs Mirror

Set up a reverse proxy for [https://developer.mozilla.org](https://developer.mozilla.org):

```ts
const config = {
  upstream: {
    domain: 'developer.mozilla.org',
    protocol: 'https',
  },
};
```

[Live Demo](https://mozilla.readme.workers.dev/)

### WebSocket Proxy

`rocket-booster` could proxy WebSocket traffic to upstream servers. No additional configuration is required. Set up a reverse proxy for [wss://echo.websocket.org](wss://echo.websocket.org):

```ts
const config = {
  upstream: {
    domain: 'echo.websocket.org',
    protocol: 'https',
  },
};
```

### S3 Bucket with custom response behavior

`rocket-booster` could set custom headers to request and response, add CORS header, or deliver custom error responses. Set up a reverse proxy for [https://example.s3.amazonaws.com](https://example.s3.amazonaws.com):

```ts
const config = {
  upstream: {
    domain: 'example.s3.amazonaws.com',
    protocol: 'https',
  },

  header: {
    response: {
      'x-response-header': 'Hello from rocket-booster',
    },
  },

  cors: {
    origin: ['https://www.example.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },

  error: [{
    errorCode: 404,
    responsePath: '/404.html',
  }],
};
```

## ⚙️ Configuration

### Upstream

- `domain`: The domain name of the upstream server.
- `protocol`: The protocol scheme of the upstream server. (optional, defaults to `'https'`)
- `port`: The port of the upstream server. (optional, defaults to `80` or `443` based on `protocol`)
- `path`: The path of the upstream server. (optional, defaults to `'\'`)
- `timeout`: The maximum wait time on a request to the upstream server. (optional, defaults to `10000`)

```ts
const config = {
  upstream: {
    domain: 'httpbin.org',
    protocol: 'https',
    port: 443,
    path: '/',
    timeout: 10000,
  },
  /* ... */
};
```

To load balance HTTP traffic to a group of servers, pass an array of server configurations to `upstream`. Each request will be forwarded to a randomly selected server. Other load balancing algorithms will be implemented in the future.

```ts
const config = {
  upstream: [
    {
      domain: 's1.example.com',
      protocol: 'https',
    },
    {
      domain: 's2.example.com',
      protocol: 'https',
    },
    {
      domain: 's3.example.com',
      protocol: 'https',
    },
  ],
  /* ... */
};
```

### Custom Headers

- `request`: Sets request header going upstream to the backend. Accepts an object. (optional, defaults to `{}`)
- `response`: Sets response header coming downstream to the client. Accepts an object. (optional, defaults to `{}`)

```ts
const config = {
  /* ... */
  header: {
    request: {
      'x-example-header': 'hello server',
    },
    response: {
      'x-example-header': 'hello client',
    },
  },
};
```

### Optimization

- `minify`: Remove unnecessary characters (like whitespace, comments, etc.) from HTML, CSS, and JavaScript files. (optional, defaults to `false`)
- `mirage`: Detect screen size and connection speed to optimally deliver images for the current browser window. (optional, defaults to `false`)

```ts
const config = {
  /* ... */
  optimization: {
    mirage: true,
    minify: {
      javascript: true,
      css: true,
      html: true,
    },
  },
};
```

Several optimizations are enabled by default.

- [Brotli](https://brotli.org/): Speed up page load times for visitor’s HTTPS traffic by applying Brotli compression.
- [HTTP/2](https://developers.google.com/web/fundamentals/performance/http2): Improve page load time by connection multiplexing, header compression, and server push.
- [HTTP/3 with QUIC](https://en.wikipedia.org/wiki/HTTP/3): Accelerate HTTP requests by using QUIC, which provides encryption and performance improvements compared to TCP and TLS.
- [0-RTT Connection Resumption](https://blog.cloudflare.com/introducing-0-rtt/): Improve performance for clients who have previously connected to the website.

### Security

- `forwarded`: Sets the `X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` headers. (optional, defaults to `false`)
- `hidePoweredBy`: Removes the `X-Powered-By` header, which is set by default in some frameworks such as Express. (optional, defaults to `false`)
- `ieNoOpen`: Sets the `X-Download-Options` header, which is specific to Internet Explorer 8. It forces potentially-unsafe downloads to be saved, mitigating execution of HTML in the website's context. (optional, defaults to `false`)
- `xssFilter`: Sets the `X-XSS-Protection` header to `0` to disable browsers' buggy cross-site scripting filter. (optional, defaults to `false`)
- `noSniff`: Sets the `X-Content-Type-Options` header to `nosniff`. This mitigates MIME type sniffing which can cause security vulnerabilities. (optional, defaults to `false`)
- `setCookie`: Sets the `Domain` attribute of the `Set-Cookie` header to the domain of the worker.

```ts
const config = {
  /* ... */
  security: {
    fowarded: true,
    hidePoweredBy: true,
    ieNoOpen: true,
    xssFilter: true,
    noSniff: true,
    setCookie: true,
  },
};
```

### Cross-Origin Resource Sharing (CORS)

- `origin`: Configures the `Access-Control-Allow-Origin` CORS header. (optional, defaults to `false`)
  - `boolean`: set to `true` to reflect the request origin, or set to `false` to disable CORS.
  - `string[]`: an array of acceptable origins.
  - `*`: allow any origin to access the resource.

- `methods`: Configures the `Access-Control-Allow-Methods` CORS header. Expects an array of valid HTTP methods or `*`. (optional, defaults to reflecting the method specified in the request’s `Access-Control-Request-Method` header)

- `allowedHeaders`: Configures the `Access-Control-Allow-Headers` CORS header. Expects an array of HTTP headers or *. (optional, defaults to reflecting the headers specified in the request’s `Access-Control-Request-Headers` header.)

- `exposedHeaders`: Configures the `Access-Control-Expose-Headers` CORS header. Expects an array of HTTP headers or `*`. (optional, defaults to `[]`)

- `credentials`: Configures the `Access-Control-Allow-Credentials` CORS header. Set to true to pass the header, otherwise it is omitted. (optional, defaults to `false`)

- `maxAge`: Configures the `Access-Control-Max-Age` CORS header. Set to an integer to pass the header, otherwise it is omitted. (optional)

```ts
const config = {
  /* ... */
  cors: {
    origin: true,
    methods: [
      'GET',
      'POST',
    ],
    allowHeaders: [
      'Example-Header',
    ],
    exposeHeaders: [
      'Example-Header',
    ],
    credentials: true,
    maxAge: 86400,
  },
};
```

### Custom Error Response

- `errorCode`: The HTTP status code to return a custom error response to the client. Excepts a valid HTTP status code or an array of valid status code.

- `responsePath`: The path and file name of the custom error page for this HTTP status code. For example: `/error-pages/403-forbidden.html`

- `responseCode`: The HTTP status code to return to the client along with the custom error page. (optional, defaults to the original error code)

```ts
const config = {
  /* ... */
  error: {
    errorCode: 404,
    responsePath: '/404.html',
  },
};
```

To customize the response of multiple error codes, pass an array of error response objects to `error`.

```ts
const config = {
  /* ... */
  error: [
    {
      errorCode: 404,
      responsePath: '/404.html',
    },
    {
      errorCode: [500, 501, 502, 503],
      responsePath: '/500.html',
      responseCode: 500,
    },
  ],
};
```

## 🌎 Contributing

- **Request a feature**: Create an issue with the **Feature request** template.
- **Report bugs**: Create an issue with the **Bug report** template.
- **Add new feature or fix bugs**: Fork this repository, edit code, and send a pull request.

[![Contributors](https://contributors-img.web.app/image?repo=rocket-booster/rocket-booster)](https://github.com/rocket-booster/rocket-booster/graphs/contributors)
