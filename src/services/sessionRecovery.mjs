
const transientCodes = new Set(['network', 'timeout', 'server', 'rate_limited']);
export const isTransientSessionError = error => transientCodes.has(error?.code);
