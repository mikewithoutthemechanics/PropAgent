type LogLevel = 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

export function apiLog(level: LogLevel, message: string, meta?: LogMeta): void {
  const payload = {
    level,
    message,
    ts: new Date().toISOString(),
    ...meta,
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === 'warn') {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}
