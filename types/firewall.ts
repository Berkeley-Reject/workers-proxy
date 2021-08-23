export type FirewallFields = 'country' | 'continent' | 'asn' | 'ip' | 'hostname' | 'user-agent';

export type FirewallOperators = 'equal' | 'not equal' | 'greater' | 'less' | 'in' | 'not in' | 'contain' | 'not contain' | 'match' | 'not match';

export type FirewallHandler = (
  fieldParam: string | number,
  value: string | string[] | number | number[] | RegExp,
) => boolean;

export interface FirewallOptions {
  field: FirewallFields;
  operator: FirewallOperators;
  value: string | string[] | number | number[] | RegExp;
}
