type MethodCallTransformValue = (value: unknown) => string | boolean | number | string[] | Record<string, unknown>;

export interface MethodCallConfig {
  readonly methodCall: string;
  readonly preferredMethodCalls?: ReadonlyArray<{
    readonly methodCall: string;
    readonly transformValue: MethodCallTransformValue;
  }>;
  readonly transformValue: MethodCallTransformValue;
}

export type MethodCallConfigs = Readonly<{
  [propLabel: string]: MethodCallConfig;
}>;

export type MultiMethodCalls = Array<{
  methodName: string;
  params: Array<string | Buffer>;
}>;

export const stringTransformer = (value: unknown): string => {
  return value as string;
};

export const base64StringTransformer = (value: unknown): string => {
  if (typeof value !== 'string' || value.length === 0) {
    return '';
  }

  return Buffer.from(value, 'base64').toString('utf8');
};

export const base64PathComponentsTransformer = (value: unknown): string => {
  if (!Array.isArray(value)) {
    return '';
  }

  return value.map(base64StringTransformer).join('/');
};

export const stringArrayTransformer = (value: unknown): string[] => {
  return value as string[];
};

export const booleanTransformer = (value: unknown): boolean => {
  return value !== 0 && value !== '0';
};

export const numberTransformer = (value: unknown): number => {
  return Number(value);
};

export const getMethodCalls = (configs: MethodCallConfigs) => {
  return Object.values(configs).map((config) => config.methodCall);
};

const getMethodName = (methodCall: string) => methodCall.split('=')[0];

export const getAvailableMethodCallConfigs = <T extends MethodCallConfigs>(configs: T, methodList: string[]): T => {
  const availableMethods = new Set(methodList);

  return Object.fromEntries(
    Object.entries(configs).map(([propLabel, config]) => {
      const selectedConfig = [...(config.preferredMethodCalls ?? []), config].find((candidate) =>
        availableMethods.has(getMethodName(candidate.methodCall)),
      );

      return [
        propLabel,
        selectedConfig == null
          ? {
              ...config,
              methodCall: 'false=',
            }
          : {
              ...config,
              methodCall: selectedConfig.methodCall,
              transformValue: selectedConfig.transformValue,
            },
      ];
    }),
  ) as T;
};

export const processMethodCallResponse = async <T extends MethodCallConfigs, P extends keyof T>(
  response: Array<Parameters<T[P]['transformValue']>[0]>,
  configs: T,
): Promise<{
  [propLabel in P]: ReturnType<T[propLabel]['transformValue']>;
}> => {
  return Object.assign(
    {},
    ...(await Promise.all(
      Object.keys(configs).map(async (propLabel, index) => {
        return {
          [propLabel]: configs[propLabel].transformValue(response[index]),
        };
      }),
    )),
  );
};
