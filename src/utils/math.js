// src/utils/math.js
/**
 * Mathematical utility functions
 */

export function mean(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function std(arr) {
  if (!Array.isArray(arr) || arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.map(x => (x - m) ** 2).reduce((a, b) => a + b, 0) / (arr.length - 1));
}

export function covariance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const a2 = a.slice(-n), b2 = b.slice(-n);
  const ma = mean(a2), mb = mean(b2);
  let s = 0; 
  for (let i = 0; i < n; i++) s += (a2[i] - ma) * (b2[i] - mb);
  return s / (n - 1);
}

export function correlation(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const sa = std(a.slice(-n)), sb = std(b.slice(-n));
  if (!sa || !sb) return 0;
  return covariance(a, b) / (sa * sb);
}

/**
 * Convert any value to a finite number or null
 */
export function toNumber(val) {
  if (val === null || val === undefined || val === '' || val === 'None') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

/**
 * Find first present (non-null, non-undefined) value from object using multiple keys
 */
export function getFirstPresent(obj, keys) {
  for (const key of keys) {
    const val = obj[key];
    if (val !== null && val !== undefined && val !== '' && val !== 'None') {
      return val;
    }
  }
  return null;
}
