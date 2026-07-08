import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AGENTS,
  GRAPH_EDGES,
  GRAPH_NODES,
  TIMELINE,
  synthMetrics,
  PIPELINE,
  AUTO_MITIGATE_AT,
  HYPOTHESIS_TRAIL,
  executiveImpact,
  predictiveOOM,
  type GraphNode,
  type GraphEdge,
} from "./scenario";

export type Phase = "idle" | "investigating" | "remediating" | "mitigated" | "verifying" | "closed";

/**
 * `nodes`/`edges` default to the static scenario, but the Dashboard passes
 * in whatever `useGraphEngine` resolved — live Neo4j data when available,
 * the same shape otherwise. The reveal-over-time animation logic below is
 * identical either way; only the source of truth changes.
 */
export function useInvestigation(sourced?: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const nodesSource = sourced?.nodes ?? GRAPH_NODES;
  const edgesSource = sourced?.edges ?? GRAPH_EDGES;
  const [phase, setPhase] = useState<Phase>("idle");
  const [t, setT] = useState(0); // sim seconds since deploy
  const [mitigated, setMitigated] = useState(false);
  const [frozenT, setFrozenT] = useState<number | null>(null); // freeze graph after mitigation
  const startedAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const autoMitigatedRef = useRef(false);

  const tick = useCallback(() => {
    if (startedAt.current == null) return;
    const now = (performance.now() - startedAt.current) / 1000;
    setT(now);
    // phase progression along the autonomous pipeline
    if (!mitigated) {
      if (now >= 8.0 && now < AUTO_MITIGATE_AT) setPhase("remediating");
      if (now >= AUTO_MITIGATE_AT && !autoMitigatedRef.current) {
        autoMitigatedRef.current = true;
        // autonomous rollback fires
        setFrozenT(now);
        setMitigated(true);
        setPhase("verifying");
        startedAt.current = performance.now();
        setT(0);
        raf.current = requestAnimationFrame(tick);
        return;
      }
    } else if (phase === "verifying" && now >= 2.2) {
      setPhase("closed");
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [mitigated, phase]);

  const start = useCallback(() => {
    setMitigated(false);
    setFrozenT(null);
    autoMitigatedRef.current = false;
    setPhase("investigating");
    setT(0);
    startedAt.current = performance.now();
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const rollback = useCallback(() => {
    if (mitigated) return;
    const now = startedAt.current ? (performance.now() - startedAt.current) / 1000 : 0;
    autoMitigatedRef.current = true;
    setFrozenT(now);
    setMitigated(true);
    setPhase("verifying");
    startedAt.current = performance.now();
    setT(0);
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }, [mitigated, tick]);

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    startedAt.current = null;
    setT(0);
    setMitigated(false);
    setFrozenT(null);
    autoMitigatedRef.current = false;
    setPhase("idle");
  }, []);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  // After mitigation we freeze the investigation snapshot so the
  // graph, timeline and agent states don't vanish during verification.
  const tForViz = frozenT ?? t;
  const visibleEvents = useMemo(() => TIMELINE.filter((e) => e.t <= tForViz + 0.001), [tForViz]);
  const visibleNodes = useMemo(
    () => nodesSource.filter((n) => n.appearAt <= tForViz + 0.001),
    [tForViz, nodesSource],
  );
  const visibleEdges = useMemo(
    () => edgesSource.filter((e) => e.appearAt <= tForViz + 0.001),
    [tForViz, edgesSource],
  );
  const agentStates = useMemo(
    () =>
      AGENTS.map((a) => {
        const status: "queued" | "working" | "done" =
          tForViz < a.startAt ? "queued" : tForViz < a.startAt + a.duration ? "working" : "done";
        const visibleFindings =
          status === "done"
            ? a.findings
            : status === "working"
              ? a.findings.slice(
                  0,
                  Math.max(1, Math.floor(((tForViz - a.startAt) / a.duration) * a.findings.length)),
                )
              : [];
        return { ...a, status, visibleFindings };
      }),
    [tForViz],
  );

  // metrics history (rolling buffer)
  const [history, setHistory] = useState<{
    mem: number[];
    lat: number[];
    err: number[];
    qps: number[];
  }>(() => ({
    mem: Array(60).fill(180),
    lat: Array(60).fill(42),
    err: Array(60).fill(0.2),
    qps: Array(60).fill(1240),
  }));
  useEffect(() => {
    if (phase === "idle") return;
    const id = setInterval(() => {
      const now = startedAt.current ? (performance.now() - startedAt.current) / 1000 : 0;
      const m = synthMetrics(now, mitigated);
      setHistory((h) => ({
        mem: [...h.mem.slice(1), m.mem],
        lat: [...h.lat.slice(1), m.lat],
        err: [...h.err.slice(1), m.err],
        qps: [...h.qps.slice(1), m.qps],
      }));
    }, 120);
    return () => clearInterval(id);
  }, [phase, mitigated]);

  const confidence = useMemo(() => {
    if (phase === "idle") return 0;
    if (mitigated) return 0.97;
    // step along the hypothesis trail
    const trail = HYPOTHESIS_TRAIL.filter((h) => h.t <= tForViz);
    return trail.length ? trail[trail.length - 1].conf : 0;
  }, [tForViz, phase, mitigated]);

  const hypothesisTrail = useMemo(() => HYPOTHESIS_TRAIL.filter((h) => h.t <= tForViz), [tForViz]);

  /* ----- autonomous pipeline state ----- */
  const pipelineSteps = useMemo(() => {
    return PIPELINE.map((step) => {
      const postT = t;

      // when mitigated, fast-forward planning steps to done so the UI
      // doesn't gate on tForViz (the user clicked rollback early).
      const effectiveT = mitigated
        ? Math.max(tForViz, step.startAt + step.duration + 0.1)
        : tForViz;

      let status: "pending" | "active" | "done" =
        effectiveT < step.startAt
          ? "pending"
          : effectiveT < step.startAt + step.duration
            ? "active"
            : "done";

      // verify + close progress with post-mitigation sim time
      if (mitigated && (step.id === "verify" || step.id === "close")) {
        if (step.id === "verify") {
          status = postT >= 1.4 ? "done" : "active";
        }

        if (step.id === "close") {
          if (postT >= 1.8) {
            status = "done";
          } else if (postT >= 1.4) {
            status = "active";
          } else {
            status = "pending";
          }
        }
      }

      let progress = 0;

      if (status === "done") {
        progress = 1;
      } else if (status === "active") {
        if (mitigated && step.id === "verify") {
          progress = Math.min(postT / 1.4, 1);
        } else if (mitigated && step.id === "close") {
          progress = Math.min(Math.max((postT - 1.4) / 0.4, 0), 1);
        } else {
          progress = Math.min(1, Math.max(0, (effectiveT - step.startAt) / step.duration));
        }
      }

      return {
        ...step,
        status,
        progress,
      };
    });
  }, [tForViz, t, mitigated]);

  const impact = useMemo(() => executiveImpact(tForViz, mitigated), [tForViz, mitigated]);
  const prediction = useMemo(() => predictiveOOM(tForViz, mitigated), [tForViz, mitigated]);

  return {
    phase,
    t,
    tForViz,
    mitigated,
    confidence,
    visibleEvents,
    visibleNodes,
    visibleEdges,
    allNodes: nodesSource,
    agentStates,
    history,
    pipelineSteps,
    hypothesisTrail,
    impact,
    prediction,
    start,
    rollback,
    reset,
  };
}
