/**
 * CrateMate Music Theory Library
 *
 * Core DJ utility for calculating harmonic compatibility and effective keys
 * when pitching tracks up or down to match target BPM (without key lock/master tempo).
 *
 * Key concept: When a DJ pitches a track from originalBpm to targetBpm without using
 * master tempo (key lock), the track's pitch shifts along with tempo. This library
 * calculates what key the track ACTUALLY sounds like at the new BPM.
 *
 * Example: A track in 10A at 120 BPM pitched to 124 BPM will sound ~0.4 semitones higher,
 * shifting to approximately 10A-sharp (10.4A on the Camelot wheel).
 */

/**
 * Camelot Key with full musical and chromatic context
 */
export interface CamelotKey {
  /** Camelot number: 1-12 */
  number: number;
  /** Major (B) or minor (A) */
  letter: 'A' | 'B';
  /** Musical key name (e.g., "Ab minor", "B major") */
  musical: string;
  /** Chromatic position: C=0, C#=1, ..., B=11 */
  chromaticPosition: number;
}

/**
 * Pitch shift calculation result
 */
export interface PitchShiftResult {
  /** Exact semitone shift (can be fractional, e.g., 2.3) */
  semitones: number;
  /** Shift in cents (100 cents = 1 semitone) */
  cents: number;
  /** BPM change as percentage (e.g., 0.033 for 120→124 BPM) */
  percentChange: number;
}

/**
 * Effective key after pitch shifting
 */
export interface EffectiveKeyResult {
  /** Nearest Camelot key after pitch shift (e.g., "8A") */
  effectiveKey: string;
  /** Exact position on Camelot wheel (e.g., 8.42 means partway between 8A and 9A) */
  exactPosition: number;
  /** How many cents off from the nearest key */
  centsFromNearest: number;
  /** True if within ±5 cents of nearest key */
  isExact: boolean;
  /** Quality rating for harmonic matching */
  quality: 'perfect' | 'good' | 'acceptable' | 'risky' | 'clashing';
}

/**
 * Harmonic compatibility between two tracks at a target BPM
 */
export interface HarmonicCompatibilityResult {
  /** Overall compatibility assessment */
  compatible: boolean;
  /** Quality rating */
  quality: 'perfect' | 'good' | 'acceptable' | 'risky' | 'clashing';
  /** Track A's effective key and offset after pitch adjustment */
  trackAEffective: { key: string; centsOff: number };
  /** Track B's effective key and offset after pitch adjustment */
  trackBEffective: { key: string; centsOff: number };
  /** Human-readable explanation of compatibility */
  explanation: string;
  /** Total cents deviation between the two effective keys */
  combinedCentsOff: number;
}

/**
 * Duration compatibility result
 */
export interface DurationCompatibilityResult {
  /** True if durations are compatible for mixing */
  compatible: boolean;
  /** Duration ratio (e.g., 1.2 means B is 20% longer than A) */
  ratio: number;
  /** Quality rating based on duration ratio */
  quality: 'ideal' | 'good' | 'acceptable' | 'poor';
}

/**
 * Mix recommendation score combining all factors
 */
export interface MixScoreResult {
  /** Overall score 0-100 (higher is better) */
  overallScore: number;
  /** Harmonic compatibility score 0-100 (40% weight) */
  harmonicScore: number;
  /** BPM proximity score 0-100 (25% weight) */
  bpmScore: number;
  /** Energy flow score 0-100 (20% weight) */
  energyScore: number;
  /** Duration compatibility score 0-100 (15% weight) */
  durationScore: number;
  /** Human-readable breakdown of the score */
  breakdown: string;
}

/**
 * Track metadata for mix scoring
 */
export interface TrackMetadata {
  key: string; // Camelot key (e.g., "8A")
  bpm: number; // BPM (e.g., 120)
  energy: number; // Energy level 0-100 (optional, used for recommendations)
  duration: number; // Duration in seconds (optional, used for duration compatibility)
}

