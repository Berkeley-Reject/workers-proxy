import { ErrorOptions } from '../types/custom-error';
import { FirewallOptions } from '../types/firewall';
import { Middleware } from '../types/middleware';
import { UpstreamOptions } from '../types/upstream';

const validateUpstreamOptions = (
  upstream: UpstreamOptions,
): void => {
  if (upstream.domain === undefined) {
    throw new Error('Invalid \'upstream\' field in the option object.');
  }
};

const validateFirewallOptions = (
  firewall: FirewallOptions,
): void => {
  if (
    firewall.field === undefined
    || firewall.operator === undefined
    || firewall.value === undefined
  ) {
    throw new Error('Invalid \'firewall\' field in the option object.');
  }

  const fields = new Set([
    'country',
    'continent',
    'asn',
    'ip',
    'hostname',
    'user-agent',
  ]);
  if (fields.has(firewall.field) === false) {
    throw new Error('Invalid \'firewall\' field in the option object.');
  }

  const operators = new Set([
    'equal',
    'not equal',
    'greater',
    'less',
    'in',
    'not in',
    'contain',
    'not contain',
    'match',
  ]);
  if (operators.has(firewall.operator) === false) {
    throw new Error('Invalid \'firewall\' field in the option object.');
  }
};

const validateErrorOptions = (
  error : ErrorOptions,
): void => {
  if (error.errorCode === undefined || error.responsePath === undefined) {
    throw new Error('Invalid \'error\' field in the option object.');
  }
};

export const useValidate: Middleware = (
  context,
  next,
) => {
  const { options } = context;
  const {
    upstream,
    firewall,
    error,
  } = options;

  if (upstream === undefined) {
    throw new Error('The required \'upstream\' field in the option object is missing.');
  } else if (Array.isArray(upstream)) {
    upstream.forEach(validateUpstreamOptions);
  } else {
    validateUpstreamOptions(upstream);
  }

  if (firewall !== undefined) {
    if (Array.isArray(firewall)) {
      firewall.forEach(validateFirewallOptions);
    } else {
      validateFirewallOptions(firewall);
    }
  }

  if (error !== undefined) {
    if (Array.isArray(error)) {
      error.forEach(validateErrorOptions);
    } else {
      validateErrorOptions(error);
    }
  }

  return next();
};
