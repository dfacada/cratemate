/**
 * Theme utilities for CrateMate
 * Handles color mapping for Camelot keys, energy levels, BPM ranges, and dynamic theming
 */

/**
 * Get CSS variable color for Camelot key (1-12)
 * Maps musical keys to a harmonic color wheel
 */
export function getCamelotColor(key: string | number): string {
  const keyNum = typeof key === 'string' ? parseInt(key, 10) : key;
  if (keyNum < 1 || keyNum > 12) return 'var(--text-secondary)';
  return `var(--key-${keyNum})`;
}

/**
 * Get color based on energy level (0.0 to 1.0)
 * Gradient: cool blue → teal → orange → hot red
 */
export function getEnergyColor(energy: number): string {
  const normalized = Math.max(0, Math.min(1, energy));

  if (normalized < 0.3) {
    // Cool blue
    return '#6b8aff';
  } else if (normalized < 0.6) {
    // Teal
    return 'var(--accent-primary)';
  } else if (normalized < 0.8) {
    // Orange
    return 'var(--accent-secondary)';
  } else {
    // Hot red
    return 'var(--accent-danger)';
  }
}

/**
 * Get color based on BPM value
 * Slow (< 100) = cool blue
 * Medium (100-130) = teal (brand color)
 * Fast (130-160) = orange
 * Very fast (160+) = red
 */
export function getBpmColor(bpm: number): string {
  if (bpm < 100) {
    return '#6b8aff'; // Cool blue
  } else if (bpm < 130) {
    return 'var(--accent-primary)'; // Teal
  } else if (bpm < 160) {
    return 'var(--accent-secondary)'; // Orange
  } else {
    return 'var(--accent-danger)'; // Red
  }
}

/**
 * Set theme preference (light/dark) on document
 */
export function setTheme(theme: 'light' | 'dark'): void {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('cratemate_theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('cratemate_theme', 'dark');
  }
}

/**
 * Get current theme preference from localStorage or system preference
 */
export function getTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('cratemate_theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {}

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  return 'dark'; // Default to dark for DJ tool
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const theme = getTheme();
  setTheme(theme);
}