/**
 * Camelot wheel mapping: all 24 keys with their musical equivalents
 *
 * The Camelot wheel is organized by harmonic compatibility. Adjacent keys
 * (±1 on the wheel) are in musically compatible keys. The wheel helps DJs
 * mix without key lock by finding harmonic matches.
 */
const CAMELOT_WHEEL: Record<string, CamelotKey> = {
  '1A': {
    number: 1,
    letter: 'A',
    musical: 'Ab minor',
    chromaticPosition: 8, // Ab
  },
  '1B': {
    number: 1,
    letter: 'B',
    musical: 'B major',
    chromaticPosition: 11, // B
  },
  '2A': {
    number: 2,
    letter: 'A',
    musical: 'Eb minor',
    chromaticPosition: 3, // Eb
  },
  '2B': {
    number: 2,
    letter: 'B',
    musical: 'F# major',
    chromaticPosition: 6, // F#
  },
  '3A': {
    number: 3,
    letter: 'A',
    musical: 'Bb minor',
    chromaticPosition: 10, // Bb
  },
  '3B': {
    number: 3,
    letter: 'B',
    musical: 'Db major',
    chromaticPosition: 1, // Db
  },
  '4A': {
    number: 4,
    letter: 'A',
    musical: 'F minor',
    chromaticPosition: 5, // F
  },
  '4B': {
    number: 4,
    letter: 'B',
    musical: 'Ab major',
    chromaticPosition: 8, // Ab
  },
  '5A': {
    number: 5,
    letter: 'A',
    musical: 'C minor',
    chromaticPosition: 0, // C
  },
  '5B': {
    number: 5,
    letter: 'B',
    musical: 'Eb major',
    chromaticPosition: 3, // Eb
  },
  '6A': {
    number: 6,
    letter: 'A',
    musical: 'G minor',
    chromaticPosition: 7, // G
  },
  '6B': {
    number: 6,
    letter: 'B',
    musical: 'Bb major',
    chromaticPosition: 10, // Bb
  },
  '7A': {
    number: 7,
    letter: 'A',
    musical: 'D minor',
    chromaticPosition: 2, // D
  },
  '7B': {
    number: 7,
    letter: 'B',
    musical: 'F major',
    chromaticPosition: 5, // F
  },
  '8A': {
    number: 8,
    letter: 'A',
    musical: 'A minor',
    chromaticPosition: 9, // A
  },
  '8B': {
    number: 8,
    letter: 'B',
    musical: 'C major',
    chromaticPosition: 0, // C
  },
  '9A': {
    number: 9,
    letter: 'A',
    musical: 'E minor',
    chromaticPosition: 4, // E
  },
  '9B': {
    number: 9,
    letter: 'B',
    musical: 'G major',
    chromaticPosition: 7, // G
  },
  '10A': {
    number: 10,
    letter: 'A',
    musical: 'B minor',
    chromaticPosition: 11, // B
  },
  '10B': {
    number: 10,
    letter: 'B',
    musical: 'D major',
    chromaticPosition: 2, // D
  },
  '11A': {
    number: 11,
    letter: 'A',
    musical: 'F# minor',
    chromaticPosition: 6, // F#
  },
  '11B': {
    number: 11,
    letter: 'B',
    musical: 'A major',
    chromaticPosition: 9, // A
  },
  '12A': {
    number: 12,
    letter: 'A',
    musical: 'Db minor',
    chromaticPosition: 1, // Db
  },
  '12B': {
    number: 12,
    letter: 'B',
    musical: 'E major',
    chromaticPosition: 4, // E
  },
};

/**
 * Reverse mapping from musical keys to Camelot for quick lookups
 */
const MUSICAL_TO_CAMELOT: Record<string, string> = {
  'Ab minor': '1A',
  'B major': '1B',
  'Eb minor': '2A',
  'F# major': '2B',
  'Bb minor': '3A',
  'Db major': '3B',
  'F minor': '4A',
  'Ab major': '4B',
  'C minor': '5A',
  'Eb major': '5B',
  'G minor': '6A',
  'Bb major': '6B',
  'D minor': '7A',
  'F major': '7B',
  'A minor': '8A',
  'C major': '8B',
  'E minor': '9A',
  'G major': '9B',
  'B minor': '10A',
  'D major': '10B',
  'F# minor': '11A',
  'A major': '11B',
  'Db minor': '12A',
  'E major': '12B',
};

