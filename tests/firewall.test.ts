import {
  getFieldParam,
  parseFirewallRule,
  useFirewall,
} from '../src/firewall';

import { Context } from '../types/middleware';

import {
  FirewallOptions,
} from '../types/firewall';

const request = new Request(
  'https://httpbin.org/get',
  {
    headers: new Headers({
      host: 'https://httpbin.org',
      'cf-connecting-ip': '1.1.1.1',
      'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
      'user-agent': 'Mozilla/5.0',
    }),
    method: 'GET',
  },
);

test('firewall.ts -> getFieldParam()', () => {
  const firewall: FirewallOptions[] = [
    {
      field: 'ip',
      operator: 'equal',
      value: '',
    },
    {
      field: 'hostname',
      operator: 'equal',
      value: '',
    },
    {
      field: 'user-agent',
      operator: 'equal',
      value: '',
    },
  ];
  expect(getFieldParam(request, firewall[0].field)).toEqual('1.1.1.1');
  expect(getFieldParam(request, firewall[1].field)).toEqual('https://httpbin.org');
  expect(getFieldParam(request, firewall[2].field)).toEqual('Mozilla/5.0');
});

test('firewall.ts -> parseFirewallRule()', () => {
  const firewall: FirewallOptions[] = [
    {
      field: 'ip',
      operator: 'equal',
      value: '1.1.1.1',
    },
    {
      field: 'hostname',
      operator: 'equal',
      value: '',
    },
    {
      field: 'ip',
      operator: 'in',
      value: ['1.1.1.1'],
    },
    {
      field: 'ip',
      operator: 'not in',
      value: ['255.1.1.1'],
    },
    {
      field: 'user-agent',
      operator: 'not contain',
      value: '114514',
    },
    {
      field: 'user-agent',
      operator: 'contain',
      value: '114514',
    },
  ];
  const response1 = parseFirewallRule(
    (getFieldParam(request, firewall[0].field)),
    firewall[0].operator,
    firewall[0].value,
  );
  const response2 = parseFirewallRule(
    (getFieldParam(request, firewall[1].field)),
    firewall[1].operator,
    firewall[1].value,
  );
  const response3 = parseFirewallRule(
    (getFieldParam(request, firewall[2].field)),
    firewall[2].operator,
    firewall[2].value,
  );
  const response4 = parseFirewallRule(
    (getFieldParam(request, firewall[3].field)),
    firewall[3].operator,
    firewall[3].value,
  );
  const response5 = parseFirewallRule(
    (getFieldParam(request, firewall[4].field)),
    firewall[4].operator,
    firewall[4].value,
  );
  const response6 = parseFirewallRule(
    (getFieldParam(request, firewall[5].field)),
    firewall[5].operator,
    firewall[5].value,
  );
  const response7 = parseFirewallRule(
    null,
    firewall[5].operator,
    firewall[5].value,
  );
  expect(response1 !== null).toBe(true);
  expect(response2 === null).toBe(true);
  expect(response3 !== null).toBe(true);
  expect(response4 !== null).toBe(true);
  expect(response5 !== null).toBe(true);
  expect(response6 === null).toBe(true);
  expect(response7 === null).toBe(true);
  expect(() => {
    parseFirewallRule(
      '114514',
      'match',
      '114514',
    );
  }).toThrow('You must use match operator for regular expression');
});

test('firewall.ts -> useFirewall()', () => {
  const firewall : FirewallOptions[] = [
    {
      field: 'ip',
      operator: 'match',
      value: new RegExp('^1'),
    },
  ];
  const context: Context = {
    request,
    response: new Response(),
    hostname: 'https://httpbin.org',
    upstream: null,
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      firewall,
    },
  };
  useFirewall(context, () => null);
  expect(context.response.status).not.toBe(200);
});

test('firewall.ts -> useFirewall()', () => {
  const firewall : FirewallOptions[] = [
    {
      field: 'ip',
      operator: 'match',
      value: new RegExp('^1'),
    },
  ];
  const context: Context = {
    request: new Request(
      'https://httpbin.org/get',
      {
        headers: new Headers({
          host: 'https://httpbin.org',
          'cf-connecting-ip': '255.1.1.1',
          'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
        }),
        method: 'GET',
      },
    ),
    response: new Response(),
    hostname: 'https://httpbin.org',
    upstream: null,
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      firewall,
    },
  };
  useFirewall(context, () => null);
  expect(context.response.status).toBe(200);
});

test('firewall.ts -> useFirewall()', () => {
  const context: Context = {
    request: new Request(
      'https://httpbin.org/get',
      {
        headers: new Headers({
          host: 'https://httpbin.org',
          'cf-connecting-ip': '255.1.1.1',
          'X-Forwarded-For': '127.0.0.1, 127.0.0.2',
        }),
        method: 'GET',
      },
    ),
    response: new Response(),
    hostname: 'https://httpbin.org',
    upstream: null,
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      firewall: undefined,
    },
  };
  useFirewall(context, () => null);
  expect(context.response.status).toBe(200);
});
