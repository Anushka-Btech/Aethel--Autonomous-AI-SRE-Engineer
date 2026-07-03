import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle, ArrowRight } from "lucide-react";

type Step = {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "done";
  progress: number;
};

export function AutonomousPipeline({ steps }: { steps: Step[] }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div className="absolute inset-x-0 top-0 h-px scanline" />
      <div className="flex items-center justify-between">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] opacity-70">
            autonomous sre pipeline
          </div>
          <h2 className="text-sm font-semibold">Aethel is executing recovery end-to-end</h2>
        </div>
        <div className="mono text-[10px] opacity-60">
          {steps.filter((s) => s.status === "done").length}/{steps.length} steps complete
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
        {steps.map((s, i) => (
          <PipelineNode key={s.id} step={s} index={i} />
        ))}
      </div>
    </div>
  );
}

function PipelineNode({ step, index }: { step: Step; index: number }) {
  const color =
    step.status === "done"
      ? "var(--ok)"
      : step.status === "active"
        ? "var(--info)"
        : "color-mix(in oklab, var(--foreground) 30%, transparent)";
  const icon =
    step.status === "done" ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : step.status === "active" ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
    ) : (
      <Circle className="h-3.5 w-3.5" />
    );
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative rounded-lg border bg-card/40 p-2.5"
      style={{
        borderColor: step.status === "pending" ? "var(--color-border)" : color,
        boxShadow: step.status === "active" ? `0 0 24px -8px ${color}` : undefined,
      }}
    >
      <div className="flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="mono text-[9px] uppercase tracking-wider opacity-80">
          step {index + 1}
        </span>
        {index < 7 && <ArrowRight className="ml-auto h-3 w-3 opacity-30" />}
      </div>
      <div className="mt-1 text-[12px] font-semibold leading-tight">{step.label}</div>
      <div className="mt-0.5 text-[10px] leading-snug opacity-60">{step.detail}</div>
      <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-muted/60">
        <motion.div
          className="h-full"
          style={{ background: color }}
          animate={{ width: `${Math.round(step.progress * 100)}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