/**
 * Calculate the pitch shift (in semitones) when changing from original BPM to target BPM.
 *
 * Formula: semitones = 12 × log₂(targetBPM / originalBPM)
 *
 * This assumes no key lock/master tempo — the pitch shifts linearly with the tempo.
 * Positive semitones = pitch goes up. Negative = pitch goes down.
 *
 * @param originalBpm - Original track BPM
 * @param targetBpm - Target BPM to pitch to
 * @returns Pitch shift in semitones, cents, and percentage
 *
 * @example
 * // Pitching from 120 to 124 BPM (common +4 BPM transition)
 * const shift = calculatePitchShift(120, 124);
 * // Returns: { semitones: 0.397, cents: 39.7, percentChange: 0.0333 }
 */
export function calculatePitchShift(
  originalBpm: number,
  targetBpm: number
): PitchShiftResult {
  if (originalBpm <= 0 || targetBpm <= 0) {
    throw new Error('BPM values must be positive');
  }

  // Core formula: semitones = 12 × log₂(target / original)
  const semitones = 12 * Math.log2(targetBpm / originalBpm);

  // Convert to cents (100 cents = 1 semitone)
  const cents = semitones * 100;

  // Percentage change in BPM
  const percentChange = (targetBpm - originalBpm) / originalBpm;

  return {
    semitones,
    cents,
    percentChange,
  };
}

/**
 * Parse a Camelot key string (e.g., "8A") into its components.
 *
 * @param key - Camelot key string (e.g., "8A", "12B")
 * @returns Parsed key with number and letter, or null if invalid
 *
 * @example
 * const parsed = parseCamelotKey("8A");
 * // Returns: { number: 8, letter: 'A' }
 */
export function parseCamelotKey(
  key: string
): { number: number; letter: 'A' | 'B' } | null {
  const match = key.match(/^(\d+)([AB])$/);
  if (!match) return null;

  const number = parseInt(match[1], 10);
  const letter = match[2] as 'A' | 'B';

  if (number < 1 || number > 12) return null;

  return { number, letter };
}

/**
 * Get the Camelot key that is closest to a specific position on the wheel.
 *
 * The Camelot wheel is a circle of 24 keys. This function finds the nearest key
 * to a fractional position (e.g., 8.42 is between 8A and 9A).
 *
 * @param exactPosition - Fractional position on Camelot wheel (0-24)
 * @returns Camelot key (e.g., "8A")
 */
function getNearestCamelotKey(exactPosition: number): string {
  // Normalize to 0-24 range
  let normalized = exactPosition % 24;
  if (normalized < 0) normalized += 24;

  // Round to nearest 0.5 (A or B)
  const rounded = Math.round(normalized * 2) / 2;
  const keyIndex = Math.floor(rounded);
  const isMajor = rounded % 1 === 0;

  const keyNumber = (keyIndex % 12) + 1;
  const letter = isMajor ? 'A' : 'B';

  return `${keyNumber}${letter}`;
}

/**
 * Calculate how many cents a fractional Camelot position is away from its nearest key.
 *
 * Since the Camelot wheel is discrete (24 keys total), we can estimate cents based
 * on position. Moving 1 full key = 12 semitones = 1200 cents, so 1 Camelot position = 50 cents.
 *
 * @param exactPosition - Fractional position on Camelot wheel
 * @returns Cents from nearest key (-50 to +50)
 */
function getCentsFromNearestKey(exactPosition: number): number {
  // Normalize to 0-24
  let normalized = exactPosition % 24;
  if (normalized < 0) normalized += 24;

  // Distance to nearest 0.5 (key position)
  const remainder = normalized % 0.5;
  const centDistance = Math.min(remainder, 0.5 - remainder) * 100;

  // Return signed distance
  return remainder < 0.25 ? centDistance : -centDistance;
}

