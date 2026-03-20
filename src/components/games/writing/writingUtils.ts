/**
 * Utility functions for the Writing/Tracing game.
 * Handles SVG path sampling, trace scoring, and path-to-points conversion.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Parse an SVG path `d` string into an array of sampled points.
 * Supports M, L, C, and Z commands (the ones used in letterPaths).
 *
 * We sample curves at `stepsPerSegment` intervals for smooth comparison.
 */
export function samplePathPoints(d: string, stepsPerSegment = 12): Point[] {
  const points: Point[] = [];
  const commands = parseSvgPath(d);
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        cx = cmd.points[0];
        cy = cmd.points[1];
        startX = cx;
        startY = cy;
        points.push({ x: cx, y: cy });
        break;

      case 'L':
        for (let t = 1; t <= stepsPerSegment; t++) {
          const frac = t / stepsPerSegment;
          points.push({
            x: cx + (cmd.points[0] - cx) * frac,
            y: cy + (cmd.points[1] - cy) * frac,
          });
        }
        cx = cmd.points[0];
        cy = cmd.points[1];
        break;

      case 'C': {
        const [x1, y1, x2, y2, x3, y3] = cmd.points;
        for (let t = 1; t <= stepsPerSegment; t++) {
          const frac = t / stepsPerSegment;
          points.push(cubicBezier(cx, cy, x1, y1, x2, y2, x3, y3, frac));
        }
        cx = x3;
        cy = y3;
        break;
      }

      case 'Z':
        if (Math.hypot(cx - startX, cy - startY) > 2) {
          for (let t = 1; t <= stepsPerSegment; t++) {
            const frac = t / stepsPerSegment;
            points.push({
              x: cx + (startX - cx) * frac,
              y: cy + (startY - cy) * frac,
            });
          }
        }
        cx = startX;
        cy = startY;
        break;
    }
  }

  return points;
}

/**
 * Scoring uses a tighter tolerance than the real-time visual feedback.
 * Visual tolerance stays generous (green trail while drawing) so kids
 * feel encouraged, but scoring tolerance is stricter so they actually
 * have to complete the shape to pass.
 *
 * Ratio: scoring tolerance = 60% of visual tolerance.
 */
export function getScoringTolerance(visualTolerance: number): number {
  return Math.round(visualTolerance * 0.45);
}

/**
 * Detailed scoring result — lets the game give specific feedback
 * (e.g., "finish the shape!" vs "stay on the line!")
 */
export interface TraceScore {
  /** Final blended score 0-100 */
  score: number;
  /** What % of the guide was covered (0-1) */
  coverage: number;
  /** What % of the trace was on the guide (0-1) */
  precision: number;
  /** Whether coverage meets the minimum floor for passing */
  coverageOk: boolean;
  /** Whether precision meets the minimum floor for passing */
  precisionOk: boolean;
  /** Whether the trace passes overall */
  passed: boolean;
}

/**
 * Score a child's trace against the guide path using BIDIRECTIONAL matching
 * with a hard COVERAGE FLOOR.
 *
 * The key insight: a child who draws just the start of a circle gets 100%
 * precision but low coverage. Without a coverage floor, precision alone
 * can push the score above passing. The floor prevents this.
 *
 * Scoring:
 * - Coverage (75%): How much of the guide path did the child cover?
 * - Precision (25%): How much of the child's trace is actually near the guide?
 * - Hard floor: Coverage MUST exceed a minimum, or the trace auto-fails
 *   regardless of blended score.
 *
 * The 75/25 weighting and floor together ensure:
 * - Random scribble → low precision AND low coverage → fails
 * - Partial but accurate trace → high precision, LOW coverage → fails (floor)
 * - Complete but wobbly trace → high coverage, decent precision → passes
 * - Complete and accurate trace → high everything → passes with high score
 */
export function scoreTrace(
  guidePoints: Point[],
  tracedPoints: Point[],
  tolerance: number,
  difficulty: 1 | 2 | 3 = 1,
): TraceScore {
  if (guidePoints.length === 0 || tracedPoints.length === 0) {
    return { score: 0, coverage: 0, precision: 0, coverageOk: false, precisionOk: false, passed: false };
  }

  // Coverage: what % of guide points have a nearby traced point?
  let coveredCount = 0;
  for (const gp of guidePoints) {
    const isClose = tracedPoints.some(
      (tp) => Math.hypot(tp.x - gp.x, tp.y - gp.y) <= tolerance,
    );
    if (isClose) coveredCount++;
  }
  const coverage = coveredCount / guidePoints.length;

  // Precision: what % of traced points are near the guide?
  let preciseCount = 0;
  for (const tp of tracedPoints) {
    const isNearGuide = guidePoints.some(
      (gp) => Math.hypot(tp.x - gp.x, tp.y - gp.y) <= tolerance,
    );
    if (isNearGuide) preciseCount++;
  }
  const precision = preciseCount / tracedPoints.length;

  // Blended score — coverage-heavy so completing the shape matters most
  const blended = coverage * 0.75 + precision * 0.25;
  const score = Math.round(blended * 100);

  // Hard floors — must meet both coverage AND precision minimums
  const minCoverage = getMinCoverage(difficulty);
  const minPrecision = getMinPrecision(difficulty);
  const coverageOk = coverage >= minCoverage;
  const precisionOk = precision >= minPrecision;
  const passingScore = getPassingScore(difficulty);
  const passed = coverageOk && precisionOk && score >= passingScore;

  return { score, coverage, precision, coverageOk, precisionOk, passed };
}

