import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { G, Path } from 'react-native-svg';
import { Point, pointsToSvgPath, samplePathPoints, scoreTrace, isPointNearGuide, TraceScore, getScoringTolerance } from './writingUtils';

/**
 * Color palette kids can choose from — playful crayon colors
 */
export const CRAYON_COLORS = [
  '#FF6B6B', // red
  '#4D96FF', // blue
  '#6BCB77', // green
  '#9B59B6', // purple
  '#FF8C42', // orange
  '#E84393', // pink
];

/** Gentle orange color for off-path segments — visible but not alarming */
const OFF_PATH_COLOR = '#FFBB7744';

interface TracingCanvasProps {
  /** SVG path string(s) for the guide stroke being traced */
  guideStrokes: string[];
  /** Current stroke index the child is tracing (0-based) */
  activeStroke: number;
  /** Opacity of the guide (1 = solid, 0 = hidden) */
  guideOpacity: number;
  /** Width of the child's drawing trail */
  strokeWidth: number;
  /** Color of the child's drawing trail */
  strokeColor: string;
  /** Tolerance radius for scoring */
  tolerance: number;
  /** Difficulty level — used for coverage floor in scoring */
  difficulty: 1 | 2 | 3;
  /** Paths from previously accepted strokes — rendered even after canvas remount */
  frozenPaths?: Array<{ d: string; color: string }>;
  /** When true, only show the active stroke guide (for word tracing) */
  wordMode?: boolean;
  /** For spelling mode: wide viewBox with letters side-by-side */
  spellingLayout?: { letterCount: number; activeLetterIndex: number };
  /** When true, disable gesture input (e.g., during demo animation) */
  disabled?: boolean;
  /** Called when the child lifts their finger with the detailed score for current stroke */
  onStrokeComplete: (result: TraceScore, segments: Array<{ d: string; color: string }>) => void;
  /** Called when a stroke begins */
  onStrokeStart?: () => void;
}

/**
 * TracingCanvas — the drawing surface where kids trace characters with their finger.
 *
 * Uses react-native-gesture-handler for pan tracking and react-native-svg
 * to render both the guide path and the child's drawn trail.
 *
 * The canvas maps to a 200×200 viewBox (matching letterPaths data) and
 * scales responsively to fill its container.
 */