/**
 * Calculate the effective key when a track is pitched from original BPM to target BPM.
 *
 * When a DJ pitches a track without key lock, the track's key shifts proportionally.
 * This function calculates what key the track actually sounds like at the new BPM.
 *
 * @param originalKey - Original Camelot key (e.g., "8A")
 * @param originalBpm - Original track BPM
 * @param targetBpm - Target BPM to pitch to
 * @returns Effective key and quality assessment
 *
 * @example
 * // Track in 10A at 120 BPM pitched to 124 BPM
 * const effective = getEffectiveKey("10A", 120, 124);
 * // Returns: { effectiveKey: "10A", exactPosition: 10.4, centsFromNearest: 20, isExact: false, quality: "good" }
 */
export function getEffectiveKey(
  originalKey: string,
  originalBpm: number,
  targetBpm: number
): EffectiveKeyResult {
  // Parse original key
  const parsed = parseCamelotKey(originalKey);
  if (!parsed) {
    throw new Error(`Invalid Camelot key: ${originalKey}`);
  }

  // Calculate pitch shift
  const pitchShift = calculatePitchShift(originalBpm, targetBpm);

  // Convert Camelot key to position on wheel (0-24)
  // A keys are at integer positions, B keys are at .5 positions
  const keyPosition = parsed.number;
  const isMajor = parsed.letter === 'B';
  const camelotPosition = keyPosition + (isMajor ? 0.5 : 0);

  // Pitch shift in semitones translates directly to position on wheel
  // (since each semitone moves 1 position / 12, and we have 12 positions for 12 semitones)
  // Actually: each position = 1 semitone, but Camelot wheel has 24 positions for 12 semitones
  // So: position change = semitones / 12 * 24 = semitones * 2
  const positionShift = pitchShift.semitones * 2;

  // New position (wrap around 0-24)
  let exactPosition = camelotPosition + positionShift;
  while (exactPosition >= 24) exactPosition -= 24;
  while (exactPosition < 0) exactPosition += 24;

  // Find nearest key
  const effectiveKey = getNearestCamelotKey(exactPosition);
  const centsFromNearest = getCentsFromNearestKey(exactPosition);
  const isExact = Math.abs(centsFromNearest) <= 5;

  // Quality assessment based on cents off
  let quality: 'perfect' | 'good' | 'acceptable' | 'risky' | 'clashing';
  const absCents = Math.abs(centsFromNearest);
  if (absCents <= 10) quality = 'perfect';
  else if (absCents <= 25) quality = 'good';
  else if (absCents <= 40) quality = 'acceptable';
  else if (absCents <= 50) quality = 'risky';
  else quality = 'clashing';

  return {
    effectiveKey,
    exactPosition,
    centsFromNearest,
    isExact,
    quality,
  };
}

/**
 * Get all Camelot keys that are harmonically compatible with the given key.
 *
 * Compatibility rules on the Camelot wheel:
 * - Same key: exact match
 * - ±1 position, same letter (e.g., 8A and 9A): adjacent minor or major keys
 * - Same number, opposite letter (e.g., 8A and 8B): relative major/minor
 *
 * @param key - Camelot key (e.g., "8A")
 * @returns Array of compatible Camelot keys
 *
 * @example
 * const compatible = getCompatibleKeys("8A");
 * // Returns: ["7A", "8A", "8B", "9A"] (and more on extended wheel)
 */
export function getCompatibleKeys(key: string): string[] {
  const parsed = parseCamelotKey(key);
  if (!parsed) {
    throw new Error(`Invalid Camelot key: ${key}`);
  }

  const { number, letter } = parsed;
  const compatible: string[] = [];

  // Same key
  compatible.push(key);

  // Same letter, adjacent numbers (±1)
  const prevNum = number === 1 ? 12 : number - 1;
  const nextNum = number === 12 ? 1 : number + 1;
  compatible.push(`${prevNum}${letter}`);
  compatible.push(`${nextNum}${letter}`);

  // Relative major/minor (same number, opposite letter)
  const oppositeLetterKey = `${number}${letter === 'A' ? 'B' : 'A'}`;
  compatible.push(oppositeLetterKey);

  return compatible;
}

