![Header](https://raw.githubusercontent.com/booster-labs/rocket-booster/master/.github/img/header.jpg)

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
[⚙️ Options](#-options) |
[🌎 Contributing](#-contributing)
</div>

🚀 **rocket-booster** is a lightweight and scalable reverse proxy and load balancing library built for [Cloudflare Workers](https://workers.cloudflare.com). It sits in front of web servers (e.g. web application, storage platform, or RESTful API), forwards HTTP requests or WebSocket traffics from clients to upstream servers and transforms responses with several optimizations to improve page loading time.

- ⚡ Serverless: Deploy instantly to the auto-scaling serverless platform built by Cloudflare. No virtual machines, servers, or containers to manage.
- ✈️ Load Balancing: Distribute incoming traffics evenly among different upstream services.
- ⚙️ Hackable: Deliver unique content based on visitor attributes, conduct A/B testing, or build custom middleware to hook into the lifecycle. (Experimental)
- 📄 TypeScript: Extensive type declaration with TSDoc.

## 📦 Build and Deploy

### Start with templates

- [Install Wrangler CLI](https://github.com/cloudflare/wrangler#installation) and generate a project from the [rocket-booster-template](https://github.com/booster-labs/rocket-booster-template)

```sh
npm install -g @cloudflare/wrangler

wrangler generate booster-app https://github.com/booster-labs/rocket-booster-template
```

- Install dependencies and edit the options in `src/index.ts`

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

- Import the `useProxy` function from `rocket-booster`. The function returns an object with the `use()` method, which maps route patterns to configuration objects, and `apply()` method, which takes the inbound [Request](https://developers.cloudflare.com/workers/runtime-apis/request) to the Worker, and returns the [Response](https://developers.cloudflare.com/workers/runtime-apis/request) fetched from the upstream service.

```ts
import useProxy from 'rocket-booster';

addEventListener('fetch', (event) => {
  const proxy = useProxy();
  proxy.use('/', {
    upstream: {
      domain:  'example.com',
      protocol: 'https',
    },
  });

  const response = proxy.apply(event.request);
  event.respondWith(response);
});
```

- Edit the options object to change the request and response. For example, the options below will add the header `Access-Control-Allow-Origin: *` to each response from the upstream service, which allows any origin to access the service.

```ts
proxy.use('/', {
  upstream: {
    domain:  'example.com',
    protocol: 'https',
  },
  cors: {
    origin: '*',
  },
});
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
proxy.use('/', {
  upstream: {
    domain: 'developer.mozilla.org',
    protocol: 'https',
  },
});
```

[Live Demo](https://mozilla.readme.workers.dev/)

### WebSocket Proxy

`rocket-booster` could proxy WebSocket traffic to upstream services. Set up a reverse proxy for [wss://echo.websocket.org](wss://echo.websocket.org):

```ts
proxy.use('/', {
  upstream: {
    domain: 'echo.websocket.org',
    protocol: 'https',
  },
});
```

### S3 Bucket with custom response behavior

`rocket-booster` could set custom headers to request and response, add CORS header, or add basic authentication. Set up a reverse proxy for [https://example.s3.amazonaws.com](https://example.s3.amazonaws.com):

```ts
proxy.use('/', {
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
});
```

## ⚙️ Options

### Routing

The `proxy` object provides a `use` function that maps URL patterns to different options. The options object has an optional `methods` property that accepts a list of HTTP methods, which specifies the request methods the route will handle.

```ts
// Matches all requests
proxy.use('/', { /* ... */ });

// Matches GET and POST requests with path starting with `/api`
proxy.use('/api', {
  methods: ['GET', 'POST'],
});

// Matches GET requests with path ending with `.json` in `/data`
proxy.use('/data/*.json', {
  methods: ['GET'],
});
```

### Upstream

- `domain`: The domain name of the upstream server.
- `protocol`: The protocol scheme of the upstream server. (optional, defaults to `'https'`)
- `port`: The port of the upstream server. (optional, defaults to `80` or `443` based on `protocol`)
- `timeout`: The maximum wait time on a request to the upstream server. (optional, defaults to `10000`)

```ts
proxy.use('/', {
  upstream: {
    domain: 'httpbin.org',
    protocol: 'https',
    port: 443,
    timeout: 10000,
  },
  /* ... */
});
```

### Load Balancing

To load balance HTTP traffic to a group of servers, pass an array of server configurations to `upstream`. Each request will be forwarded to a randomly selected server. Several load balancing algorithms will be implemented in the future.

```ts
proxy.use('/', {
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
});
```

### Firewall

Each incoming request is inspected against the firewall rules defined in the `firewall` property of the options object. The request will be blocked if it matches at least one firewall rule.

- `field`: The property of the incoming request to be inspected
  - `asn`: The ASN number of the incoming request. (`number`)
  - `ip`: The IP address of the incoming request, e.g. `1.1.1.1`. (`string`)
  - `hostname`: The content of the `host` header, e.g. `github.com`. (`string | undefined`)
  - `user-agent`: The content of the `user-agent` header, e.g. `Mozilla/5.0`. (`string | undefined`)
  - `country`: The two-letter country code in the request, e.g. `US`. (`string | undefined`)
  - `continent`: The continent of the incoming request, e.g. `NA`. (`string | undefined`)
- `value`: The value of the firewall rule
- `operator`: The operator to be used to determine if the request is blocked
  - `equal`: Block the request if `field` is equal to `value`
  - `not equal`: Block the request if `field` is not equal to `value`
  - `match`: Block the request if `value` matches `field` (Expect `field` to be `string` and `value` to be `RegExp`)
  - `not match`: Block the request if `value` doesn't match `field` (Expect `field` to be `string` and `value` to be `RegExp`)
  - `in`: Block the request if `field` is in `value` (Expect `value` to be `Array`)
  - `not in`: Block the request if `field` is not in `value` (Expect `value` to be `Array`)
  - `contain`: Block the request if `field` contains `value` (Expect `field` and `value` to be `string`)
  - `not contain`: Block the request if `field` doesn't contain `value` (Expect `field` and `value` to be `string`)
  - `greater`: Block the request if `field` is greater than `value` (Expect `field` and `value` to be `number`)
  - `less`: Block the request if `field` is less than `value` (Expect `field` and `value` to be `number`)

```ts
proxy.use('/', {
  /* ... */
  firewall: [
    {
      field: 'ip',
      operator: 'in',
      value: ['1.1.1.1', '1.0.0.1'],
    },
    {
      field: 'user-agent',
      operator: 'match',
      value: /Chrome/,
    }
  ],
});
```

### Rewrite

- `location`: Rewrite the `location` header for responses with 3xx or 201 status if exists. (optional, defaults to `false`)

```ts
proxy.use('/', {
  /* ... */
  rewrite: {
    path: {
      '/api/user': '/user'
    },
  },
});
```

### Headers

- `request`: Sets request header going upstream to the backend. Accepts an object. (optional, defaults to `{}`)
- `response`: Sets response header coming downstream to the client. Accepts an object. (optional, defaults to `{}`)

```ts
proxy.use('/', {
  /* ... */
  headers: {
    request: {
      'x-example-header': 'hello server',
    },
    response: {
      'x-example-header': 'hello client',
    },
  },
});
```

### Cross-Origin Resource Sharing (CORS)

- `origin`: Configures the `Access-Control-Allow-Origin` CORS header. (optional, defaults to `false`)
  - `boolean`: set to `true` to reflect the origin of the request, or set to `false` to disable CORS.
  - `string[]`: an array of acceptable origins.
  - `*`: allow any origin to access the resource.

- `methods`: Configures the `Access-Control-Allow-Methods` CORS header. Expects an array of valid HTTP methods or `*`. (optional, defaults to reflecting the method specified in the request’s `Access-Control-Request-Method` header)

- `allowedHeaders`: Configures the `Access-Control-Allow-Headers` CORS header. Expects an array of HTTP headers or *. (optional, defaults to reflecting the headers specified in the request’s `Access-Control-Request-Headers` header.)

- `exposedHeaders`: Configures the `Access-Control-Expose-Headers` CORS header. Expects an array of HTTP headers or `*`. (optional, defaults to `[]`)

- `credentials`: Configures the `Access-Control-Allow-Credentials` CORS header. Set to true to pass the header, otherwise it is omitted. (optional, defaults to `false`)

- `maxAge`: Configures the `Access-Control-Max-Age` CORS header. Set to an integer to pass the header, otherwise it is omitted. (optional)

```ts
proxy.use('/', {
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
});
```

### Optimization

Cloudflare Workers provides several optimization by default.

- [Brotli](https://brotli.org/): Speed up page load times for visitor’s HTTPS traffic by applying Brotli compression.
- [HTTP/2](https://developers.google.com/web/fundamentals/performance/http2): Improve page load time by connection multiplexing, header compression, and server push.
- [HTTP/3 with QUIC](https://en.wikipedia.org/wiki/HTTP/3): Accelerate HTTP requests by using QUIC, which provides encryption and performance improvements compared to TCP and TLS.
- [0-RTT Connection Resumption](https://blog.cloudflare.com/introducing-0-rtt/): Improve performance for clients who have previously connected to the website.

## 🌎 Contributing

- **Request a feature**: Create an issue with the **Feature request** template.
- **Report bugs**: Create an issue with the **Bug report** template.
- **Add new feature or fix bugs**: Fork this repository, edit code, and send a pull request.

[![Contributors](https://contributors-img.web.app/image?repo=rocket-booster/rocket-booster)](https://github.com/rocket-booster/rocket-booster/graphs/contributors)
