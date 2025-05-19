export function logWithPrefix(prefix: string, message: string, ...args: any[]) {
  console.log(`[${prefix}]`, message, ...args);
}