/**
 * Convert a Camelot key to its musical equivalent (e.g., "8A" → "Am").
 *
 * @param camelot - Camelot key (e.g., "8A")
 * @returns Musical key (e.g., "A minor", "C major")
 *
 * @example
 * const musical = camelotToMusical("8A");
 * // Returns: "A minor"
 */
export function camelotToMusical(camelot: string): string {
  const key = CAMELOT_WHEEL[camelot];
  if (!key) {
    throw new Error(`Invalid Camelot key: ${camelot}`);
  }
  return key.musical;
}

/**
 * Convert a musical key to its Camelot equivalent (e.g., "A minor" → "8A").
 *
 * @param musical - Musical key (e.g., "A minor", "C major")
 * @returns Camelot key (e.g., "8A")
 *
 * @example
 * const camelot = musicalToCamelot("A minor");
 * // Returns: "8A"
 */
export function musicalToCamelot(musical: string): string {
  const key = MUSICAL_TO_CAMELOT[musical];
  if (!key) {
    throw new Error(`Unknown musical key: ${musical}`);
  }
  return key;
}

/**
 * Calculate the distance between two Camelot keys on the wheel.
 *
 * The Camelot wheel is circular, so the distance is the minimum of the
 * clockwise and counter-clockwise distances.
 *
 * @param keyA - First Camelot key
 * @param keyB - Second Camelot key
 * @returns Distance in semitones (0-6, since 12 semitones = full octave)
 */
function camelotDistance(keyA: string, keyB: string): number {
  const parsedA = parseCamelotKey(keyA);
  const parsedB = parseCamelotKey(keyB);

  if (!parsedA || !parsedB) {
    throw new Error('Invalid Camelot key');
  }

  // Convert to positions on wheel
  const posA = parsedA.number + (parsedA.letter === 'B' ? 0.5 : 0);
  const posB = parsedB.number + (parsedB.letter === 'B' ? 0.5 : 0);

  // Calculate distance (minimum of forward and backward)
  let distance = Math.abs(posA - posB);
  if (distance > 12) {
    distance = 24 - distance;
  }

  // Convert Camelot positions to semitones (each position = 0.5 semitones)
  return distance * 0.5;
}

/**
 * Calculate the harmonic compatibility between two tracks when played at a target BPM.
 *
 * This is the core DJ mixing function. It calculates what key each track sounds like
 * when pitched to the target BPM, then checks if they're harmonically compatible.
 *
 * Compatibility rules:
 * - Perfect: same effective key (±10 cents)
 * - Good: adjacent Camelot numbers with same letter, or relative major/minor (±10-25 cents)
 * - Acceptable: ±2 on wheel or energy transition, (±25-40 cents)
 * - Risky: further apart (±40-50 cents)
 * - Clashing: >50 cents or >2 steps away (direct clash)
 *
 * @param trackA - First track with key and BPM
 * @param trackB - Second track with key and BPM
 * @param targetBpm - The BPM both tracks will be played at
 * @returns Harmonic compatibility assessment
 *
 * @example
 * const result = checkHarmonicCompatibility(
 *   { key: "8A", bpm: 120 },
 *   { key: "9A", bpm: 120 },
 *   120
 * );
 * // Returns: { compatible: true, quality: "perfect", ... }
 */
