import {
  FirewallFields,
  FirewallOperators,
  FirewallHandler,
  FirewallOptions,
} from '../types/firewall';
import { Middleware } from '../types/middleware';

const fields: Set<FirewallFields> = new Set([
  'country',
  'continent',
  'asn',
  'ip',
  'hostname',
  'user-agent',
]);

const operators: Set<FirewallOperators> = new Set([
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
  field: FirewallFields,
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
) => value instanceof RegExp && value.test(fieldParam.toString());

export const notMatchOperator: FirewallHandler = (
  fieldParam,
  value,
) => value instanceof RegExp && !value.test(fieldParam.toString());

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
    return false;
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
    return false;
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
    return false;
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
    return false;
  }

  return value.some(
    (item: string | number) => item === fieldParam,
  );
};

export const notInOperator: FirewallHandler = (
  fieldParam,
  value,
) => !inOperator(fieldParam, value);

const operatorsMap: Record<FirewallOperators, FirewallHandler> = {
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
