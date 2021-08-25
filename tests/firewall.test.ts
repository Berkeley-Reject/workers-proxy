import {
  useFirewall,
  getFieldParam,
  equalOperator,
  notEqualOperator,
  greaterOperator,
  lessOperator,
  inOperator,
  notInOperator,
  containOperator,
  notContainOperator,
  matchOperator,
  notMatchOperator,
} from '../src/firewall';
import { Context } from '../types/middleware';

const request = new Request(
  'https://httpbin.org/get',
  {
    headers: new Headers({
      host: 'github.com',
      'cf-connecting-ip': '1.1.1.1',
      'user-agent': 'Mozilla/5.0',
    }),
    method: 'GET',
  },
);

test('firewall.ts -> useFirewall()', async () => {
  const context: Context = {
    request,
    response: new Response(),
    hostname: 'https://github.com',
    upstream: null,
    options: {
      upstream: {
        domain: 'httpbin.org',
      },
      firewall: [{
        field: 'ip',
        operator: 'in',
        value: ['1.1.1.1', '1.0.0.1'],
      }],
    },
  };

  try {
    await useFirewall(context, () => null);
  } catch (error) {
    expect(error.message).toMatch('You don\'t have permission to access this service.');
  }
});

test('firewall.ts -> getFieldParam()', () => {
  expect(getFieldParam(request, 'ip')).toEqual('1.1.1.1');
  expect(getFieldParam(request, 'hostname')).toEqual('github.com');
  expect(getFieldParam(request, 'user-agent')).toEqual('Mozilla/5.0');
});

test('firewall.ts -> equalOperator()', () => {
  expect(equalOperator('1.1.1.1', '1.1.1.1')).toBeTruthy();
  expect(equalOperator('1.1.1.1', '1.0.0.1')).toBeFalsy();
});

test('firewall.ts -> notEqualOperator()', () => {
  expect(notEqualOperator('1.1.1.1', '1.0.0.1')).toBeTruthy();
  expect(notEqualOperator('1.1.1.1', '1.1.1.1')).toBeFalsy();
});

test('firewall.ts -> greaterOperator()', () => {
  expect(greaterOperator(1, 0)).toBeTruthy();
  try {
    greaterOperator('a', '0');
  } catch (error) {
    expect(error.message).toMatch('You must use number for \'value\' in firewall configuration to use \'greater\' or \'less\' operator');
  }
});

test('firewall.ts -> lessOperator()', () => {
  expect(lessOperator(0, 1)).toBeTruthy();
  try {
    lessOperator('a', '1');
  } catch (error) {
    expect(error.message).toMatch('You must use number for \'value\' in firewall configuration to use \'greater\' or \'less\' operator');
  }
});

test('firewall.ts -> inOperator()', () => {
  expect(inOperator(0, [0, 1, 2])).toBeTruthy();
  expect(inOperator(0, [1, 2, 3])).toBeFalsy();
  try {
    inOperator(0, "1, 2, 3");
  } catch (error) {
    expect(error.message).toMatch('You must use an Array for \'value\' in firewall configuration to use \'in\' or \'not in\' operator');
  }
});

test('firewall.ts -> notInOperator()', () => {
  expect(notInOperator(0, [1, 2, 3])).toBeTruthy();
  expect(notInOperator(0, [0, 1, 2])).toBeFalsy();
});

test('firewall.ts -> containOperator()', () => {
  expect(containOperator('test-string', 'string')).toBeTruthy();
  expect(containOperator('test-string', 'not string')).toBeFalsy();
  try {
    containOperator('test-string1', 1);
  } catch (error) {
    expect(error.message).toMatch('You must use string for \'value\' in firewall configuration to use \'contain\' or \'not contain\' operator');
  }
});

test('firewall.ts -> notContainOperator()', () => {
  expect(notContainOperator('test-string', 'not string')).toBeTruthy();
  expect(notContainOperator('test-string', 'string')).toBeFalsy();
});

test('firewall.ts -> matchOperator()', () => {
  expect(matchOperator('test-string', /test-.*/)).toBeTruthy();
  expect(matchOperator('test-string', /not-.*/)).toBeFalsy();
  try {
    containOperator('test-string1', 'test-string1');
  } catch (error) {
    expect(error.message).toMatch('You must use \'new RegExp(\'...\')\' for \'value\' in firewall configuration to use \'match\' or \'not match\' operator');
  }
});

test('firewall.ts -> notMatchOperator()', () => {
  expect(notMatchOperator('test-string', /not-.*/)).toBeTruthy();
  expect(notMatchOperator('test-string', /test-.*/)).toBeFalsy();
});