export function checkHarmonicCompatibility(
  trackA: { key: string; bpm: number },
  trackB: { key: string; bpm: number },
  targetBpm: number
): HarmonicCompatibilityResult {
  // Calculate effective keys at target BPM
  const effectiveA = getEffectiveKey(trackA.key, trackA.bpm, targetBpm);
  const effectiveB = getEffectiveKey(trackB.key, trackB.bpm, targetBpm);

  // Calculate distance between effective keys
  const distance = camelotDistance(effectiveA.effectiveKey, effectiveB.effectiveKey);
  const combinedCentsOff = Math.abs(effectiveA.centsFromNearest) + Math.abs(effectiveB.centsFromNearest);

  // Determine compatibility based on distance and cent offset
  let compatible: boolean;
  let quality: 'perfect' | 'good' | 'acceptable' | 'risky' | 'clashing';

  if (distance === 0 && combinedCentsOff <= 20) {
    compatible = true;
    quality = 'perfect';
  } else if (distance <= 1 && combinedCentsOff <= 50) {
    compatible = true;
    quality = 'good';
  } else if (distance <= 2 && combinedCentsOff <= 80) {
    compatible = true;
    quality = 'acceptable';
  } else if (distance <= 3 && combinedCentsOff <= 100) {
    compatible = true;
    quality = 'risky';
  } else {
    compatible = false;
    quality = 'clashing';
  }

  // Build human-readable explanation
  const pitchChangeB = calculatePitchShift(trackB.bpm, targetBpm);
  const pitchChangePercentNum = pitchChangeB.percentChange * 100;
  const pitchChangePercent = pitchChangePercentNum.toFixed(1);
  const explanation =
    `Track B pitched ${pitchChangePercentNum > 0 ? '+' : ''}${pitchChangePercent}% ` +
    `shifts from ${trackB.key} to ~${effectiveB.effectiveKey} ` +
    `(${effectiveB.centsFromNearest > 0 ? '+' : ''}${effectiveB.centsFromNearest.toFixed(0)} cents) — ` +
    `${quality} match with Track A at ${trackA.key}`;

  return {
    compatible,
    quality,
    trackAEffective: { key: effectiveA.effectiveKey, centsOff: effectiveA.centsFromNearest },
    trackBEffective: { key: effectiveB.effectiveKey, centsOff: effectiveB.centsFromNearest },
    explanation,
    combinedCentsOff,
  };
}

/**
 * Check if two track durations are compatible for mixing.
 *
 * Compatibility is based on ratio:
 * - Ideal: within 15% (ratio 0.85-1.15)
 * - Good: within 25% (ratio 0.75-1.25)
 * - Acceptable: within 40% (ratio 0.6-1.4)
 * - Poor: >40% difference
 *
 * @param durationA - Duration of track A in seconds
 * @param durationB - Duration of track B in seconds
 * @returns Duration compatibility assessment
 *
 * @example
 * const compatible = checkDurationCompatibility(240, 250); // 4 min vs 4:10
 * // Returns: { compatible: true, ratio: 1.042, quality: "ideal" }
 */
export function checkDurationCompatibility(
  durationA: number,
  durationB: number
): DurationCompatibilityResult {
  if (durationA <= 0 || durationB <= 0) {
    throw new Error('Durations must be positive');
  }

  const ratio = durationB / durationA;
  const percentDiff = Math.abs(ratio - 1) * 100;

  let quality: 'ideal' | 'good' | 'acceptable' | 'poor';
  if (percentDiff <= 15) quality = 'ideal';
  else if (percentDiff <= 25) quality = 'good';
  else if (percentDiff <= 40) quality = 'acceptable';
  else quality = 'poor';

  // Compatible if not "poor"
  const compatible = quality !== 'poor';

  return { compatible, ratio, quality };
}

/**
 * Calculate a BPM range with a given tolerance.
 *
 * Useful for finding tracks that are close to a target BPM without exact matches.
 *
 * @param bpm - Target BPM
 * @param tolerance - Tolerance in BPM (e.g., 3 for ±3 BPM)
 * @returns Min and max BPM in range
 *
 * @example
 * const range = bpmRange(123, 3);
 * // Returns: { min: 120, max: 126 }
 */
export function bpmRange(bpm: number, tolerance: number): { min: number; max: number } {
  if (bpm <= 0 || tolerance < 0) {
    throw new Error('BPM and tolerance must be positive');
  }

  return {
    min: Math.max(1, bpm - tolerance),
    max: bpm + tolerance,
  };
}

/**
 * Calculate a comprehensive mix recommendation score for two tracks.
 *
 * The score combines:
 * - Harmonic compatibility (40% weight): most important for DJ mixing
 * - BPM proximity (25% weight): less pitch shift = less key distortion
 * - Energy flow (20% weight): smooth energy transitions preferred
 * - Duration compatibility (15% weight): similar lengths help with phrasing
 *
 * @param currentTrack - Currently playing track
 * @param candidateTrack - Candidate next track
 * @param targetBpm - The BPM both tracks will be played at
 * @returns Mix score with breakdown
 *
 * @example
 * const score = calculateMixScore(
 *   { key: "8A", bpm: 120, energy: 60, duration: 240 },
 *   { key: "9A", bpm: 122, energy: 65, duration: 250 },
 *   120
 * );
 * // Returns: { overallScore: 87, harmonicScore: 95, bpmScore: 90, ... }
 */
