let totalMeters = 0;
export function addMeters(n: number) { totalMeters += Math.max(0, Number(n||0)); }
export function getTotalMeters() { return totalMeters; }
export function resetMeters() { totalMeters = 0; }
