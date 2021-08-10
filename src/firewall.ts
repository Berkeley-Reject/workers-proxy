import { createResponse } from './utils';
import {
  FirewallOptions,
  FirewallFields,
  FirewallOperators,
} from '../types/firewall';
import { Middleware } from '../types/middleware';

export const getFieldParam = (
  request: Request,
  field: FirewallFields,
): string | number | null => {
  const cfProperties = request.cf;

  if (field === 'asn') {
    return cfProperties.asn;
  }

  if (field === 'continent') {
    return cfProperties.continent || '';
  }

  if (field === 'country') {
    return cfProperties.country;
  }

  if (field === 'hostname') {
    return request.headers.get('host') || '';
  }

  if (field === 'ip') {
    return request.headers.get('cf-connecting-ip') || '';
  }

  if (field === 'user-agent') {
    return request.headers.get('user-agent') || '';
  }

  return null;
};

export const parseFirewallRule = (
  fieldParam: string | number | null,
  operator: FirewallOperators,
  value: string | string[] | number | number[] | RegExp,
): Response | null => {
  if (fieldParam === null) {
    return null;
  }

  if (
    (value instanceof RegExp && operator !== 'match')
    || (!(value instanceof RegExp) && operator === 'match')
  ) {
    throw new Error('You must use match operator for regular expression.');
  }

  if (
    value instanceof RegExp
    && operator === 'match'
    && value.test(fieldParam.toString())
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  if (
    operator === 'equal'
  && fieldParam === value
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  if (
    operator === 'not equal'
  && typeof fieldParam === typeof value
  && fieldParam !== value
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  if (
    operator === 'greater'
  && typeof fieldParam === 'number'
  && typeof value === 'number'
  && fieldParam > value
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  if (
    operator === 'less'
  && typeof fieldParam === 'number'
  && typeof value === 'number'
  && fieldParam < value
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  if (Array.isArray(value)) {
    const contains = value.some(
      (item: string | number) => item === fieldParam,
    );

    if (
      (contains && operator === 'in')
      || (!contains && operator === 'not in')
    ) {
      return createResponse(
        'You don\'t have permission to access this service.',
        403,
      );
    }
  }

  if (
    operator === 'contain'
  && typeof fieldParam === 'string'
  && typeof value === 'string'
  && fieldParam.includes(value)
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  if (
    operator === 'not contain'
  && typeof fieldParam === 'string'
  && typeof value === 'string'
  && !fieldParam.includes(value)
  ) {
    return createResponse(
      'You don\'t have permission to access this service.',
      403,
    );
  }

  return null;
};

export const useFirewall: Middleware = (
  context,
  next,
) => {
  const { request, options } = context;
  if (options.firewall === undefined) {
    return next();
  }

  const firewallRules: FirewallOptions[] = [];
  if (Array.isArray(options.firewall)) {
    firewallRules.push(...options.firewall);
  } else {
    firewallRules.push(options.firewall);
  }

  for (const { field, operator, value } of firewallRules) {
    const fieldParam = getFieldParam(
      request,
      field,
    );

    const response = parseFirewallRule(
      fieldParam,
      operator,
      value,
    );

    if (response !== null) {
      context.response = response;
      return null;
    }
  }

  return next();
};