export function calculateMixScore(
  currentTrack: TrackMetadata,
  candidateTrack: TrackMetadata,
  targetBpm: number
): MixScoreResult {
  // 1. Harmonic compatibility (40% weight)
  const harmonic = checkHarmonicCompatibility(
    { key: currentTrack.key, bpm: currentTrack.bpm },
    { key: candidateTrack.key, bpm: candidateTrack.bpm },
    targetBpm
  );

  const harmonicScoreMap: Record<string, number> = {
    perfect: 100,
    good: 85,
    acceptable: 60,
    risky: 30,
    clashing: 0,
  };
  const harmonicScore = harmonicScoreMap[harmonic.quality] ?? 0;

  // 2. BPM proximity (25% weight)
  // Score is highest when BPMs are close, decreases with distance
  const bpmDifference = Math.abs(currentTrack.bpm - candidateTrack.bpm);
  const bpmScore = Math.max(0, 100 - bpmDifference * 2); // 0% change = 100, 50 BPM diff = 0

  // 3. Energy flow (20% weight)
  // Prefer tracks at similar energy levels — penalize mismatches heavily
  // Energy is on a 0.0-1.0 scale, so multiply by 250 to get meaningful penalties
  // 0.0 diff = 100, 0.1 diff = 75, 0.2 diff = 50, 0.3 diff = 25, 0.4+ diff = 0
  let energyScore = 50; // Neutral if energy not provided
  if (currentTrack.energy !== undefined && candidateTrack.energy !== undefined) {
    const energyDiff = Math.abs(currentTrack.energy - candidateTrack.energy);
    energyScore = Math.max(0, 100 - energyDiff * 250);
  }

  // 4. Duration compatibility (15% weight)
  let durationScore = 50; // Neutral if duration not provided
  if (currentTrack.duration !== undefined && candidateTrack.duration !== undefined) {
    const duration = checkDurationCompatibility(currentTrack.duration, candidateTrack.duration);
    const durationScoreMap: Record<string, number> = {
      ideal: 100,
      good: 80,
      acceptable: 50,
      poor: 10,
    };
    durationScore = durationScoreMap[duration.quality] ?? 50;
  }

  // Calculate weighted overall score
  const overallScore = Math.round(
    harmonicScore * 0.4 + bpmScore * 0.25 + energyScore * 0.2 + durationScore * 0.15
  );

  // Build breakdown explanation
  const breakdown =
    `Harmonic: ${harmonicScore}/100 (${harmonic.quality}) | ` +
    `BPM: ${bpmScore.toFixed(0)}/100 (${bpmDifference} BPM diff) | ` +
    `Energy: ${energyScore.toFixed(0)}/100 | ` +
    `Duration: ${durationScore}/100\n\n` +
    `${harmonic.explanation}`;

  return {
    overallScore,
    harmonicScore,
    bpmScore: Math.round(bpmScore),
    energyScore: Math.round(energyScore),
    durationScore,
    breakdown,
  };
}

/**
 * Get all keys within a certain musical distance from the given key.
 *
 * Useful for finding alternative harmonic options when exact matches aren't available.
 *
 * @param key - Starting Camelot key
 * @param maxDistance - Maximum semitone distance (0-6 typical range)
 * @returns Array of keys sorted by distance
 *
 * @example
 * const nearby = getKeysWithinDistance("8A", 2);
 * // Returns: ["8A", "8B", "7A", "9A", "9B", "7B"] (in distance order)
 */
