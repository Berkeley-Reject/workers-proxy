import {
  FirewallField,
  FirewallOperator,
  FirewallHandler,
  FirewallOptions,
} from '../types/firewall';
import { Middleware } from '../types/middleware';

const fields: Set<FirewallField> = new Set([
  'country',
  'continent',
  'asn',
  'ip',
  'hostname',
  'user-agent',
]);

const operators: Set<FirewallOperator> = new Set([
  'equal',
  'not equal',
  'greater',
  'less',
  'in',
  'not in',
  'contain',
  'not contain',
  'match',
  'not match',
]);

const validateFirewall = ({
  field,
  operator,
  value,
}: FirewallOptions): void => {
  if (
    field === undefined
    || operator === undefined
    || value === undefined
  ) {
    throw new Error('Invalid \'firewall\' field in the option object');
  }

  if (fields.has(field) === false) {
    throw new Error('Invalid \'firewall\' field in the option object');
  }

  if (operators.has(operator) === false) {
    throw new Error('Invalid \'firewall\' field in the option object');
  }
};

export const getFieldParam = (
  request: Request,
  field: FirewallField,
): string | number | void => {
  const cfProperties = request.cf;
  switch (field) {
    case 'asn':
      return cfProperties.asn;
    case 'continent':
      return cfProperties.continent || '';
    case 'country':
      return cfProperties.country;
    case 'hostname':
      return request.headers.get('host') || '';
    case 'ip':
      return request.headers.get('cf-connecting-ip') || '';
    case 'user-agent':
      return request.headers.get('user-agent') || '';
    default:
      return undefined;
  }
};

export const matchOperator: FirewallHandler = (
  fieldParam,
  value,
) => {
  if (!(value instanceof RegExp)) {
    throw new Error('You must use \'new RegExp(\'...\')\' for \'value\' in firewall configuration to use \'match\' or \'not match\' operator');
  }
  return value.test(fieldParam.toString());
};

export const notMatchOperator: FirewallHandler = (
  fieldParam,
  value,
) => !matchOperator(fieldParam, value);

export const equalOperator: FirewallHandler = (
  fieldParam,
  value,
) => fieldParam === value;

export const notEqualOperator: FirewallHandler = (
  fieldParam,
  value,
) => fieldParam !== value;

export const greaterOperator: FirewallHandler = (
  fieldParam,
  value,
) => {
  if (
    typeof fieldParam !== 'number'
    || typeof value !== 'number'
  ) {
    throw new Error('You must use number for \'value\' in firewall configuration to use \'greater\' or \'less\' operator');
  }
  return fieldParam > value;
};

export const lessOperator: FirewallHandler = (
  fieldParam,
  value,
) => {
  if (
    typeof fieldParam !== 'number'
    || typeof value !== 'number'
  ) {
    throw new Error('You must use number for \'value\' in firewall configuration to use \'greater\' or \'less\' operator');
  }
  return fieldParam < value;
};

export const containOperator: FirewallHandler = (
  fieldParam,
  value,
) => {
  if (
    typeof fieldParam !== 'string'
    || typeof value !== 'string'
  ) {
    throw new Error('You must use string for \'value\' in firewall configuration to use \'contain\' or \'not contain\' operator');
  }
  return fieldParam.includes(value);
};

export const notContainOperator: FirewallHandler = (
  fieldParam,
  value,
) => !containOperator(fieldParam, value);

export const inOperator: FirewallHandler = (
  fieldParam,
  value,
) => {
  if (!Array.isArray(value)) {
    throw new Error('You must use an Array for \'value\' in firewall configuration to use \'in\' or \'not in\' operator');
  }

  return value.some(
    (item: string | number) => item === fieldParam,
  );
};

export const notInOperator: FirewallHandler = (
  fieldParam,
  value,
) => !inOperator(fieldParam, value);

const operatorsMap: Record<FirewallOperator, FirewallHandler> = {
  match: matchOperator,
  contain: containOperator,
  equal: equalOperator,
  in: inOperator,
  greater: greaterOperator,
  less: lessOperator,
  'not match': notMatchOperator,
  'not contain': notContainOperator,
  'not equal': notEqualOperator,
  'not in': notInOperator,
};

export const useFirewall: Middleware = async (
  context,
  next,
) => {
  const { request, options } = context;
  if (options.firewall === undefined) {
    await next();
    return;
  }
  options.firewall.forEach(validateFirewall);

  for (const { field, operator, value } of options.firewall) {
    const fieldParam = getFieldParam(
      request,
      field,
    );

    if (
      fieldParam !== undefined
      && operatorsMap[operator](fieldParam, value)
    ) {
      throw new Error('You don\'t have permission to access this service.');
    }
  }

  await next();
};