export const TracingCanvas = function TracingCanvas({
  guideStrokes,
  activeStroke,
  guideOpacity,
  strokeWidth,
  strokeColor,
  tolerance,
  difficulty,
  frozenPaths,
  wordMode,
  spellingLayout,
  disabled,
  onStrokeComplete,
  onStrokeStart,
}: TracingCanvasProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const [completedPaths, setCompletedPaths] = useState<Array<{ d: string; color: string }>>([]);
  // Current drawing is tracked as segments: each segment is a run of on-path or off-path points
  const [currentSegments, setCurrentSegments] = useState<Array<{ d: string; onPath: boolean }>>([]);
  const pointsRef = useRef<Point[]>([]);
  const segmentsRef = useRef<Array<{ points: Point[]; onPath: boolean }>>([]);
  const isDrawingRef = useRef(false);

  // Accumulate points/segments across finger lifts
  const allPointsRef = useRef<Point[]>([]);
  const allSegmentsRef = useRef<Array<{ d: string; color: string }>>([]);

  // Scoring logic — called automatically when enough of the guide is covered
  const runScoring = useCallback(() => {
    if (allPointsRef.current.length === 0) return; // Nothing to score
    const guideD = guideStrokes[activeStroke];
    if (!guideD) return;
    let guidePoints = samplePathPoints(guideD, 32);
    const ox = spellingLayout ? spellingLayout.activeLetterIndex * 200 : 0;
    if (ox > 0) {
      guidePoints = guidePoints.map((p) => ({ x: p.x + ox, y: p.y }));
    }
    const scoringTol = getScoringTolerance(tolerance);
    const result = scoreTrace(guidePoints, allPointsRef.current, scoringTol, difficulty);
    const segments = [...allSegmentsRef.current];

    // Reset accumulators
    allPointsRef.current = [];
    allSegmentsRef.current = [];

    onStrokeComplete(result, segments);
  }, [guideStrokes, activeStroke, spellingLayout, tolerance, difficulty, onStrokeComplete]);

  // ViewBox dimensions — wider for spelling mode
  const vbWidth = spellingLayout ? spellingLayout.letterCount * 200 : 200;
  const vbHeight = 200;
  const guideOffsetX = spellingLayout ? spellingLayout.activeLetterIndex * 200 : 0;

  // Pre-sample guide points for fast proximity checks during drawing
  // Offset by letter position so scoring works in the wide coordinate space
  const activeGuidePoints = useMemo(() => {
    const d = guideStrokes[activeStroke];
    if (!d) return [];
    const pts = samplePathPoints(d, 32);
    if (guideOffsetX > 0) {
      return pts.map((p) => ({ x: p.x + guideOffsetX, y: p.y }));
    }
    return pts;
  }, [guideStrokes, activeStroke, guideOffsetX]);

  // Coordinate transform: canvas pixel → viewBox coordinates
  const toViewBox = useCallback(
    (px: number, py: number): Point => {
      const svgScale = Math.min(canvasSize.width / vbWidth, canvasSize.height / vbHeight);
      const actualW = vbWidth * svgScale;
      const actualH = vbHeight * svgScale;
      const offX = (canvasSize.width - actualW) / 2;
      const offY = (canvasSize.height - actualH) / 2;
      return {
        x: (px - offX) / svgScale,
        y: (py - offY) / svgScale,
      };
    },
    [canvasSize, vbWidth, vbHeight],
  );

  // Build SVG segments from segmentsRef for rendering
  const updateCurrentSegments = useCallback(() => {
    setCurrentSegments(
      segmentsRef.current.map((seg) => ({
        d: pointsToSvgPath(seg.points),
        onPath: seg.onPath,
      })),
    );
  }, []);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .enabled(!disabled)
    .onBegin((e) => {
      isDrawingRef.current = true;
      const p = toViewBox(e.x, e.y);
      const near = isPointNearGuide(p, activeGuidePoints, tolerance);
      pointsRef.current = [p];
      segmentsRef.current = [{ points: [p], onPath: near }];
      updateCurrentSegments();
      onStrokeStart?.();
    })
    .onUpdate((e) => {
      if (!isDrawingRef.current) return;
      const p = toViewBox(e.x, e.y);
      pointsRef.current.push(p);

      const near = isPointNearGuide(p, activeGuidePoints, tolerance);
      const lastSeg = segmentsRef.current[segmentsRef.current.length - 1];

      if (lastSeg && lastSeg.onPath === near) {
        // Same proximity state — extend current segment
        lastSeg.points.push(p);
      } else {
        // Proximity changed — start a new segment (carry over last point for continuity)
        const bridgePoint = lastSeg?.points[lastSeg.points.length - 1];
        const newSeg: { points: Point[]; onPath: boolean } = {
          points: bridgePoint ? [bridgePoint, p] : [p],
          onPath: near,
        };
        segmentsRef.current.push(newSeg);
      }
      updateCurrentSegments();
    })
    .onEnd(() => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const traced = pointsRef.current;
      if (traced.length < 3) {
        // Too short — ignore accidental taps
        setCurrentSegments([]);
        pointsRef.current = [];
        segmentsRef.current = [];
        return;
      }

      // Collect drawn segments for display
      const drawnSegments: Array<{ d: string; color: string }> = [];
      for (const seg of segmentsRef.current) {
        if (seg.points.length > 1) {
          drawnSegments.push({
            d: pointsToSvgPath(seg.points),
            color: seg.onPath ? strokeColor : OFF_PATH_COLOR,
          });
        }
      }

      // Accumulate across finger lifts
      allPointsRef.current = [...allPointsRef.current, ...traced];
      allSegmentsRef.current = [...allSegmentsRef.current, ...drawnSegments];

      // Show drawn trail immediately
      setCompletedPaths((prev) => [...prev, ...drawnSegments]);
      setCurrentSegments([]);
      pointsRef.current = [];
      segmentsRef.current = [];

      // Auto-score once the kid has traced enough of the guide (≥75% coverage).
      // This lets kids lift their finger mid-stroke without being graded prematurely.
      const guideD = guideStrokes[activeStroke];
      if (guideD && allPointsRef.current.length > 0) {
        let gp = samplePathPoints(guideD, 32);
        const ox = spellingLayout ? spellingLayout.activeLetterIndex * 200 : 0;
        if (ox > 0) gp = gp.map((p) => ({ x: p.x + ox, y: p.y }));
        const tol = getScoringTolerance(tolerance);
        const covered = gp.filter((g) =>
          allPointsRef.current.some((t) => Math.hypot(t.x - g.x, t.y - g.y) <= tol),
        ).length;
        if (covered / gp.length >= 0.75) {
          runScoring();
        }
      }
    })
    .onFinalize(() => {
      isDrawingRef.current = false;
    });

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  /** Reset the canvas for a new character */
  const reset = useCallback(() => {
    setCurrentSegments([]);
    setCompletedPaths([]);
    pointsRef.current = [];
    segmentsRef.current = [];
  }, []);

  // Expose reset via ref-style callback (parent calls via key change)
  // We use a simpler approach: parent changes `key` prop to force remount

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.canvas} onLayout={handleLayout}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Guide strokes — offset for spelling layout */}
          <G transform={spellingLayout ? `translate(${guideOffsetX}, 0)` : undefined}>
            {guideStrokes.map((d, i) => {
              if (wordMode && i !== activeStroke) return null;
              return (
                <Path
                  key={`guide-${i}`}
                  d={d}
                  fill="none"
                  stroke={i <= activeStroke ? '#B0B0B0' : '#E0E0E0'}
                  strokeWidth={i === activeStroke ? 8 : 5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={i === activeStroke ? '4,8' : '3,6'}
                  opacity={i < activeStroke ? 0.2 : guideOpacity}
                />
              );
            })}
          </G>

          {/* Frozen paths from previously accepted strokes (survive canvas remount) */}
          {frozenPaths?.map((seg, i) => (
            <Path
              key={`frozen-${i}`}
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          ))}

          {/* Previously completed stroke segments — colored by on/off path */}
          {completedPaths.map((seg, i) => (
            <Path
              key={`done-${i}`}
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          ))}

          {/* Current in-progress segments — green when on path, orange when off */}
          {currentSegments.map((seg, i) =>
            seg.d ? (
              <Path
                key={`cur-${i}`}
                d={seg.d}
                fill="none"
                stroke={seg.onPath ? strokeColor : OFF_PATH_COLOR}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null,
          )}
        </Svg>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#FFFEF5',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#F0E6C8',
    overflow: 'hidden',
  },
});