export function getKeysWithinDistance(key: string, maxDistance: number): string[] {
  const result: Array<{ key: string; distance: number }> = [];

  // Check all 24 keys
  for (const candidateKey of Object.keys(CAMELOT_WHEEL)) {
    const distance = camelotDistance(key, candidateKey);
    if (distance <= maxDistance) {
      result.push({ key: candidateKey, distance });
    }
  }

  // Sort by distance
  result.sort((a, b) => a.distance - b.distance);

  return result.map((item) => item.key);
}

/**
 * Get detailed information about a Camelot key.
 *
 * @param key - Camelot key (e.g., "8A")
 * @returns Full key information including musical equivalent and chromatic position
 *
 * @example
 * const keyInfo = getKeyInfo("8A");
 * // Returns: { number: 8, letter: 'A', musical: 'A minor', chromaticPosition: 9, ... }
 */
export function getKeyInfo(key: string): CamelotKey {
  const keyInfo = CAMELOT_WHEEL[key];
  if (!keyInfo) {
    throw new Error(`Invalid Camelot key: ${key}`);
  }
  return keyInfo;
}

/**
 * Validate a Camelot key string.
 *
 * @param key - String to validate
 * @returns True if valid Camelot key (e.g., "8A")
 *
 * @example
 * isValidCamelotKey("8A")  // true
 * isValidCamelotKey("8C")  // false
 * isValidCamelotKey("15A") // false
 */
export function isValidCamelotKey(key: string): boolean {
  return parseCamelotKey(key) !== null && key in CAMELOT_WHEEL;
}

/**
 * Get all 24 Camelot keys in wheel order.
 *
 * Useful for UI displays, exports, and comprehensive key listings.
 *
 * @returns Array of all 24 Camelot keys
 *
 * @example
 * const allKeys = getAllCamelotKeys();
 * // Returns: ["1A", "1B", "2A", "2B", ..., "12A", "12B"]
 */
export function getAllCamelotKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 12; i++) {
    keys.push(`${i}A`);
    keys.push(`${i}B`);
  }
  return keys;
}

/**
 * Calculate the optimal target BPM for mixing two tracks with minimal key distortion.
 *
 * When mixing two tracks at different BPMs, the DJ must choose which BPM to use.
 * This function finds the BPM that minimizes the combined pitch shift and key distortion.
 *
 * @param trackA - First track with key and BPM
 * @param trackB - Second track with key and BPM
 * @returns Optimal target BPM and the quality of the mix at that BPM
 *
 * @example
 * const optimal = getOptimalTargetBpm(
 *   { key: "8A", bpm: 120 },
 *   { key: "9A", bpm: 122 }
 * );
 * // Returns: { targetBpm: 120, quality: "good", costA: 0, costB: 20 }
 */
export function getOptimalTargetBpm(
  trackA: { key: string; bpm: number },
  trackB: { key: string; bpm: number }
): {
  targetBpm: number;
  quality: 'perfect' | 'good' | 'acceptable' | 'risky' | 'clashing';
  costA: number; // Cents distortion for track A
  costB: number; // Cents distortion for track B
} {
  // Try a range of BPMs around the original ones
  const bpmOptions = new Set<number>();
  [trackA.bpm, trackB.bpm].forEach((bpm) => {
    for (let offset = -10; offset <= 10; offset++) {
      bpmOptions.add(Math.round(bpm + offset));
    }
  });

  let bestBpm = trackA.bpm;
  let bestCost = Infinity;
  let bestQuality: 'perfect' | 'good' | 'acceptable' | 'risky' | 'clashing' = 'clashing';
  let bestCostA = 0;
  let bestCostB = 0;

  for (const targetBpm of Array.from(bpmOptions)) {
    const result = checkHarmonicCompatibility(trackA, trackB, targetBpm);

    // Cost is the combined distortion
    const cost = result.combinedCentsOff;

    if (cost < bestCost) {
      bestCost = cost;
      bestBpm = targetBpm;
      bestQuality = result.quality;
      bestCostA = Math.abs(result.trackAEffective.centsOff);
      bestCostB = Math.abs(result.trackBEffective.centsOff);
    }
  }

  return {
    targetBpm: bestBpm,
    quality: bestQuality,
    costA: bestCostA,
    costB: bestCostB,
  };
}
