/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';
export const HOST = "http://ec2-34-203-212-148.compute-1.amazonaws.com:8112/v1/graphql"


export const HEADERS = {}
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

export const Thunder =
  (fn: FetchFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) =>
    fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (graphqlOptions?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: graphqlOptions.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, SCLR>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  (fn: SubscriptionFunction) =>
  <O extends keyof typeof Ops, SCLR extends ScalarDefinition, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<SCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: (Z & ValueTypes[R]) | ValueTypes[R],
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: graphqlOptions?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], SCLR>;
    if (returnedFunction?.on && graphqlOptions?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, SCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, SCLR>) => {
          if (graphqlOptions?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: graphqlOptions.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: (Z & ValueTypes[R]) | ValueTypes[R],
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <T>(t: T | V) => T;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariables<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never
export type ScalarCoders = {
	uuid?: ScalarResolver;
}
type ZEUS_UNIONS = never

export type ValueTypes = {
    /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
["Int_comparison_exp"]: {
	_eq?: number | undefined | null | Variable<any, string>,
	_gt?: number | undefined | null | Variable<any, string>,
	_gte?: number | undefined | null | Variable<any, string>,
	_in?: Array<number> | undefined | null | Variable<any, string>,
	_is_null?: boolean | undefined | null | Variable<any, string>,
	_lt?: number | undefined | null | Variable<any, string>,
	_lte?: number | undefined | null | Variable<any, string>,
	_neq?: number | undefined | null | Variable<any, string>,
	_nin?: Array<number> | undefined | null | Variable<any, string>
};
	/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
["String_comparison_exp"]: {
	_eq?: string | undefined | null | Variable<any, string>,
	_gt?: string | undefined | null | Variable<any, string>,
	_gte?: string | undefined | null | Variable<any, string>,
	/** does the column match the given case-insensitive pattern */
	_ilike?: string | undefined | null | Variable<any, string>,
	_in?: Array<string> | undefined | null | Variable<any, string>,
	/** does the column match the given POSIX regular expression, case insensitive */
	_iregex?: string | undefined | null | Variable<any, string>,
	_is_null?: boolean | undefined | null | Variable<any, string>,
	/** does the column match the given pattern */
	_like?: string | undefined | null | Variable<any, string>,
	_lt?: string | undefined | null | Variable<any, string>,
	_lte?: string | undefined | null | Variable<any, string>,
	_neq?: string | undefined | null | Variable<any, string>,
	/** does the column NOT match the given case-insensitive pattern */
	_nilike?: string | undefined | null | Variable<any, string>,
	_nin?: Array<string> | undefined | null | Variable<any, string>,
	/** does the column NOT match the given POSIX regular expression, case insensitive */
	_niregex?: string | undefined | null | Variable<any, string>,
	/** does the column NOT match the given pattern */
	_nlike?: string | undefined | null | Variable<any, string>,
	/** does the column NOT match the given POSIX regular expression, case sensitive */
	_nregex?: string | undefined | null | Variable<any, string>,
	/** does the column NOT match the given SQL regular expression */
	_nsimilar?: string | undefined | null | Variable<any, string>,
	/** does the column match the given POSIX regular expression, case sensitive */
	_regex?: string | undefined | null | Variable<any, string>,
	/** does the column match the given SQL regular expression */
	_similar?: string | undefined | null | Variable<any, string>
};
	/** columns and relationships of "courses" */
["courses"]: AliasType<{
	description?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	imageLink?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregated selection of "courses" */
["courses_aggregate"]: AliasType<{
	aggregate?:ValueTypes["courses_aggregate_fields"],
	nodes?:ValueTypes["courses"],
		__typename?: boolean | `@${string}`
}>;
	/** aggregate fields of "courses" */
["courses_aggregate_fields"]: AliasType<{
	avg?:ValueTypes["courses_avg_fields"],
count?: [{	columns?: Array<ValueTypes["courses_select_column"]> | undefined | null | Variable<any, string>,	distinct?: boolean | undefined | null | Variable<any, string>},boolean | `@${string}`],
	max?:ValueTypes["courses_max_fields"],
	min?:ValueTypes["courses_min_fields"],
	stddev?:ValueTypes["courses_stddev_fields"],
	stddev_pop?:ValueTypes["courses_stddev_pop_fields"],
	stddev_samp?:ValueTypes["courses_stddev_samp_fields"],
	sum?:ValueTypes["courses_sum_fields"],
	var_pop?:ValueTypes["courses_var_pop_fields"],
	var_samp?:ValueTypes["courses_var_samp_fields"],
	variance?:ValueTypes["courses_variance_fields"],
		__typename?: boolean | `@${string}`
}>;
	/** aggregate avg on columns */
["courses_avg_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Boolean expression to filter rows from the table "courses". All fields are combined with a logical 'AND'. */
["courses_bool_exp"]: {
	_and?: Array<ValueTypes["courses_bool_exp"]> | undefined | null | Variable<any, string>,
	_not?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>,
	_or?: Array<ValueTypes["courses_bool_exp"]> | undefined | null | Variable<any, string>,
	description?: ValueTypes["String_comparison_exp"] | undefined | null | Variable<any, string>,
	id?: ValueTypes["uuid_comparison_exp"] | undefined | null | Variable<any, string>,
	imageLink?: ValueTypes["String_comparison_exp"] | undefined | null | Variable<any, string>,
	price?: ValueTypes["Int_comparison_exp"] | undefined | null | Variable<any, string>,
	title?: ValueTypes["String_comparison_exp"] | undefined | null | Variable<any, string>
};
	/** unique or primary key constraints on table "courses" */
["courses_constraint"]:courses_constraint;
	/** input type for incrementing numeric columns in table "courses" */
["courses_inc_input"]: {
	price?: number | undefined | null | Variable<any, string>
};
	/** input type for inserting data into table "courses" */
["courses_insert_input"]: {
	description?: string | undefined | null | Variable<any, string>,
	id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	imageLink?: string | undefined | null | Variable<any, string>,
	price?: number | undefined | null | Variable<any, string>,
	title?: string | undefined | null | Variable<any, string>
};
	/** aggregate max on columns */
["courses_max_fields"]: AliasType<{
	description?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	imageLink?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate min on columns */
["courses_min_fields"]: AliasType<{
	description?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	imageLink?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** response of any mutation on the table "courses" */
["courses_mutation_response"]: AliasType<{
	/** number of rows affected by the mutation */
	affected_rows?:boolean | `@${string}`,
	/** data from the rows affected by the mutation */
	returning?:ValueTypes["courses"],
		__typename?: boolean | `@${string}`
}>;
	/** on_conflict condition type for table "courses" */
["courses_on_conflict"]: {
	constraint: ValueTypes["courses_constraint"] | Variable<any, string>,
	update_columns: Array<ValueTypes["courses_update_column"]> | Variable<any, string>,
	where?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>
};
	/** Ordering options when selecting data from "courses". */
["courses_order_by"]: {
	description?: ValueTypes["order_by"] | undefined | null | Variable<any, string>,
	id?: ValueTypes["order_by"] | undefined | null | Variable<any, string>,
	imageLink?: ValueTypes["order_by"] | undefined | null | Variable<any, string>,
	price?: ValueTypes["order_by"] | undefined | null | Variable<any, string>,
	title?: ValueTypes["order_by"] | undefined | null | Variable<any, string>
};
	/** primary key columns input for table: courses */
["courses_pk_columns_input"]: {
	id: ValueTypes["uuid"] | Variable<any, string>
};
	/** select columns of table "courses" */
["courses_select_column"]:courses_select_column;
	/** input type for updating data in table "courses" */
["courses_set_input"]: {
	description?: string | undefined | null | Variable<any, string>,
	id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	imageLink?: string | undefined | null | Variable<any, string>,
	price?: number | undefined | null | Variable<any, string>,
	title?: string | undefined | null | Variable<any, string>
};
	/** aggregate stddev on columns */
["courses_stddev_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate stddev_pop on columns */
["courses_stddev_pop_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate stddev_samp on columns */
["courses_stddev_samp_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Streaming cursor of the table "courses" */
["courses_stream_cursor_input"]: {
	/** Stream column input with initial value */
	initial_value: ValueTypes["courses_stream_cursor_value_input"] | Variable<any, string>,
	/** cursor ordering */
	ordering?: ValueTypes["cursor_ordering"] | undefined | null | Variable<any, string>
};
	/** Initial value of the column from where the streaming should start */
["courses_stream_cursor_value_input"]: {
	description?: string | undefined | null | Variable<any, string>,
	id?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	imageLink?: string | undefined | null | Variable<any, string>,
	price?: number | undefined | null | Variable<any, string>,
	title?: string | undefined | null | Variable<any, string>
};
	/** aggregate sum on columns */
["courses_sum_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** update columns of table "courses" */
["courses_update_column"]:courses_update_column;
	["courses_updates"]: {
	/** increments the numeric columns with given value of the filtered values */
	_inc?: ValueTypes["courses_inc_input"] | undefined | null | Variable<any, string>,
	/** sets the columns of the filtered rows to the given values */
	_set?: ValueTypes["courses_set_input"] | undefined | null | Variable<any, string>,
	/** filter the rows which have to be updated */
	where: ValueTypes["courses_bool_exp"] | Variable<any, string>
};
	/** aggregate var_pop on columns */
["courses_var_pop_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate var_samp on columns */
["courses_var_samp_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate variance on columns */
["courses_variance_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** ordering argument of a cursor */
["cursor_ordering"]:cursor_ordering;
	/** mutation root */
["mutation_root"]: AliasType<{
delete_courses?: [{	/** filter the rows which have to be deleted */
	where: ValueTypes["courses_bool_exp"] | Variable<any, string>},ValueTypes["courses_mutation_response"]],
delete_courses_by_pk?: [{	id: ValueTypes["uuid"] | Variable<any, string>},ValueTypes["courses"]],
insert_courses?: [{	/** the rows to be inserted */
	objects: Array<ValueTypes["courses_insert_input"]> | Variable<any, string>,	/** upsert condition */
	on_conflict?: ValueTypes["courses_on_conflict"] | undefined | null | Variable<any, string>},ValueTypes["courses_mutation_response"]],
insert_courses_one?: [{	/** the row to be inserted */
	object: ValueTypes["courses_insert_input"] | Variable<any, string>,	/** upsert condition */
	on_conflict?: ValueTypes["courses_on_conflict"] | undefined | null | Variable<any, string>},ValueTypes["courses"]],
update_courses?: [{	/** increments the numeric columns with given value of the filtered values */
	_inc?: ValueTypes["courses_inc_input"] | undefined | null | Variable<any, string>,	/** sets the columns of the filtered rows to the given values */
	_set?: ValueTypes["courses_set_input"] | undefined | null | Variable<any, string>,	/** filter the rows which have to be updated */
	where: ValueTypes["courses_bool_exp"] | Variable<any, string>},ValueTypes["courses_mutation_response"]],
update_courses_by_pk?: [{	/** increments the numeric columns with given value of the filtered values */
	_inc?: ValueTypes["courses_inc_input"] | undefined | null | Variable<any, string>,	/** sets the columns of the filtered rows to the given values */
	_set?: ValueTypes["courses_set_input"] | undefined | null | Variable<any, string>,	pk_columns: ValueTypes["courses_pk_columns_input"] | Variable<any, string>},ValueTypes["courses"]],
update_courses_many?: [{	/** updates to execute, in order */
	updates: Array<ValueTypes["courses_updates"]> | Variable<any, string>},ValueTypes["courses_mutation_response"]],
		__typename?: boolean | `@${string}`
}>;
	/** column ordering options */
["order_by"]:order_by;
	["query_root"]: AliasType<{
courses?: [{	/** distinct select on columns */
	distinct_on?: Array<ValueTypes["courses_select_column"]> | undefined | null | Variable<any, string>,	/** limit the number of rows returned */
	limit?: number | undefined | null | Variable<any, string>,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null | Variable<any, string>,	/** sort the rows by one or more columns */
	order_by?: Array<ValueTypes["courses_order_by"]> | undefined | null | Variable<any, string>,	/** filter the rows returned */
	where?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>},ValueTypes["courses"]],
courses_aggregate?: [{	/** distinct select on columns */
	distinct_on?: Array<ValueTypes["courses_select_column"]> | undefined | null | Variable<any, string>,	/** limit the number of rows returned */
	limit?: number | undefined | null | Variable<any, string>,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null | Variable<any, string>,	/** sort the rows by one or more columns */
	order_by?: Array<ValueTypes["courses_order_by"]> | undefined | null | Variable<any, string>,	/** filter the rows returned */
	where?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>},ValueTypes["courses_aggregate"]],
courses_by_pk?: [{	id: ValueTypes["uuid"] | Variable<any, string>},ValueTypes["courses"]],
		__typename?: boolean | `@${string}`
}>;
	["subscription_root"]: AliasType<{
courses?: [{	/** distinct select on columns */
	distinct_on?: Array<ValueTypes["courses_select_column"]> | undefined | null | Variable<any, string>,	/** limit the number of rows returned */
	limit?: number | undefined | null | Variable<any, string>,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null | Variable<any, string>,	/** sort the rows by one or more columns */
	order_by?: Array<ValueTypes["courses_order_by"]> | undefined | null | Variable<any, string>,	/** filter the rows returned */
	where?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>},ValueTypes["courses"]],
courses_aggregate?: [{	/** distinct select on columns */
	distinct_on?: Array<ValueTypes["courses_select_column"]> | undefined | null | Variable<any, string>,	/** limit the number of rows returned */
	limit?: number | undefined | null | Variable<any, string>,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null | Variable<any, string>,	/** sort the rows by one or more columns */
	order_by?: Array<ValueTypes["courses_order_by"]> | undefined | null | Variable<any, string>,	/** filter the rows returned */
	where?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>},ValueTypes["courses_aggregate"]],
courses_by_pk?: [{	id: ValueTypes["uuid"] | Variable<any, string>},ValueTypes["courses"]],
courses_stream?: [{	/** maximum number of rows returned in a single batch */
	batch_size: number | Variable<any, string>,	/** cursor to stream the results returned by the query */
	cursor: Array<ValueTypes["courses_stream_cursor_input"] | undefined | null> | Variable<any, string>,	/** filter the rows returned */
	where?: ValueTypes["courses_bool_exp"] | undefined | null | Variable<any, string>},ValueTypes["courses"]],
		__typename?: boolean | `@${string}`
}>;
	["uuid"]:unknown;
	/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
["uuid_comparison_exp"]: {
	_eq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	_gt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	_gte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	_in?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>,
	_is_null?: boolean | undefined | null | Variable<any, string>,
	_lt?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	_lte?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	_neq?: ValueTypes["uuid"] | undefined | null | Variable<any, string>,
	_nin?: Array<ValueTypes["uuid"]> | undefined | null | Variable<any, string>
}
  }

export type ResolverInputTypes = {
    ["schema"]: AliasType<{
	query?:ResolverInputTypes["query_root"],
	mutation?:ResolverInputTypes["mutation_root"],
	subscription?:ResolverInputTypes["subscription_root"],
		__typename?: boolean | `@${string}`
}>;
	/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
["Int_comparison_exp"]: {
	_eq?: number | undefined | null,
	_gt?: number | undefined | null,
	_gte?: number | undefined | null,
	_in?: Array<number> | undefined | null,
	_is_null?: boolean | undefined | null,
	_lt?: number | undefined | null,
	_lte?: number | undefined | null,
	_neq?: number | undefined | null,
	_nin?: Array<number> | undefined | null
};
	/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
["String_comparison_exp"]: {
	_eq?: string | undefined | null,
	_gt?: string | undefined | null,
	_gte?: string | undefined | null,
	/** does the column match the given case-insensitive pattern */
	_ilike?: string | undefined | null,
	_in?: Array<string> | undefined | null,
	/** does the column match the given POSIX regular expression, case insensitive */
	_iregex?: string | undefined | null,
	_is_null?: boolean | undefined | null,
	/** does the column match the given pattern */
	_like?: string | undefined | null,
	_lt?: string | undefined | null,
	_lte?: string | undefined | null,
	_neq?: string | undefined | null,
	/** does the column NOT match the given case-insensitive pattern */
	_nilike?: string | undefined | null,
	_nin?: Array<string> | undefined | null,
	/** does the column NOT match the given POSIX regular expression, case insensitive */
	_niregex?: string | undefined | null,
	/** does the column NOT match the given pattern */
	_nlike?: string | undefined | null,
	/** does the column NOT match the given POSIX regular expression, case sensitive */
	_nregex?: string | undefined | null,
	/** does the column NOT match the given SQL regular expression */
	_nsimilar?: string | undefined | null,
	/** does the column match the given POSIX regular expression, case sensitive */
	_regex?: string | undefined | null,
	/** does the column match the given SQL regular expression */
	_similar?: string | undefined | null
};
	/** columns and relationships of "courses" */
["courses"]: AliasType<{
	description?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	imageLink?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregated selection of "courses" */
["courses_aggregate"]: AliasType<{
	aggregate?:ResolverInputTypes["courses_aggregate_fields"],
	nodes?:ResolverInputTypes["courses"],
		__typename?: boolean | `@${string}`
}>;
	/** aggregate fields of "courses" */
["courses_aggregate_fields"]: AliasType<{
	avg?:ResolverInputTypes["courses_avg_fields"],
count?: [{	columns?: Array<ResolverInputTypes["courses_select_column"]> | undefined | null,	distinct?: boolean | undefined | null},boolean | `@${string}`],
	max?:ResolverInputTypes["courses_max_fields"],
	min?:ResolverInputTypes["courses_min_fields"],
	stddev?:ResolverInputTypes["courses_stddev_fields"],
	stddev_pop?:ResolverInputTypes["courses_stddev_pop_fields"],
	stddev_samp?:ResolverInputTypes["courses_stddev_samp_fields"],
	sum?:ResolverInputTypes["courses_sum_fields"],
	var_pop?:ResolverInputTypes["courses_var_pop_fields"],
	var_samp?:ResolverInputTypes["courses_var_samp_fields"],
	variance?:ResolverInputTypes["courses_variance_fields"],
		__typename?: boolean | `@${string}`
}>;
	/** aggregate avg on columns */
["courses_avg_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Boolean expression to filter rows from the table "courses". All fields are combined with a logical 'AND'. */
["courses_bool_exp"]: {
	_and?: Array<ResolverInputTypes["courses_bool_exp"]> | undefined | null,
	_not?: ResolverInputTypes["courses_bool_exp"] | undefined | null,
	_or?: Array<ResolverInputTypes["courses_bool_exp"]> | undefined | null,
	description?: ResolverInputTypes["String_comparison_exp"] | undefined | null,
	id?: ResolverInputTypes["uuid_comparison_exp"] | undefined | null,
	imageLink?: ResolverInputTypes["String_comparison_exp"] | undefined | null,
	price?: ResolverInputTypes["Int_comparison_exp"] | undefined | null,
	title?: ResolverInputTypes["String_comparison_exp"] | undefined | null
};
	/** unique or primary key constraints on table "courses" */
["courses_constraint"]:courses_constraint;
	/** input type for incrementing numeric columns in table "courses" */
["courses_inc_input"]: {
	price?: number | undefined | null
};
	/** input type for inserting data into table "courses" */
["courses_insert_input"]: {
	description?: string | undefined | null,
	id?: ResolverInputTypes["uuid"] | undefined | null,
	imageLink?: string | undefined | null,
	price?: number | undefined | null,
	title?: string | undefined | null
};
	/** aggregate max on columns */
["courses_max_fields"]: AliasType<{
	description?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	imageLink?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate min on columns */
["courses_min_fields"]: AliasType<{
	description?:boolean | `@${string}`,
	id?:boolean | `@${string}`,
	imageLink?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** response of any mutation on the table "courses" */
["courses_mutation_response"]: AliasType<{
	/** number of rows affected by the mutation */
	affected_rows?:boolean | `@${string}`,
	/** data from the rows affected by the mutation */
	returning?:ResolverInputTypes["courses"],
		__typename?: boolean | `@${string}`
}>;
	/** on_conflict condition type for table "courses" */
["courses_on_conflict"]: {
	constraint: ResolverInputTypes["courses_constraint"],
	update_columns: Array<ResolverInputTypes["courses_update_column"]>,
	where?: ResolverInputTypes["courses_bool_exp"] | undefined | null
};
	/** Ordering options when selecting data from "courses". */
["courses_order_by"]: {
	description?: ResolverInputTypes["order_by"] | undefined | null,
	id?: ResolverInputTypes["order_by"] | undefined | null,
	imageLink?: ResolverInputTypes["order_by"] | undefined | null,
	price?: ResolverInputTypes["order_by"] | undefined | null,
	title?: ResolverInputTypes["order_by"] | undefined | null
};
	/** primary key columns input for table: courses */
["courses_pk_columns_input"]: {
	id: ResolverInputTypes["uuid"]
};
	/** select columns of table "courses" */
["courses_select_column"]:courses_select_column;
	/** input type for updating data in table "courses" */
["courses_set_input"]: {
	description?: string | undefined | null,
	id?: ResolverInputTypes["uuid"] | undefined | null,
	imageLink?: string | undefined | null,
	price?: number | undefined | null,
	title?: string | undefined | null
};
	/** aggregate stddev on columns */
["courses_stddev_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate stddev_pop on columns */
["courses_stddev_pop_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate stddev_samp on columns */
["courses_stddev_samp_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Streaming cursor of the table "courses" */
["courses_stream_cursor_input"]: {
	/** Stream column input with initial value */
	initial_value: ResolverInputTypes["courses_stream_cursor_value_input"],
	/** cursor ordering */
	ordering?: ResolverInputTypes["cursor_ordering"] | undefined | null
};
	/** Initial value of the column from where the streaming should start */
["courses_stream_cursor_value_input"]: {
	description?: string | undefined | null,
	id?: ResolverInputTypes["uuid"] | undefined | null,
	imageLink?: string | undefined | null,
	price?: number | undefined | null,
	title?: string | undefined | null
};
	/** aggregate sum on columns */
["courses_sum_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** update columns of table "courses" */
["courses_update_column"]:courses_update_column;
	["courses_updates"]: {
	/** increments the numeric columns with given value of the filtered values */
	_inc?: ResolverInputTypes["courses_inc_input"] | undefined | null,
	/** sets the columns of the filtered rows to the given values */
	_set?: ResolverInputTypes["courses_set_input"] | undefined | null,
	/** filter the rows which have to be updated */
	where: ResolverInputTypes["courses_bool_exp"]
};
	/** aggregate var_pop on columns */
["courses_var_pop_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate var_samp on columns */
["courses_var_samp_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** aggregate variance on columns */
["courses_variance_fields"]: AliasType<{
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** ordering argument of a cursor */
["cursor_ordering"]:cursor_ordering;
	/** mutation root */
["mutation_root"]: AliasType<{
delete_courses?: [{	/** filter the rows which have to be deleted */
	where: ResolverInputTypes["courses_bool_exp"]},ResolverInputTypes["courses_mutation_response"]],
delete_courses_by_pk?: [{	id: ResolverInputTypes["uuid"]},ResolverInputTypes["courses"]],
insert_courses?: [{	/** the rows to be inserted */
	objects: Array<ResolverInputTypes["courses_insert_input"]>,	/** upsert condition */
	on_conflict?: ResolverInputTypes["courses_on_conflict"] | undefined | null},ResolverInputTypes["courses_mutation_response"]],
insert_courses_one?: [{	/** the row to be inserted */
	object: ResolverInputTypes["courses_insert_input"],	/** upsert condition */
	on_conflict?: ResolverInputTypes["courses_on_conflict"] | undefined | null},ResolverInputTypes["courses"]],
update_courses?: [{	/** increments the numeric columns with given value of the filtered values */
	_inc?: ResolverInputTypes["courses_inc_input"] | undefined | null,	/** sets the columns of the filtered rows to the given values */
	_set?: ResolverInputTypes["courses_set_input"] | undefined | null,	/** filter the rows which have to be updated */
	where: ResolverInputTypes["courses_bool_exp"]},ResolverInputTypes["courses_mutation_response"]],
update_courses_by_pk?: [{	/** increments the numeric columns with given value of the filtered values */
	_inc?: ResolverInputTypes["courses_inc_input"] | undefined | null,	/** sets the columns of the filtered rows to the given values */
	_set?: ResolverInputTypes["courses_set_input"] | undefined | null,	pk_columns: ResolverInputTypes["courses_pk_columns_input"]},ResolverInputTypes["courses"]],
update_courses_many?: [{	/** updates to execute, in order */
	updates: Array<ResolverInputTypes["courses_updates"]>},ResolverInputTypes["courses_mutation_response"]],
		__typename?: boolean | `@${string}`
}>;
	/** column ordering options */
["order_by"]:order_by;
	["query_root"]: AliasType<{
courses?: [{	/** distinct select on columns */
	distinct_on?: Array<ResolverInputTypes["courses_select_column"]> | undefined | null,	/** limit the number of rows returned */
	limit?: number | undefined | null,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null,	/** sort the rows by one or more columns */
	order_by?: Array<ResolverInputTypes["courses_order_by"]> | undefined | null,	/** filter the rows returned */
	where?: ResolverInputTypes["courses_bool_exp"] | undefined | null},ResolverInputTypes["courses"]],
courses_aggregate?: [{	/** distinct select on columns */
	distinct_on?: Array<ResolverInputTypes["courses_select_column"]> | undefined | null,	/** limit the number of rows returned */
	limit?: number | undefined | null,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null,	/** sort the rows by one or more columns */
	order_by?: Array<ResolverInputTypes["courses_order_by"]> | undefined | null,	/** filter the rows returned */
	where?: ResolverInputTypes["courses_bool_exp"] | undefined | null},ResolverInputTypes["courses_aggregate"]],
courses_by_pk?: [{	id: ResolverInputTypes["uuid"]},ResolverInputTypes["courses"]],
		__typename?: boolean | `@${string}`
}>;
	["subscription_root"]: AliasType<{
courses?: [{	/** distinct select on columns */
	distinct_on?: Array<ResolverInputTypes["courses_select_column"]> | undefined | null,	/** limit the number of rows returned */
	limit?: number | undefined | null,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null,	/** sort the rows by one or more columns */
	order_by?: Array<ResolverInputTypes["courses_order_by"]> | undefined | null,	/** filter the rows returned */
	where?: ResolverInputTypes["courses_bool_exp"] | undefined | null},ResolverInputTypes["courses"]],
courses_aggregate?: [{	/** distinct select on columns */
	distinct_on?: Array<ResolverInputTypes["courses_select_column"]> | undefined | null,	/** limit the number of rows returned */
	limit?: number | undefined | null,	/** skip the first n rows. Use only with order_by */
	offset?: number | undefined | null,	/** sort the rows by one or more columns */
	order_by?: Array<ResolverInputTypes["courses_order_by"]> | undefined | null,	/** filter the rows returned */
	where?: ResolverInputTypes["courses_bool_exp"] | undefined | null},ResolverInputTypes["courses_aggregate"]],
courses_by_pk?: [{	id: ResolverInputTypes["uuid"]},ResolverInputTypes["courses"]],
courses_stream?: [{	/** maximum number of rows returned in a single batch */
	batch_size: number,	/** cursor to stream the results returned by the query */
	cursor: Array<ResolverInputTypes["courses_stream_cursor_input"] | undefined | null>,	/** filter the rows returned */
	where?: ResolverInputTypes["courses_bool_exp"] | undefined | null},ResolverInputTypes["courses"]],
		__typename?: boolean | `@${string}`
}>;
	["uuid"]:unknown;
	/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
["uuid_comparison_exp"]: {
	_eq?: ResolverInputTypes["uuid"] | undefined | null,
	_gt?: ResolverInputTypes["uuid"] | undefined | null,
	_gte?: ResolverInputTypes["uuid"] | undefined | null,
	_in?: Array<ResolverInputTypes["uuid"]> | undefined | null,
	_is_null?: boolean | undefined | null,
	_lt?: ResolverInputTypes["uuid"] | undefined | null,
	_lte?: ResolverInputTypes["uuid"] | undefined | null,
	_neq?: ResolverInputTypes["uuid"] | undefined | null,
	_nin?: Array<ResolverInputTypes["uuid"]> | undefined | null
}
  }

export type ModelTypes = {
    ["schema"]: {
	query?: ModelTypes["query_root"] | undefined,
	mutation?: ModelTypes["mutation_root"] | undefined,
	subscription?: ModelTypes["subscription_root"] | undefined
};
	/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
["Int_comparison_exp"]: {
	_eq?: number | undefined,
	_gt?: number | undefined,
	_gte?: number | undefined,
	_in?: Array<number> | undefined,
	_is_null?: boolean | undefined,
	_lt?: number | undefined,
	_lte?: number | undefined,
	_neq?: number | undefined,
	_nin?: Array<number> | undefined
};
	/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
["String_comparison_exp"]: {
	_eq?: string | undefined,
	_gt?: string | undefined,
	_gte?: string | undefined,
	/** does the column match the given case-insensitive pattern */
	_ilike?: string | undefined,
	_in?: Array<string> | undefined,
	/** does the column match the given POSIX regular expression, case insensitive */
	_iregex?: string | undefined,
	_is_null?: boolean | undefined,
	/** does the column match the given pattern */
	_like?: string | undefined,
	_lt?: string | undefined,
	_lte?: string | undefined,
	_neq?: string | undefined,
	/** does the column NOT match the given case-insensitive pattern */
	_nilike?: string | undefined,
	_nin?: Array<string> | undefined,
	/** does the column NOT match the given POSIX regular expression, case insensitive */
	_niregex?: string | undefined,
	/** does the column NOT match the given pattern */
	_nlike?: string | undefined,
	/** does the column NOT match the given POSIX regular expression, case sensitive */
	_nregex?: string | undefined,
	/** does the column NOT match the given SQL regular expression */
	_nsimilar?: string | undefined,
	/** does the column match the given POSIX regular expression, case sensitive */
	_regex?: string | undefined,
	/** does the column match the given SQL regular expression */
	_similar?: string | undefined
};
	/** columns and relationships of "courses" */
["courses"]: {
		description: string,
	id: ModelTypes["uuid"],
	imageLink: string,
	price: number,
	title: string
};
	/** aggregated selection of "courses" */
["courses_aggregate"]: {
		aggregate?: ModelTypes["courses_aggregate_fields"] | undefined,
	nodes: Array<ModelTypes["courses"]>
};
	/** aggregate fields of "courses" */
["courses_aggregate_fields"]: {
		avg?: ModelTypes["courses_avg_fields"] | undefined,
	count: number,
	max?: ModelTypes["courses_max_fields"] | undefined,
	min?: ModelTypes["courses_min_fields"] | undefined,
	stddev?: ModelTypes["courses_stddev_fields"] | undefined,
	stddev_pop?: ModelTypes["courses_stddev_pop_fields"] | undefined,
	stddev_samp?: ModelTypes["courses_stddev_samp_fields"] | undefined,
	sum?: ModelTypes["courses_sum_fields"] | undefined,
	var_pop?: ModelTypes["courses_var_pop_fields"] | undefined,
	var_samp?: ModelTypes["courses_var_samp_fields"] | undefined,
	variance?: ModelTypes["courses_variance_fields"] | undefined
};
	/** aggregate avg on columns */
["courses_avg_fields"]: {
		price?: number | undefined
};
	/** Boolean expression to filter rows from the table "courses". All fields are combined with a logical 'AND'. */
["courses_bool_exp"]: {
	_and?: Array<ModelTypes["courses_bool_exp"]> | undefined,
	_not?: ModelTypes["courses_bool_exp"] | undefined,
	_or?: Array<ModelTypes["courses_bool_exp"]> | undefined,
	description?: ModelTypes["String_comparison_exp"] | undefined,
	id?: ModelTypes["uuid_comparison_exp"] | undefined,
	imageLink?: ModelTypes["String_comparison_exp"] | undefined,
	price?: ModelTypes["Int_comparison_exp"] | undefined,
	title?: ModelTypes["String_comparison_exp"] | undefined
};
	["courses_constraint"]:courses_constraint;
	/** input type for incrementing numeric columns in table "courses" */
["courses_inc_input"]: {
	price?: number | undefined
};
	/** input type for inserting data into table "courses" */
["courses_insert_input"]: {
	description?: string | undefined,
	id?: ModelTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate max on columns */
["courses_max_fields"]: {
		description?: string | undefined,
	id?: ModelTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate min on columns */
["courses_min_fields"]: {
		description?: string | undefined,
	id?: ModelTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** response of any mutation on the table "courses" */
["courses_mutation_response"]: {
		/** number of rows affected by the mutation */
	affected_rows: number,
	/** data from the rows affected by the mutation */
	returning: Array<ModelTypes["courses"]>
};
	/** on_conflict condition type for table "courses" */
["courses_on_conflict"]: {
	constraint: ModelTypes["courses_constraint"],
	update_columns: Array<ModelTypes["courses_update_column"]>,
	where?: ModelTypes["courses_bool_exp"] | undefined
};
	/** Ordering options when selecting data from "courses". */
["courses_order_by"]: {
	description?: ModelTypes["order_by"] | undefined,
	id?: ModelTypes["order_by"] | undefined,
	imageLink?: ModelTypes["order_by"] | undefined,
	price?: ModelTypes["order_by"] | undefined,
	title?: ModelTypes["order_by"] | undefined
};
	/** primary key columns input for table: courses */
["courses_pk_columns_input"]: {
	id: ModelTypes["uuid"]
};
	["courses_select_column"]:courses_select_column;
	/** input type for updating data in table "courses" */
["courses_set_input"]: {
	description?: string | undefined,
	id?: ModelTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate stddev on columns */
["courses_stddev_fields"]: {
		price?: number | undefined
};
	/** aggregate stddev_pop on columns */
["courses_stddev_pop_fields"]: {
		price?: number | undefined
};
	/** aggregate stddev_samp on columns */
["courses_stddev_samp_fields"]: {
		price?: number | undefined
};
	/** Streaming cursor of the table "courses" */
["courses_stream_cursor_input"]: {
	/** Stream column input with initial value */
	initial_value: ModelTypes["courses_stream_cursor_value_input"],
	/** cursor ordering */
	ordering?: ModelTypes["cursor_ordering"] | undefined
};
	/** Initial value of the column from where the streaming should start */
["courses_stream_cursor_value_input"]: {
	description?: string | undefined,
	id?: ModelTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate sum on columns */
["courses_sum_fields"]: {
		price?: number | undefined
};
	["courses_update_column"]:courses_update_column;
	["courses_updates"]: {
	/** increments the numeric columns with given value of the filtered values */
	_inc?: ModelTypes["courses_inc_input"] | undefined,
	/** sets the columns of the filtered rows to the given values */
	_set?: ModelTypes["courses_set_input"] | undefined,
	/** filter the rows which have to be updated */
	where: ModelTypes["courses_bool_exp"]
};
	/** aggregate var_pop on columns */
["courses_var_pop_fields"]: {
		price?: number | undefined
};
	/** aggregate var_samp on columns */
["courses_var_samp_fields"]: {
		price?: number | undefined
};
	/** aggregate variance on columns */
["courses_variance_fields"]: {
		price?: number | undefined
};
	["cursor_ordering"]:cursor_ordering;
	/** mutation root */
["mutation_root"]: {
		/** delete data from the table: "courses" */
	delete_courses?: ModelTypes["courses_mutation_response"] | undefined,
	/** delete single row from the table: "courses" */
	delete_courses_by_pk?: ModelTypes["courses"] | undefined,
	/** insert data into the table: "courses" */
	insert_courses?: ModelTypes["courses_mutation_response"] | undefined,
	/** insert a single row into the table: "courses" */
	insert_courses_one?: ModelTypes["courses"] | undefined,
	/** update data of the table: "courses" */
	update_courses?: ModelTypes["courses_mutation_response"] | undefined,
	/** update single row of the table: "courses" */
	update_courses_by_pk?: ModelTypes["courses"] | undefined,
	/** update multiples rows of table: "courses" */
	update_courses_many?: Array<ModelTypes["courses_mutation_response"] | undefined> | undefined
};
	["order_by"]:order_by;
	["query_root"]: {
		/** fetch data from the table: "courses" */
	courses: Array<ModelTypes["courses"]>,
	/** fetch aggregated fields from the table: "courses" */
	courses_aggregate: ModelTypes["courses_aggregate"],
	/** fetch data from the table: "courses" using primary key columns */
	courses_by_pk?: ModelTypes["courses"] | undefined
};
	["subscription_root"]: {
		/** fetch data from the table: "courses" */
	courses: Array<ModelTypes["courses"]>,
	/** fetch aggregated fields from the table: "courses" */
	courses_aggregate: ModelTypes["courses_aggregate"],
	/** fetch data from the table: "courses" using primary key columns */
	courses_by_pk?: ModelTypes["courses"] | undefined,
	/** fetch data from the table in a streaming manner: "courses" */
	courses_stream: Array<ModelTypes["courses"]>
};
	["uuid"]:any;
	/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
["uuid_comparison_exp"]: {
	_eq?: ModelTypes["uuid"] | undefined,
	_gt?: ModelTypes["uuid"] | undefined,
	_gte?: ModelTypes["uuid"] | undefined,
	_in?: Array<ModelTypes["uuid"]> | undefined,
	_is_null?: boolean | undefined,
	_lt?: ModelTypes["uuid"] | undefined,
	_lte?: ModelTypes["uuid"] | undefined,
	_neq?: ModelTypes["uuid"] | undefined,
	_nin?: Array<ModelTypes["uuid"]> | undefined
}
    }

export type GraphQLTypes = {
    /** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
["Int_comparison_exp"]: {
		_eq?: number | undefined,
	_gt?: number | undefined,
	_gte?: number | undefined,
	_in?: Array<number> | undefined,
	_is_null?: boolean | undefined,
	_lt?: number | undefined,
	_lte?: number | undefined,
	_neq?: number | undefined,
	_nin?: Array<number> | undefined
};
	/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
["String_comparison_exp"]: {
		_eq?: string | undefined,
	_gt?: string | undefined,
	_gte?: string | undefined,
	/** does the column match the given case-insensitive pattern */
	_ilike?: string | undefined,
	_in?: Array<string> | undefined,
	/** does the column match the given POSIX regular expression, case insensitive */
	_iregex?: string | undefined,
	_is_null?: boolean | undefined,
	/** does the column match the given pattern */
	_like?: string | undefined,
	_lt?: string | undefined,
	_lte?: string | undefined,
	_neq?: string | undefined,
	/** does the column NOT match the given case-insensitive pattern */
	_nilike?: string | undefined,
	_nin?: Array<string> | undefined,
	/** does the column NOT match the given POSIX regular expression, case insensitive */
	_niregex?: string | undefined,
	/** does the column NOT match the given pattern */
	_nlike?: string | undefined,
	/** does the column NOT match the given POSIX regular expression, case sensitive */
	_nregex?: string | undefined,
	/** does the column NOT match the given SQL regular expression */
	_nsimilar?: string | undefined,
	/** does the column match the given POSIX regular expression, case sensitive */
	_regex?: string | undefined,
	/** does the column match the given SQL regular expression */
	_similar?: string | undefined
};
	/** columns and relationships of "courses" */
["courses"]: {
	__typename: "courses",
	description: string,
	id: GraphQLTypes["uuid"],
	imageLink: string,
	price: number,
	title: string
};
	/** aggregated selection of "courses" */
["courses_aggregate"]: {
	__typename: "courses_aggregate",
	aggregate?: GraphQLTypes["courses_aggregate_fields"] | undefined,
	nodes: Array<GraphQLTypes["courses"]>
};
	/** aggregate fields of "courses" */
["courses_aggregate_fields"]: {
	__typename: "courses_aggregate_fields",
	avg?: GraphQLTypes["courses_avg_fields"] | undefined,
	count: number,
	max?: GraphQLTypes["courses_max_fields"] | undefined,
	min?: GraphQLTypes["courses_min_fields"] | undefined,
	stddev?: GraphQLTypes["courses_stddev_fields"] | undefined,
	stddev_pop?: GraphQLTypes["courses_stddev_pop_fields"] | undefined,
	stddev_samp?: GraphQLTypes["courses_stddev_samp_fields"] | undefined,
	sum?: GraphQLTypes["courses_sum_fields"] | undefined,
	var_pop?: GraphQLTypes["courses_var_pop_fields"] | undefined,
	var_samp?: GraphQLTypes["courses_var_samp_fields"] | undefined,
	variance?: GraphQLTypes["courses_variance_fields"] | undefined
};
	/** aggregate avg on columns */
["courses_avg_fields"]: {
	__typename: "courses_avg_fields",
	price?: number | undefined
};
	/** Boolean expression to filter rows from the table "courses". All fields are combined with a logical 'AND'. */
["courses_bool_exp"]: {
		_and?: Array<GraphQLTypes["courses_bool_exp"]> | undefined,
	_not?: GraphQLTypes["courses_bool_exp"] | undefined,
	_or?: Array<GraphQLTypes["courses_bool_exp"]> | undefined,
	description?: GraphQLTypes["String_comparison_exp"] | undefined,
	id?: GraphQLTypes["uuid_comparison_exp"] | undefined,
	imageLink?: GraphQLTypes["String_comparison_exp"] | undefined,
	price?: GraphQLTypes["Int_comparison_exp"] | undefined,
	title?: GraphQLTypes["String_comparison_exp"] | undefined
};
	/** unique or primary key constraints on table "courses" */
["courses_constraint"]: courses_constraint;
	/** input type for incrementing numeric columns in table "courses" */
["courses_inc_input"]: {
		price?: number | undefined
};
	/** input type for inserting data into table "courses" */
["courses_insert_input"]: {
		description?: string | undefined,
	id?: GraphQLTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate max on columns */
["courses_max_fields"]: {
	__typename: "courses_max_fields",
	description?: string | undefined,
	id?: GraphQLTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate min on columns */
["courses_min_fields"]: {
	__typename: "courses_min_fields",
	description?: string | undefined,
	id?: GraphQLTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** response of any mutation on the table "courses" */
["courses_mutation_response"]: {
	__typename: "courses_mutation_response",
	/** number of rows affected by the mutation */
	affected_rows: number,
	/** data from the rows affected by the mutation */
	returning: Array<GraphQLTypes["courses"]>
};
	/** on_conflict condition type for table "courses" */
["courses_on_conflict"]: {
		constraint: GraphQLTypes["courses_constraint"],
	update_columns: Array<GraphQLTypes["courses_update_column"]>,
	where?: GraphQLTypes["courses_bool_exp"] | undefined
};
	/** Ordering options when selecting data from "courses". */
["courses_order_by"]: {
		description?: GraphQLTypes["order_by"] | undefined,
	id?: GraphQLTypes["order_by"] | undefined,
	imageLink?: GraphQLTypes["order_by"] | undefined,
	price?: GraphQLTypes["order_by"] | undefined,
	title?: GraphQLTypes["order_by"] | undefined
};
	/** primary key columns input for table: courses */
["courses_pk_columns_input"]: {
		id: GraphQLTypes["uuid"]
};
	/** select columns of table "courses" */
["courses_select_column"]: courses_select_column;
	/** input type for updating data in table "courses" */
["courses_set_input"]: {
		description?: string | undefined,
	id?: GraphQLTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate stddev on columns */
["courses_stddev_fields"]: {
	__typename: "courses_stddev_fields",
	price?: number | undefined
};
	/** aggregate stddev_pop on columns */
["courses_stddev_pop_fields"]: {
	__typename: "courses_stddev_pop_fields",
	price?: number | undefined
};
	/** aggregate stddev_samp on columns */
["courses_stddev_samp_fields"]: {
	__typename: "courses_stddev_samp_fields",
	price?: number | undefined
};
	/** Streaming cursor of the table "courses" */
["courses_stream_cursor_input"]: {
		/** Stream column input with initial value */
	initial_value: GraphQLTypes["courses_stream_cursor_value_input"],
	/** cursor ordering */
	ordering?: GraphQLTypes["cursor_ordering"] | undefined
};
	/** Initial value of the column from where the streaming should start */
["courses_stream_cursor_value_input"]: {
		description?: string | undefined,
	id?: GraphQLTypes["uuid"] | undefined,
	imageLink?: string | undefined,
	price?: number | undefined,
	title?: string | undefined
};
	/** aggregate sum on columns */
["courses_sum_fields"]: {
	__typename: "courses_sum_fields",
	price?: number | undefined
};
	/** update columns of table "courses" */
["courses_update_column"]: courses_update_column;
	["courses_updates"]: {
		/** increments the numeric columns with given value of the filtered values */
	_inc?: GraphQLTypes["courses_inc_input"] | undefined,
	/** sets the columns of the filtered rows to the given values */
	_set?: GraphQLTypes["courses_set_input"] | undefined,
	/** filter the rows which have to be updated */
	where: GraphQLTypes["courses_bool_exp"]
};
	/** aggregate var_pop on columns */
["courses_var_pop_fields"]: {
	__typename: "courses_var_pop_fields",
	price?: number | undefined
};
	/** aggregate var_samp on columns */
["courses_var_samp_fields"]: {
	__typename: "courses_var_samp_fields",
	price?: number | undefined
};
	/** aggregate variance on columns */
["courses_variance_fields"]: {
	__typename: "courses_variance_fields",
	price?: number | undefined
};
	/** ordering argument of a cursor */
["cursor_ordering"]: cursor_ordering;
	/** mutation root */
["mutation_root"]: {
	__typename: "mutation_root",
	/** delete data from the table: "courses" */
	delete_courses?: GraphQLTypes["courses_mutation_response"] | undefined,
	/** delete single row from the table: "courses" */
	delete_courses_by_pk?: GraphQLTypes["courses"] | undefined,
	/** insert data into the table: "courses" */
	insert_courses?: GraphQLTypes["courses_mutation_response"] | undefined,
	/** insert a single row into the table: "courses" */
	insert_courses_one?: GraphQLTypes["courses"] | undefined,
	/** update data of the table: "courses" */
	update_courses?: GraphQLTypes["courses_mutation_response"] | undefined,
	/** update single row of the table: "courses" */
	update_courses_by_pk?: GraphQLTypes["courses"] | undefined,
	/** update multiples rows of table: "courses" */
	update_courses_many?: Array<GraphQLTypes["courses_mutation_response"] | undefined> | undefined
};
	/** column ordering options */
["order_by"]: order_by;
	["query_root"]: {
	__typename: "query_root",
	/** fetch data from the table: "courses" */
	courses: Array<GraphQLTypes["courses"]>,
	/** fetch aggregated fields from the table: "courses" */
	courses_aggregate: GraphQLTypes["courses_aggregate"],
	/** fetch data from the table: "courses" using primary key columns */
	courses_by_pk?: GraphQLTypes["courses"] | undefined
};
	["subscription_root"]: {
	__typename: "subscription_root",
	/** fetch data from the table: "courses" */
	courses: Array<GraphQLTypes["courses"]>,
	/** fetch aggregated fields from the table: "courses" */
	courses_aggregate: GraphQLTypes["courses_aggregate"],
	/** fetch data from the table: "courses" using primary key columns */
	courses_by_pk?: GraphQLTypes["courses"] | undefined,
	/** fetch data from the table in a streaming manner: "courses" */
	courses_stream: Array<GraphQLTypes["courses"]>
};
	["uuid"]: "scalar" & { name: "uuid" };
	/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
["uuid_comparison_exp"]: {
		_eq?: GraphQLTypes["uuid"] | undefined,
	_gt?: GraphQLTypes["uuid"] | undefined,
	_gte?: GraphQLTypes["uuid"] | undefined,
	_in?: Array<GraphQLTypes["uuid"]> | undefined,
	_is_null?: boolean | undefined,
	_lt?: GraphQLTypes["uuid"] | undefined,
	_lte?: GraphQLTypes["uuid"] | undefined,
	_neq?: GraphQLTypes["uuid"] | undefined,
	_nin?: Array<GraphQLTypes["uuid"]> | undefined
}
    }
/** unique or primary key constraints on table "courses" */
export const enum courses_constraint {
	courses_pkey = "courses_pkey"
}
/** select columns of table "courses" */
export const enum courses_select_column {
	description = "description",
	id = "id",
	imageLink = "imageLink",
	price = "price",
	title = "title"
}
/** update columns of table "courses" */
export const enum courses_update_column {
	description = "description",
	id = "id",
	imageLink = "imageLink",
	price = "price",
	title = "title"
}
/** ordering argument of a cursor */
export const enum cursor_ordering {
	ASC = "ASC",
	DESC = "DESC"
}
/** column ordering options */
export const enum order_by {
	asc = "asc",
	asc_nulls_first = "asc_nulls_first",
	asc_nulls_last = "asc_nulls_last",
	desc = "desc",
	desc_nulls_first = "desc_nulls_first",
	desc_nulls_last = "desc_nulls_last"
}

type ZEUS_VARIABLES = {
	["Int_comparison_exp"]: ValueTypes["Int_comparison_exp"];
	["String_comparison_exp"]: ValueTypes["String_comparison_exp"];
	["courses_bool_exp"]: ValueTypes["courses_bool_exp"];
	["courses_constraint"]: ValueTypes["courses_constraint"];
	["courses_inc_input"]: ValueTypes["courses_inc_input"];
	["courses_insert_input"]: ValueTypes["courses_insert_input"];
	["courses_on_conflict"]: ValueTypes["courses_on_conflict"];
	["courses_order_by"]: ValueTypes["courses_order_by"];
	["courses_pk_columns_input"]: ValueTypes["courses_pk_columns_input"];
	["courses_select_column"]: ValueTypes["courses_select_column"];
	["courses_set_input"]: ValueTypes["courses_set_input"];
	["courses_stream_cursor_input"]: ValueTypes["courses_stream_cursor_input"];
	["courses_stream_cursor_value_input"]: ValueTypes["courses_stream_cursor_value_input"];
	["courses_update_column"]: ValueTypes["courses_update_column"];
	["courses_updates"]: ValueTypes["courses_updates"];
	["cursor_ordering"]: ValueTypes["cursor_ordering"];
	["order_by"]: ValueTypes["order_by"];
	["uuid"]: ValueTypes["uuid"];
	["uuid_comparison_exp"]: ValueTypes["uuid_comparison_exp"];
}