/**
 * Minimum coverage required per difficulty.
 * This is the hard floor — even if the blended score is high,
 * the trace fails if coverage is below this.
 *
 * D1: Must cover at least 50% of the guide (forgiving for wiggly kids)
 * D2: Must cover at least 60%
 * D3: Must cover at least 70% (need to really complete the character)
 */
function getMinCoverage(difficulty: 1 | 2 | 3): number {
  switch (difficulty) {
    case 1: return 0.75;
    case 2: return 0.82;
    case 3: return 0.88;
    default: return 0.75;
  }
}

/**
 * Minimum precision required per difficulty.
 * Prevents random scribbling from passing — the kid must actually
 * follow the guide, not just draw all over the canvas.
 */
function getMinPrecision(difficulty: 1 | 2 | 3): number {
  switch (difficulty) {
    case 1: return 0.45;
    case 2: return 0.52;
    case 3: return 0.6;
    default: return 0.45;
  }
}

/**
 * Check if a single point is near the guide path.
 * Used for real-time trail color feedback while the child draws.
 */
export function isPointNearGuide(
  point: Point,
  guidePoints: Point[],
  tolerance: number,
): boolean {
  return guidePoints.some(
    (gp) => Math.hypot(point.x - gp.x, point.y - gp.y) <= tolerance,
  );
}

/**
 * Get kid-friendly feedback based on the detailed score.
 * - High coverage + precision → celebrate!
 * - Low coverage + high precision → "keep going, finish the shape!"
 * - High coverage + low precision → "try to stay on the line!"
 * - Low everything → "follow the dots!"
 * Never uses "wrong" or negative language.
 */
export function scoreToFeedback(result: TraceScore): {
  text: string;
  emoji: string;
  passed: boolean;
} {
  if (result.passed && result.score >= 75) {
    return { text: 'Amazing!', emoji: '🌟', passed: true };
  }
  if (result.passed) {
    return { text: 'Nice work!', emoji: '✨', passed: true };
  }

  // Not passed — give specific guidance
  if (!result.coverageOk && result.precision >= 0.5) {
    // Good precision but didn't finish — this is the "started circle but didn't complete" case
    return { text: 'Keep going! Finish the whole shape!', emoji: '👉', passed: false };
  }
  if (!result.precisionOk && result.coverage >= 0.4) {
    // Covered the path but too much scribbling off the guide
    return { text: 'Try to stay on the dotted line!', emoji: '👆', passed: false };
  }
  if (result.coverage < 0.3) {
    // Very little coverage
    return { text: 'Trace the whole shape from start to end!', emoji: '✏️', passed: false };
  }
  // Generic encouragement
  return { text: 'Almost! Follow the dots all the way!', emoji: '💪', passed: false };
}

/**
 * Get the passing score threshold for each difficulty level.
 * Works in combination with coverage floor + precision floor.
 * All three must pass: coverageOk AND precisionOk AND score >= passing.
 */
export function getPassingScore(difficulty: 1 | 2 | 3): number {
  switch (difficulty) {
    case 1:
      return 55; // Decent coverage + reasonable accuracy
    case 2:
      return 65; // Solid coverage and on-path
    case 3:
      return 75; // Must be quite complete and accurate
    default:
      return 55;
  }
}

/**
 * Get guide opacity based on difficulty.
 * D1: solid guide, D2: faded, D3: very faint (near memory mode).
 */
export function getGuideOpacity(difficulty: 1 | 2 | 3): number {
  switch (difficulty) {
    case 1:
      return 0.6;
    case 2:
      return 0.35;
    case 3:
      return 0.15;
    default:
      return 0.6;
  }
}

/**
 * Convert a flat array of {x,y} finger points into an SVG path `d` string.
 * Uses line segments (M + L) for the drawn trail.
 */
export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L${points[i].x.toFixed(1)},${points[i].y.toFixed(1)}`;
  }
  return d;
}

// ── SVG path parsing ────────────────────────────────────────────

interface PathCommand {
  type: 'M' | 'L' | 'C' | 'Z';
  points: number[];
}

/**
 * Minimal SVG path parser for the subset we use (M, L, C, Z — absolute only).
 */
function parseSvgPath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  // Split by command letters, keeping delimiters
  const tokens = d.match(/[MLCZ][^MLCZ]*/gi) || [];

  for (const token of tokens) {
    const type = token.charAt(0).toUpperCase() as PathCommand['type'];
    const numStr = token.slice(1).trim();

    if (type === 'Z') {
      commands.push({ type: 'Z', points: [] });
      continue;
    }

    // Extract all numbers (handles both comma and space separated)
    const nums = numStr.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    switch (type) {
      case 'M':
        // M can have implicit L commands for subsequent coordinate pairs
        for (let i = 0; i < nums.length; i += 2) {
          commands.push({
            type: i === 0 ? 'M' : 'L',
            points: [nums[i], nums[i + 1]],
          });
        }
        break;

      case 'L':
        for (let i = 0; i < nums.length; i += 2) {
          commands.push({ type: 'L', points: [nums[i], nums[i + 1]] });
        }
        break;

      case 'C':
        for (let i = 0; i < nums.length; i += 6) {
          commands.push({
            type: 'C',
            points: nums.slice(i, i + 6),
          });
        }
        break;
    }
  }

  return commands;
}

/**
 * Evaluate a point on a cubic Bézier curve at parameter t.
 */
function cubicBezier(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  t: number,
): Point {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;

  return {
    x: uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3,
    y: uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3,
  };
}
