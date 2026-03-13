# CrateMate Recommendation Engine
## The Intelligent Heart of DJ Track Discovery

**Last Updated**: 2026-03-12
**Status**: Design specification & implementation guide
**Audience**: Developers, AI engineers, DJ collaborators

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Scoring System](#scoring-system)
4. [Claude Prompt Engineering](#claude-prompt-engineering)
5. [Validation Pipeline](#validation-pipeline)
6. [Set-Level Intelligence](#set-level-intelligence)
7. [Music Theory & Harmonic Compatibility](#music-theory--harmonic-compatibility)
8. [Integration Points](#integration-points)
9. [Feedback & Refinement Loop](#feedback--refinement-loop)
10. [Future Enhancements](#future-enhancements)

---

## Philosophy

CrateMate's recommendation engine teaches Claude to think like a **DJ who mixes by ear**. This is fundamentally different from a generic music recommendation algorithm. A DJ doesn't just think about genre similarity—they think about whether tracks will actually *play together*.

### Core Principles

#### 1. Harmonic Compatibility Is Context-Dependent
- The Camelot wheel is a starting point, not the destination
- A track's key doesn't exist in isolation—it exists at a specific BPM
- When you pitch a track up or down to match the set's BPM, the key **actually shifts**
- We must calculate the **effective key** at the target BPM, not assume the written key is immutable

#### 2. Pitch Shifting Changes Everything
- DJs regularly pitch tracks ±8% to blend sets
- At 2% pitch shift: key stays essentially the same
- At 6% pitch shift: key shifts by ~1 semitone
- At 8% pitch shift: key shifts by ~1.3 semitones
- Ignoring this leads to recommending "compatible" tracks that clash when actually mixed

#### 3. Energy Flow Is the Invisible Architecture
- A DJ set has a shape: warm-up → build → peak → cool-down (or variations on this)
- Recommend tracks that respect this arc, not just individual harmonic compatibility
- Energy transitions must feel smooth or intentionally jarring (depending on DJ intent)
- Track duration contributes to energy perception—a 5-minute ambient track feels different than a 5-minute peak-time banger

#### 4. Lineage Matters
- Tracks from the same label often share sonic DNA (compression, EQ, production aesthetic)
- Artist collaborations and remix relationships reveal compatible sounds
- A remix of a track already in the playlist is often a natural follow-up
- Regional scenes (UK garage, Berlin techno, Detroit house) cluster with similar labels

#### 5. Minimum Friction Mixing
- Less pitch adjustment = cleaner harmonic blend = more professional sound
- Two tracks at nearly identical BPM sound better pitched up/down than two tracks far apart
- Duration similarity = set flow consistency
- The ideal recommendation needs minimal production work—it should feel like it "just plays"

---

## Architecture Overview

The recommendation engine operates in four phases:

```
[Playlist Input]
    ↓
[Phase 1: Analysis]  ← Claude generates playlist DNA & energy profile
    ↓
[Phase 2: Generation] ← Claude suggests 30 candidate tracks with reasoning
    ↓
[Phase 3: Validation] ← Search Spotify/Beatport for existence & metadata
    ↓
[Phase 4: Scoring] ← Calculate harmonic, BPM, energy, duration scores
    ↓
[Top-N Results] ← Return ranked recommendations with breakdowns
```

### Key Design Decisions

- **Over-generation**: Claude generates 30+ candidates. Most will be hallucinated or unmixable. Validation + scoring filters ruthlessly.
- **Two-stage validation**: First, confirm the track exists (Spotify, Beatport). Second, confirm it scores well enough to recommend.
- **Transparent scoring**: Every recommendation shows its harmonic compatibility, BPM mismatch, energy delta, and duration variance. Users learn *why* a track is recommended.
- **Set context**: Recommendations adjust based on where in the set the new track will be. A warm-up track looks different than a peak-time track.

---

## Scoring System

Each candidate track is evaluated against the **current set context** (last added track, set energy trajectory, dominant keys/BPMs). The final score is a weighted blend of four dimensions.

### Overall Score Formula

```
overallScore = (
  (harmonicScore × 0.40) +
  (bpmScore × 0.25) +
  (energyScore × 0.20) +
  (durationScore × 0.15)
) × contextMultiplier
```

**Minimum acceptable score**: 50/100 (anything below this is not recommended)

---

### 1. Harmonic Score (40% Weight)

Harmonic compatibility is the heaviest weighted factor because it's the foundation of a clean mix.

#### Step 1: Calculate Effective Key at Target BPM

When a DJ pitches a track, the key shifts mathematically. We must account for this.

**Formula**:
```
semitones_shifted = 12 × log₂(targetBPM / originalBPM)
effectiveKey = originalKey + semitones_shifted
```

**Example**:
- Original track: 120 BPM, Key 1A (C major)
- Target BPM: 128 BPM (a DJ might pitch up 6.7%)
- Semitones shifted: 12 × log₂(128/120) = 12 × 0.0566 = 0.68 semitones
- Effective key: 1A + 0.68 semitones = somewhere between 1A and 2A
- **Map back to nearest Camelot position**: 1A (closer than 2A)

#### Step 2: Evaluate Camelot Wheel Compatibility

Reference the standard Camelot wheel (1A–12B cycle):

| Relationship | Camelot Distance | Score | DJ Name | Reasoning |
|---|---|---|---|---|
| Identical key | 0 | **100** | Perfect match | Same key, play at same tempo |
| Adjacent (±1) | 1 position | **90** | Energy shift | Smooth transition, subtle energy change |
| Relative major/minor | Same number, A↔B | **85** | Color shift | Same harmonic center, different mood |
| ±2 positions | 2 steps | **60** | Transition zone | Noticeable energy shift, some dissonance possible |
| ±3 positions | 3 steps | **30** | Risky | Dissonance likely, only for dramatic peaks |
| Opposite side (6 steps away) | 6 steps | **0** | Clash | Avoid—guaranteed dissonance |

#### Step 3: Apply Cents Deviation Penalty

Even if the key maps to the correct Camelot position, the track might sit slightly sharp or flat relative to that position. This is measured in **cents** (1/100th of a semitone).

| Cents from Nearest Key | Penalty | Intuition |
|---|---|---|
| 0–10 cents | 0 | Dead center, no adjustment needed |
| 10–25 cents | −5 | Slight detuning, minor adjustment |
| 25–40 cents | −15 | Noticeable, requires attention |
| 40–50 cents | −25 | Sounds off, DJ would need to retune |
| 50+ cents | −40 | Halfway to the next key, basically incompatible |

**Final Harmonic Score**:
```
harmonicScore = camelotBaseScore − centsPenalty
```

**Clamped to**: 0–100

#### Harmonic Score Examples

**Example A**: 120 BPM, 1A → 128 BPM, 1A (±5 cents)
- Camelot match: 100 (identical)
- Cents penalty: 0 (within 10 cents)
- **Harmonic Score: 100** ✓

**Example B**: 120 BPM, 1A → 128 BPM, 2A (pitched up to adjacent key, −15 cents)
- Camelot match: 90 (adjacent)
- Cents penalty: 0 (within 10 cents)
- **Harmonic Score: 90** ✓

**Example C**: 120 BPM, 1A → 128 BPM, 6A (opposite, +40 cents)
- Camelot match: 0 (clash)
- Cents penalty: −25 (cents deviation)
- **Harmonic Score: 0** ✗ (Do not recommend)

---

### 2. BPM Score (25% Weight)

BPM proximity determines how much pitch adjustment is required, which directly impacts mix quality.

**Formula**:
```
bpmDifference = |candidateBPM − setTargetBPM|
percentageDifference = (bpmDifference / setTargetBPM) × 100
```

| BPM Difference | % at 120 BPM | Score | Pitch Adjustment | DJ Experience |
|---|---|---|---|---|
| ±0–2 | ±0.0–1.7% | **100** | Minimal | Virtually no adjustment, sounds natural |
| ±2–4 | ±1.7–3.3% | **85** | Subtle | Small adjustment, imperceptible to many |
| ±4–6 | ±3.3–5.0% | **65** | Moderate | DJ adjusts, some listeners notice |
| ±6–8 | ±5.0–6.7% | **40** | Significant | Clear adjustment, key may shift noticeably |
| >±8 | >±6.7% | **10** | Extreme | Too much stretch, sounds unnatural |

**Reasoning**: DJs typically pitch tracks within ±8%. Beyond that, the mix starts to sound stretched or compressed.

#### BPM Score Examples

**Example A**: Set at 120 BPM, candidate at 121 BPM
- Difference: 1 BPM (0.8%)
- **BPM Score: 100** ✓

**Example B**: Set at 120 BPM, candidate at 127 BPM
- Difference: 7 BPM (5.8%)
- **BPM Score: 40** ⚠️ (Acceptable but requires noticeable pitch shift)

**Example C**: Set at 120 BPM, candidate at 135 BPM
- Difference: 15 BPM (12.5%)
- **BPM Score: 10** ✗ (Too far, don't recommend)

---

### 3. Energy Score (20% Weight)

Energy is the emotional and intensity arc of a set. Smooth transitions feel intentional; jarring jumps feel like mistakes.

**Formula**:
```
energyDifference = |candidateEnergy − setCurrentEnergy|
energyTrend = setEnergyTrajectory (0=cooling, 1=building, 0.5=maintaining)
```

| Energy Delta | Score | DJ Intent | Vibe |
|---|---|---|---|
| ±0.0–0.05 | **100** | Maintaining | Seamless continuation of current energy |
| +0.05 to +0.15 | **90** | Building | Gradual intensity increase (great for rising tension) |
| −0.05 to −0.15 | **75** | Cooling | Gentle energy let-down (safe for breathers) |
| ±0.15–0.20 | **40** | Transitional | Noticeable jump, feels intentional but risky |
| >±0.20 | **10** | Jarring | Clumsy energy shift, sounds like DJ made a mistake |

#### Context Modifier

Energy scoring adjusts based on the set's trajectory:

- **Building phase** (set energy increasing): Prefer positive energy deltas. +0.10 energy bump scores 90, but −0.10 scores 50.
- **Cooling phase** (set energy decreasing): Prefer negative energy deltas. −0.10 cooldown scores 85, but +0.10 scores 40.
- **Maintaining phase** (flat energy): Energy-neutral tracks score highest.

#### Energy Score Examples

**Example A**: Set at 0.65 energy, building trend, candidate at 0.72 energy
- Delta: +0.07
- Modifier: +building trend = desired direction
- **Energy Score: 90** ✓

**Example B**: Set at 0.65 energy, cooling trend, candidate at 0.62 energy
- Delta: −0.03
- Modifier: −cooling trend = slight slowdown (acceptable)
- **Energy Score: 80** ✓

**Example C**: Set at 0.65 energy, maintaining trend, candidate at 0.30 energy (ambient)
- Delta: −0.35
- Modifier: No trend alignment
- **Energy Score: 10** ✗ (Too much of a drop)

---

### 4. Duration Score (15% Weight)

Track duration affects set flow and energy perception. A 5-minute track followed by an 8-minute track feels disjointed.

**Formula**:
```
durationDifference = |candidateDuration − setAverageDuration|
percentageDifference = (durationDifference / setAverageDuration) × 100
```

| Difference | % at 6 min avg | Score | DJ Experience |
|---|---|---|---|
| 0–15% | 0–0.9 min | **100** | Natural flow, consistent pacing |
| 15–25% | 0.9–1.5 min | **80** | Slightly shorter/longer, still feels okay |
| 25–40% | 1.5–2.4 min | **55** | Noticeable, may feel abrupt or bloated |
| >40% | >2.4 min | **25** | Jarring length mismatch, disrupts flow |

#### Duration Score Examples

**Example A**: Set average 6.5 min, candidate 6.3 min
- Difference: 0.2 min (3%)
- **Duration Score: 100** ✓

**Example B**: Set average 6.5 min, candidate 7.8 min
- Difference: 1.3 min (20%)
- **Duration Score: 80** ✓

**Example C**: Set average 6.5 min, candidate 10.5 min
- Difference: 4 min (61%)
- **Duration Score: 20** ✗ (Too long)

---

### Context Multiplier

The overall score can be adjusted based on broader set context:

- **Variety multiplier**: If the candidate is from an artist already in the set, apply ×0.85 multiplier (slight penalty for redundancy).
- **Label affinity multiplier**: If the candidate is from a label very similar to existing tracks, apply ×0.95 multiplier.
- **Genre fit multiplier**: If the candidate's genre doesn't match the set's dominant genre, apply ×0.70 multiplier.

---

### Scoring Summary Table

| Dimension | Weight | Range | Minimum Acceptable |
|---|---|---|---|
| Harmonic | 40% | 0–100 | 40/100 (avoid clashes) |
| BPM | 25% | 0–100 | 40/100 (no extreme stretches) |
| Energy | 20% | 0–100 | 10/100 (any transition possible) |
| Duration | 15% | 0–100 | 25/100 (some length mismatch okay) |
| **Overall** | **100%** | **0–100** | **50/100** (basic playability) |

---

## Claude Prompt Engineering

The recommendation engine relies on Claude to generate candidates and explain reasoning. The prompt is carefully structured to avoid hallucination while encouraging creative thinking.

### System Prompt Structure

```
You are a veteran DJ curator with 15+ years of experience in electronic music.
You understand harmonic mixing, energy flow, and the subtle sonic qualities that
make tracks work together in a DJ set.

Your task is to recommend tracks that would naturally follow or complement the
given playlist. Think like a DJ mixing by ear—you're not just recommending
similar-sounding tracks, you're recommending tracks that will actually PLAY
together without clashing.

Key principles you follow:
1. Harmonic compatibility: Use the Camelot wheel, but remember that when you
   pitch a track up or down to match BPM, the key shifts. A track at 120 BPM
   in key 1A sounds like it's in key 1A+0.68 semitones when pitched to 128 BPM.

2. BPM proximity: Recommend tracks within ±8 BPM of the set's target pace.
   Beyond that, the mix sounds stretched or compressed.

3. Energy arc: Consider the set's energy trajectory. If it's building, recommend
   tracks that continue building. If it's cooling, suggest gentler tracks.

4. Duration: Recommend tracks of similar length to the set's average. A 5-minute
   track followed by an 8-minute track disrupts the flow.

5. Lineage: Prefer tracks from similar labels, artists, and regional scenes.
   Lineage often correlates with sonic compatibility.

6. Existence: Only recommend tracks you are confident actually exist. If you're
   not 100% sure a track is real, don't include it.

You will be given:
- The playlist DNA (genre mix, energy profile, dominant keys/BPMs, labels, artists)
- The set's current energy level and trajectory
- The target BPM range
- Recent tracks (last 3 added) for immediate context

Your output will be a JSON array of 20–30 candidate tracks, each with:
{
  "title": "Track Title",
  "artist": "Artist Name",
  "estimatedBPM": 125,
  "estimatedKey": "1A",
  "estimatedEnergy": 0.72,
  "estimatedDuration": 6.5,
  "label": "Brainfeeder",
  "reasoning": "This track shares the deep, broken-beat aesthetic of your set..."
}

IMPORTANT: Every recommendation must include a one-sentence "reasoning" that
explains why it works. This helps us filter hallucinations and understand
Claude's thinking.
```

### Few-Shot Examples

Include 2–3 examples of good recommendations in the prompt:

```
Example 1:
Input set: [120 BPM breakbeats with jazzy harmony, artists like Calibre and Logistics]
Input context: Set is building, currently at 0.65 energy, last track was 1A at 120 BPM

Recommendation:
{
  "title": "Untrue",
  "artist": "Burial",
  "estimatedBPM": 122,
  "estimatedKey": "1A",
  "estimatedEnergy": 0.70,
  "estimatedDuration": 5.8,
  "label": "Hyperdub",
  "reasoning": "Burial's micro-edited beats and warped pad textures complement jazzy breakbeats.
               Similar BPM allows minimal pitch adjustment. Building energy fits the arc."
}

Why this works:
- BPM (122 vs 120): Only 1.7% difference, zero pitch adjustment needed → Score 100
- Key (1A vs 1A): Identical → Score 100
- Energy (0.70 vs 0.65): +0.05 delta, matches building trend → Score 90
- Duration (5.8 min): Matches set average → Score 100
- Label (Hyperdub vs Calibre/Logistics): Not identical label but adjacent underground scene → 0.95 multiplier
- OVERALL: (100×0.4 + 100×0.25 + 90×0.2 + 100×0.15) × 0.95 = 98.5 → Excellent recommendation
```

### Key Prompt Techniques

1. **Pitch-adjusted key concept**: Explicitly explain the math in the prompt. DJs understand BPM pitching; Claude needs to learn the key-shifting consequence.

2. **Explain the "why"**: Ask Claude to include reasoning for every track. One-sentence explanations filter hallucinations (fake tracks don't have plausible reasoning).

3. **Over-generate**: Request 30 candidates, knowing ~40% will be invalid or low-scoring. The validation pipeline filters them.

4. **Avoid jargon confusion**: Don't say "compatible key." Say "plays without clashing because the harmonic center aligns."

5. **Set constraints**: Tell Claude to only recommend tracks it's "confident actually exist." Real tracks have clear provenance.

6. **Persona**: Establish Claude as a "veteran DJ curator," not a generic music recommender. This changes the reasoning style.

---

## Validation Pipeline

After Claude generates candidates, they undergo two validation phases: **Existence Validation** and **Score Filtering**.

### Phase 1: Existence Validation

Each candidate is confirmed to exist via Spotify API.

```typescript
async function validateTrack(candidate: Candidate): Promise<ValidatedTrack | null> {
  // Search Spotify for: "{artist} - {title}"
  const spotifyResult = await searchSpotify(`${candidate.artist} ${candidate.title}`);

  if (!spotifyResult) {
    // Track not found—likely hallucinated. Discard.
    return null;
  }

  // Track exists. Extract metadata.
  return {
    title: spotifyResult.name,
    artist: spotifyResult.artists[0].name,
    spotifyId: spotifyResult.id,
    duration: spotifyResult.duration_ms / 1000, // Convert to seconds
    album: spotifyResult.album.name,
    label: spotifyResult.album.label || "Unknown",
    albumArt: spotifyResult.album.images[0]?.url,
    // Retain Claude's estimates for BPM, key, energy
    estimatedBPM: candidate.estimatedBPM,
    estimatedKey: candidate.estimatedKey,
    estimatedEnergy: candidate.estimatedEnergy,
  };
}
```

**Survival Rate**: ~60% of Claude's candidates survive this step. The rest were hallucinated or mis-attributed.

### Phase 2: Beatport Enrichment (Optional)

If Beatport token is available in localStorage, enrich validated tracks with:
- Actual measured BPM (often more accurate than estimates)
- Actual Camelot key
- Label name (for lineage analysis)
- Catalog number
- Buy link

```typescript
async function enrichWithBeatport(
  validatedTrack: ValidatedTrack,
  beatportToken: string
): Promise<EnrichedTrack> {
  const beatportResult = await searchBeatport(
    `${validatedTrack.artist} ${validatedTrack.title}`,
    beatportToken
  );

  if (beatportResult) {
    return {
      ...validatedTrack,
      actualBPM: beatportResult.bpm,
      actualKey: beatportResult.camelotKey,
      label: beatportResult.label,
      catalogNumber: beatportResult.catalogNumber,
      beatportUrl: beatportResult.url,
      enrichedFrom: "beatport",
    };
  }

  // Beatport not available or track not found. Return with estimates only.
  return { ...validatedTrack, enrichedFrom: "spotify" };
}
```

---

### Phase 3: Score Calculation

For each validated (and optionally enriched) track:

1. **Get set context**: Last 3 tracks, average BPM, average energy, average duration, dominant keys, label distribution
2. **Calculate harmonic score**: Using actual key (if Beatport enriched) or estimate (if Spotify only)
3. **Calculate BPM score**: Using actual BPM or estimate
4. **Calculate energy score**: Using estimate (no ground truth available)
5. **Calculate duration score**: Using actual duration from Spotify/Beatport
6. **Apply context multipliers**: Adjust for artist/label redundancy, genre fit
7. **Rank by overall score**: Sort descending
8. **Filter by threshold**: Remove any track with score < 50

```typescript
function calculateMixScore(
  candidate: EnrichedTrack,
  setContext: SetContext
): MixScore {
  const setTargetBPM = setContext.recentTracks[0].bpm;
  const currentEnergy = setContext.recentTracks[0].energy;
  const setEnergyTrend = calculateEnergyTrend(setContext.recentTracks);
  const avgDuration = mean(setContext.recentTracks.map(t => t.duration));

  // Harmonic Score
  const semitones = 12 * Math.log2(candidate.bpm / candidate.originalBPM);
  const effectiveKey = shiftCamelotKey(candidate.key, semitones);
  const camelotDistance = calculateCamelotDistance(
    effectiveKey,
    setContext.dominantKey
  );
  const camelotScore = getCamelotScore(camelotDistance);
  const centsPenalty = getCentsPenalty(candidate.keyDeviation);
  const harmonicScore = Math.max(0, camelotScore - centsPenalty);

  // BPM Score
  const bpmDiff = Math.abs(candidate.bpm - setTargetBPM);
  const bpmScore = getBPMScore(bpmDiff, setTargetBPM);

  // Energy Score
  const energyDiff = Math.abs(candidate.energy - currentEnergy);
  const energyScore = getEnergyScore(energyDiff, setEnergyTrend);

  // Duration Score
  const durationDiff = Math.abs(candidate.duration - avgDuration);
  const durationScore = getDurationScore(durationDiff, avgDuration);

  // Apply context multipliers
  const varietyMultiplier = hasArtist(setContext, candidate.artist) ? 0.85 : 1.0;
  const genreMultiplier = matchesGenre(setContext, candidate.genre) ? 1.0 : 0.7;

  const weighted =
    harmonicScore * 0.4 +
    bpmScore * 0.25 +
    energyScore * 0.2 +
    durationScore * 0.15;

  const final = weighted * varietyMultiplier * genreMultiplier;

  return {
    overall: Math.round(final),
    harmonic: Math.round(harmonicScore),
    bpm: Math.round(bpmScore),
    energy: Math.round(energyScore),
    duration: Math.round(durationScore),
    breakdown: {
      harmonicReasoning: `${camelotDistance}-step Camelot distance, ${centsPenalty} cents penalty`,
      bpmReasoning: `${bpmDiff} BPM difference (${((bpmDiff/setTargetBPM)*100).toFixed(1)}%)`,
      energyReasoning: `+${energyDiff.toFixed(2)} energy delta (${setEnergyTrend})`,
      durationReasoning: `${Math.abs(candidate.duration - avgDuration).toFixed(1)} min difference`,
    },
  };
}
```

---

### Return Format

The final API response includes all scoring breakdowns:

```json
{
  "recommendations": [
    {
      "rank": 1,
      "title": "Untrue",
      "artist": "Burial",
      "spotifyId": "...",
      "bpm": 122,
      "key": "1A",
      "energy": 0.70,
      "duration": 5.8,
      "label": "Hyperdub",
      "albumArt": "...",
      "enrichedFrom": "beatport",
      "mixScore": {
        "overall": 94,
        "harmonic": 100,
        "bpm": 100,
        "energy": 90,
        "duration": 100,
        "breakdown": {
          "harmonicReasoning": "0-step Camelot distance (identical key)",
          "bpmReasoning": "2 BPM difference (1.7%)",
          "energyReasoning": "+0.05 energy delta (building trend)",
          "durationReasoning": "0.2 min difference (3%)"
        }
      },
      "reasoning": "Burial's micro-edited beats and warped pad textures complement jazzy breakbeats. Similar BPM allows minimal pitch adjustment. Building energy fits the arc."
    },
    // ... more recommendations
  ],
  "setContext": {
    "dominantBPM": 120,
    "dominantKey": "1A",
    "currentEnergy": 0.65,
    "energyTrend": "building",
    "averageDuration": 6.2
  }
}
```

Users see not just the recommendation, but **why it works**. This builds trust and teaches users to think like DJs.

---

## Set-Level Intelligence

Beyond individual track scoring, the engine considers the bigger picture: the entire set's arc, variety, and emotional journey.

### 1. Set Energy Arc

The engine models the set's energy trajectory to recommend tracks that fit naturally.

```
0.90 │       ╭─────╮
     │      ╱       ╲
0.70 │     ╱         ╲
     │    ╱           ╲
0.50 │   ╱             ╲
     │  ╱               ╲
0.30 │╱                 ╲___
     └──────────────────────→ Track #
     Warm-up   Peak    Cool-down
```

**Three phases**:
- **Warm-up** (0–0.60 energy): Build slowly. Recommend tracks with positive energy deltas (+0.05 to +0.15).
- **Peak** (0.60–0.85 energy): Maintain or spike. Recommend tracks with ±0.05 to +0.10 energy.
- **Cool-down** (0.85–0.30 energy): Let down gradually. Recommend tracks with −0.10 to −0.20 energy.

```typescript
function getPhase(setContext: SetContext): "warm-up" | "peak" | "cool-down" {
  const avgEnergy = mean(setContext.recentTracks.map(t => t.energy));
  const trend = calculateEnergyTrend(setContext.recentTracks);

  if (trend > 0.05) return "warm-up"; // Energy increasing
  if (trend < -0.05) return "cool-down"; // Energy decreasing
  return "peak"; // Flat
}

function getEnergyModifier(
  phase: string,
  candidateEnergyDelta: number
): number {
  if (phase === "warm-up") {
    // Building energy: prefer positive deltas
    if (candidateEnergyDelta > 0.05) return 1.1; // +10% bonus
    if (candidateEnergyDelta < -0.15) return 0.7; // −30% penalty
  } else if (phase === "cool-down") {
    // Cooling energy: prefer negative deltas
    if (candidateEnergyDelta < -0.05) return 1.1; // +10% bonus
    if (candidateEnergyDelta > 0.15) return 0.7; // −30% penalty
  } else {
    // Peak: neutral energy changes okay
    if (Math.abs(candidateEnergyDelta) < 0.10) return 1.0;
    if (Math.abs(candidateEnergyDelta) < 0.20) return 0.9;
  }

  return 1.0;
}
```

### 2. Harmonic Key Journey

The engine models whether the set is staying in one key region or intentionally shifting.

```typescript
function analyzeKeyJourney(setContext: SetContext): {
  dominantKey: string;
  stability: number; // 0 = shifting, 1 = stable
  compatibleKeys: string[]; // Adjacent keys on Camelot wheel
} {
  const keys = setContext.recentTracks.map(t => t.key);
  const keyFrequency = countOccurrences(keys);
  const dominantKey = mostFrequent(keyFrequency);
  const dominantKeyCount = keyFrequency[dominantKey];

  const stability = dominantKeyCount / keys.length; // E.g., 0.67 if 2 of 3 tracks in same key

  const compatibleKeys = getCompatibleKeys(dominantKey); // ±1 on Camelot wheel

  return { dominantKey, stability, compatibleKeys };
}
```

**Key strategy**:
- If set is **stable** (0.7+ same key): Recommend tracks in the same key or ±1 on Camelot wheel.
- If set is **shifting** (<0.5 same key): Recommend tracks that continue the key journey naturally.

### 3. BPM Progression

The engine notes whether the set is accelerating, decelerating, or holding steady.

```typescript
function analyzeBPMProgression(setContext: SetContext): {
  averageBPM: number;
  trend: "accelerating" | "decelerating" | "steady";
  range: { min: number; max: number };
} {
  const bpms = setContext.recentTracks.map(t => t.bpm);
  const avg = mean(bpms);
  const trend = bpms[bpms.length - 1] > avg ? "accelerating" : "decelerating";
  const range = { min: Math.min(...bpms), max: Math.max(...bpms) };

  return { averageBPM: avg, trend, range };
}
```

**Recommendation strategy**:
- If accelerating: Recommend tracks at the higher end of the range.
- If decelerating: Recommend tracks at the lower end.
- If steady: Recommend tracks within ±2% of the average.

### 4. Artist & Label Diversity

The engine prevents excessive repetition while recognizing related lineage.

```typescript
function analyzeArtistLabelDiversity(setContext: SetContext): {
  artistRepetition: Map<string, number>;
  labelRepetition: Map<string, number>;
  dominantLabels: string[];
  missingLabels: string[]; // Complementary labels, not yet in set
} {
  const artists = setContext.recentTracks.map(t => t.artist);
  const labels = setContext.recentTracks.map(t => t.label);

  const artistRepetition = countOccurrences(artists);
  const labelRepetition = countOccurrences(labels);

  const dominantLabels = topN(labelRepetition, 3); // Top 3 labels
  const missingLabels = findComplementaryLabels(dominantLabels); // Adjacent labels in the genre

  return { artistRepetition, labelRepetition, dominantLabels, missingLabels };
}

function calculateVarietyPenalty(candidate: EnrichedTrack, setContext: SetContext): number {
  const { artistRepetition, labelRepetition } = analyzeArtistLabelDiversity(setContext);

  let penalty = 1.0;

  // Same artist twice in a row: heavy penalty
  if (candidate.artist === setContext.recentTracks[0].artist) {
    penalty *= 0.70;
  }

  // Same artist elsewhere in set: light penalty
  if (artistRepetition[candidate.artist]) {
    penalty *= 0.85;
  }

  // Same label, but not dominant: neutral
  if (labelRepetition[candidate.label] && labelRepetition[candidate.label] > 2) {
    penalty *= 0.90;
  }

  return penalty;
}
```

---

## Music Theory & Harmonic Compatibility

### Camelot Wheel Reference

The Camelot wheel is a 24-position harmonic mixing system. Each position represents a major key (A) and relative minor key (B).

```
        12A ← C major / A minor
        ↙   ↖
     11A     1A ← G major / E minor
    ↙         ↖
 10A           2A ← D major / B minor
  ↙             ↖
9A               3A ← A major / F# minor
  ↖             ↙
 8A            4A ← E major / C# minor
    ↖         ↙
     7A     5A ← B major / G# minor
        ↖   ↙
        6A ← F# major / D# minor
```

**Key rules**:
- **Adjacent keys** (±1 on wheel): Harmonically compatible. Mix freely.
- **Same number, different letter** (e.g., 1A ↔ 1B): Relative major/minor. Compatible but different mood.
- **±2 steps**: Possible but creates noticeable energy shift.
- **±3 steps**: Risky. Works only for dramatic transitions.
- **Opposite side (6 steps)**: Clash. Avoid.

### Pitch-Adjusted Key Calculation

When a DJ pitches a track, the perceived key shifts. This is the **most important concept** in the recommendation engine.

**Formula**:
```
semitones_shifted = 12 × log₂(targetBPM / originalBPM)
effectiveKey = originalKey + semitones_shifted (mapped back to nearest Camelot position)
```

**Intuition**: A semitone shift of +0.68 is small enough that the ear still perceives the key as identical. But +1.0 semitone shift is enough to move to the next Camelot position.

### Cents Deviation

Even within a Camelot position, a track can sit slightly sharp or flat. Measured in **cents** (1/100th of a semitone, or 1/1200th of an octave).

- **0–10 cents**: Dead center. Imperceptible to DJs.
- **10–25 cents**: Requires slight tuning, but still very playable.
- **25–40 cents**: DJ would notice, might need to retune.
- **40–50 cents**: Sounds off. Basic mixing skill required.
- **50+ cents**: Halfway to the next key. Basically incompatible.

### Quick Reference Table

| Original BPM | Target BPM | % Change | Semitones | Key Shift | Camelot Impact |
|---|---|---|---|---|---|
| 120 | 120 | 0% | 0.00 | Same | No change |
| 120 | 122 | +1.7% | +0.34 | +0.34st | Same key (stays at 1A) |
| 120 | 126 | +5.0% | +1.01 | +1.01st | Adjacent key (shifts to 2A) |
| 120 | 128 | +6.7% | +1.33 | +1.33st | Adjacent key (shifts to 2A) |
| 120 | 132 | +10.0% | +2.01 | +2.01st | Two keys (shifts to 3A) |

**Rule of thumb**:
- <3% BPM change → Same key
- 3–6% BPM change → Adjacent key
- 6–10% BPM change → ±2 keys
- >10% BPM change → Too far to recommend

---

## Integration Points

The recommendation engine is woven throughout the CrateMate codebase:

### 1. `lib/music-theory.ts`

All harmonic math and scoring functions.

```typescript
// Core functions
export function calculateSemitones(originalBPM: number, targetBPM: number): number
export function shiftCamelotKey(key: string, semitones: number): string
export function calculateCamelotDistance(key1: string, key2: string): number
export function getCamelotScore(distance: number): number
export function getCentsPenalty(cents: number): number

// Scoring
export function calculateMixScore(
  candidate: EnrichedTrack,
  setContext: SetContext
): MixScore

// Set analysis
export function analyzePlaylistDNA(tracks: Track[]): PlaylistDNA
export function calculateEnergyTrend(tracks: Track[]): number
export function getCompatibleKeys(key: string): string[]
```

### 2. `app/api/analyze/route.ts`

Calls Claude to generate playlist DNA + recommendations. Uses the scoring engine to rank and filter.

```typescript
export async function POST(req: Request) {
  const { tracks, mode = "full" } = await req.json();

  if (mode === "full") {
    // Generate DNA + recommendations
    const dna = await generatePlaylistDNA(tracks);
    const setContext = createSetContext(tracks, dna);
    const claudeCandidates = await generateCandidates(dna);
    const validatedTracks = await validateTracks(claudeCandidates);
    const enrichedTracks = await enrichWithBeatport(validatedTracks);
    const scoredTracks = enrichedTracks.map(t => ({
      ...t,
      mixScore: calculateMixScore(t, setContext),
    }));
    const topN = scoredTracks
      .filter(t => t.mixScore.overall >= 50)
      .sort((a, b) => b.mixScore.overall - a.mixScore.overall)
      .slice(0, 20);

    return Response.json({ dna, recommendations: topN });
  } else {
    // Batch recommendations only
    const dna = DNA_FROM_PREVIOUS_CALL; // Passed in request
    const setContext = createSetContext(tracks, dna);
    const claudeCandidates = await generateCandidates(null, dna); // Pass DNA, ask for recs only
    // ... same validation and scoring
  }
}
```

### 3. `context/player-context.tsx`

When a user clicks "play" on a recommendation, the context calls `/api/soundcloud-search` to find the track on SoundCloud. The mix score and key info are displayed in the player bar.

```typescript
const PlayButton = ({ track, mixScore }) => {
  const { play } = usePlayer();

  const handlePlay = async () => {
    const scResult = await fetch(`/api/soundcloud-search?...`).then(r => r.json());
    play(track, scResult);

    // Display key info
    const effectiveKey = shiftCamelotKey(track.key, semitones);
    const cents = calculateCents(track.keyDeviation);
    console.log(`Playing at ${track.bpm} BPM | Effective Key: ${effectiveKey} (${cents > 0 ? '+' : ''}${cents}¢)`);
  };

  return (
    <button onClick={handlePlay}>
      ▶ Play {mixScore.overall}/100 mix
    </button>
  );
};
```

### 4. `components/player-bar.tsx`

Displays current track info: BPM, effective key, energy, harmonic compatibility with previous track.

```typescript
<div className="player-bar">
  <div>Now playing: {currentTrack.title}</div>
  <div>{currentTrack.bpm} BPM | Key {effectiveKey} ({centDeviation}¢)</div>
  <div>Energy: {currentTrack.energy.toFixed(2)}</div>
  <div>Mix score vs previous: {previousMixScore}/100</div>
</div>
```

### 5. `components/dig-engine.tsx`

The main UI component that runs the recommendation flow:

1. User imports playlist (SC, Spotify, paste, screenshot)
2. Click "Analyze" → POST to `/api/analyze` with mode="full"
3. Receive playlist DNA + top 20 recommendations
4. Display results with play buttons, scores, reasoning
5. Click "Get more" → POST to `/api/analyze` with mode="recs" to fetch next batch

---

## Feedback & Refinement Loop

Currently, the recommendation engine is **non-personalized**. In the future, we can refine it based on user behavior.

### Data Collection (Future)

Track user actions:
- Which recommendations does the user add to their crate? (positive signal)
- Which recommendations does the user skip? (negative signal)
- Which recommendations does the user play? (engagement signal)
- How long do they listen to recommendations? (satisfaction signal)
- Do they re-order recommendations in the set? (quality signal)

```typescript
interface RecommendationFeedback {
  recommendationId: string;
  action: "added" | "skipped" | "played" | "removed";
  durationListened?: number; // seconds
  timestamp: Date;
}

function trackRecommendationFeedback(feedback: RecommendationFeedback) {
  localStorage.setItem(
    `feedback_${feedback.recommendationId}`,
    JSON.stringify(feedback)
  );
}
```

### Claude Prompt Refinement (Future)

Based on feedback, update Claude's prompt:

```
# User Profile: Deep House Enthusiast
In the last 30 days, this user:
- Added 24 recommendations to crates
- Skipped 8 recommendations
- Played 18 of the added recommendations for average 4.2 minutes

Common patterns in accepted recommendations:
- Prefers tracks from Innervisions, Ostgut Ton, fabric
- Loves jazzy chords over pure acid techno
- Rarely accepts UK garage recommendations (skipped 4/5)
- Often adds breakbeat tracks even if energy is slightly mismatched

Suggestions for you:
- Lean toward Innervisions-adjacent labels
- Include more jazz-house fusion
- Skip UK garage suggestions
- Energy matching is less important than harmonic fit for this user
```

### Weights Personalization (Future)

Different DJs weight factors differently. A DJ who mixes on beat-matching turntables values BPM proximity more; a DJ who uses sync might prioritize harmonic compatibility.

```typescript
interface DJProfile {
  name: string;
  style: "turntablist" | "sync-mixer" | "harmonic-purist" | "energy-technician";
  weightPreferences: {
    harmonic: 0.0 - 1.0;
    bpm: 0.0 - 1.0;
    energy: 0.0 - 1.0;
    duration: 0.0 - 1.0;
  };
}

const profiles = {
  turntablist: {
    harmonic: 0.30,
    bpm: 0.40, // Values BPM precision over harmony
    energy: 0.20,
    duration: 0.10,
  },
  syncMixer: {
    harmonic: 0.50, // Can be more flexible with BPM
    bpm: 0.10,
    energy: 0.25,
    duration: 0.15,
  },
  harmonicPurist: {
    harmonic: 0.60,
    bpm: 0.15,
    energy: 0.15,
    duration: 0.10,
  },
  energyTechnician: {
    harmonic: 0.30,
    bpm: 0.20,
    energy: 0.40, // Values energy arc over everything
    duration: 0.10,
  },
};
```

---

## Future Enhancements

### Near-term (Next 3 months)
1. **Mood-based recommendations**: Ask Claude to consider playlist mood (uplifting, melancholic, aggressive, meditative).
2. **Regional scene awareness**: Train Claude on regional electronic music scenes (Berlin, Detroit, London, Tokyo) and prefer intra-scene recommendations.
3. **Time-of-day context**: Recommendations for peak-time, opening set, or after-hours context.

### Mid-term (3–6 months)
1. **User feedback integration**: Track which recommendations users add/skip. Refine Claude's prompt monthly based on patterns.
2. **Personalized DJ profiles**: Let users opt into style preferences (turntablist vs. sync mixer, harmonic purist vs. energy technician).
3. **Set-building assistant**: Given a crate, AI suggests an optimal set structure with warm-up, peak, cool-down arcs.

### Long-term (6+ months)
1. **Collaborative filtering**: "DJs who liked your recommendations also liked these other tracks."
2. **Audio feature extraction**: Send samples to Claude's audio API to validate BPM/key estimates automatically.
3. **Real-time set analysis**: As DJ plays live, Claude listens via mic + analyzes what tracks are being mixed, suggests complementary tracks in real-time.
4. **Offline recommendation caching**: Pre-generate recommendation sets for popular genres/moods, serve from cache for low-latency responses.

---

## Appendix: Scoring Examples

### Example 1: Perfect Recommendation

**Set context**:
- Last track: 120 BPM, 1A, energy 0.65, 6 min
- Set status: Warm-up phase, building energy

**Candidate**: "Untrue" by Burial
- BPM: 122 (estimate)
- Key: 1A
- Energy: 0.70 (estimate)
- Duration: 5.8 min
- Label: Hyperdub

**Scoring**:
- Harmonic: 120→122 = +0.34 semitones, still maps to 1A. Score: **100**
- BPM: 122 vs 120 = 2 BPM (1.7%). Score: **100**
- Energy: 0.70 vs 0.65 = +0.05 delta, matches building trend. Score: **90**
- Duration: 5.8 vs 6.0 avg = −0.2 min (3%). Score: **100**
- Variety: No artist repetition, Hyperdub is adjacent to set's vibe. Multiplier: **1.0**

**Overall**: (100×0.4 + 100×0.25 + 90×0.2 + 100×0.15) × 1.0 = **98** ✓ Excellent

---

### Example 2: Good but Risky

**Candidate**: "Strings of Life" by Derrick May
- BPM: 116 (estimate)
- Key: 2A
- Energy: 0.55
- Duration: 7.2 min
- Label: Transmat

**Scoring**:
- Harmonic: 120→116 = −0.68 semitones, shifts from 1A to 12A. 1A↔12A is adjacent on wheel. Score: **90**
- BPM: 116 vs 120 = 4 BPM (3.3%). Score: **85**
- Energy: 0.55 vs 0.65 = −0.10 delta, building trend wants +energy. Penalty. Score: **60**
- Duration: 7.2 vs 6.0 avg = +1.2 min (20%). Score: **80**
- Variety: Different label, different era. Multiplier: **1.0**

**Overall**: (90×0.4 + 85×0.25 + 60×0.2 + 80×0.15) × 1.0 = **81** ✓ Good, but risky because energy goes backward

---

### Example 3: Rejected

**Candidate**: "Satisfaction" by Benny Benassi
- BPM: 130 (estimate)
- Key: 5B
- Energy: 0.85
- Duration: 3.2 min
- Label: Ultra

**Scoring**:
- Harmonic: 120→130 = +1.90 semitones, shifts from 1A to 3A+. 1A↔3A is 2-step distance. Score: **60**
- BPM: 130 vs 120 = 10 BPM (8.3%). Score: **10**
- Energy: 0.85 vs 0.65 = +0.20 delta, too big a jump. Score: **40**
- Duration: 3.2 vs 6.0 avg = −2.8 min (47%). Score: **25**
- Variety: Different label, but commercial EDM vs underground house. Multiplier: **0.70**

**Overall**: (60×0.4 + 10×0.25 + 40×0.2 + 25×0.15) × 0.70 = **24** ✗ Rejected (below 50 threshold)

---

## Conclusion

The CrateMate recommendation engine combines **music theory, AI-guided generation, rigorous validation, and transparent scoring** to recommend tracks that genuinely work in a DJ set. By teaching Claude to think like a DJ—considering harmonic compatibility, pitch-adjusted keys, energy flow, and lineup—we move beyond generic recommendations to **intelligent crate-digging**.

The engine is designed to be:
- **Transparent**: Users see *why* a track is recommended, building trust and DJ literacy
- **Learnable**: The scoring system can be refined over time based on user feedback
- **Extensible**: Weights and thresholds can be personalized per DJ profile
- **Grounded**: Every recommendation is validated against real music databases

This is the intellectual foundation of CrateMate.

