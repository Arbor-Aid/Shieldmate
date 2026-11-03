export function readRuntimeEnv(key: string): string | undefined {
  const viteValue = import.meta.env[key];
  if (typeof viteValue === 'string' && viteValue.length > 0) {
    return viteValue;
  }

  return typeof process !== 'undefined' ? process.env?.[key] : undefined;
}

export function isDevelopmentRuntime(): boolean {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV !== 'production';
  }

  return import.meta.env.MODE !== 'production';
}
