import { motion } from "framer-motion";
import { SERVICE_HEALTH_AT, type ServiceNode } from "@/lib/sre/scenario";

const COL = { ok: "var(--ok)", warn: "var(--warn)", crit: "var(--crit)" } as const;

export function ServiceMap({
  t,
  mitigated,
  services,
  edges,
  onSelectService,
  selectedService,
}: {
  t: number;
  mitigated: boolean;
  services: ServiceNode[];
  edges: [string, string][];
  onSelectService?: (id: string) => void;
  selectedService?: string | null;
}) {
  const byId = Object.fromEntries(services.map((s) => [s.id, s]));
  return (
    <div className="relative h-[260px] w-full overflow-hidden rounded-xl grid-bg">
      <svg viewBox="0 0 840 280" className="absolute inset-0 h-full w-full">
        {edges.map(([a, b]) => {
          const A = byId[a],
            B = byId[b];
          if (!A || !B) return null;
          const hA = SERVICE_HEALTH_AT(t, a, mitigated);
          const hB = SERVICE_HEALTH_AT(t, b, mitigated);
          const bad = hA !== "ok" || hB !== "ok";
          return (
            <line
              key={`${a}-${b}`}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke={
                bad
                  ? COL[hB === "crit" || hA === "crit" ? "crit" : "warn"]
                  : "color-mix(in oklab, var(--foreground) 22%, transparent)"
              }
              strokeWidth={bad ? 2 : 1}
              strokeDasharray={bad ? "4 4" : undefined}
            >
              {bad && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="16"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          );
        })}
        {services.map((s) => {
          const h = SERVICE_HEALTH_AT(t, s.id, mitigated);
          const c = COL[h];
          const isSelected = selectedService === s.id;
          return (
            <g
              key={s.id}
              onClick={() => onSelectService?.(s.id)}
              style={{ cursor: onSelectService ? "pointer" : "default" }}
            >
              <motion.circle
                cx={s.x}
                cy={s.y}
                r={28}
                fill={c}
                opacity={0.12}
                animate={{ r: h === "crit" ? [28, 34, 28] : 28 }}
                transition={{ duration: 1.2, repeat: h === "crit" ? Infinity : 0 }}
              />
              <circle
                cx={s.x}
                cy={s.y}
                r={14}
                fill="color-mix(in oklab, var(--card) 90%, transparent)"
                stroke={c}
                strokeWidth={isSelected ? 3 : 1.5}
              />
              <circle cx={s.x} cy={s.y} r={4} fill={c} />
              {isSelected && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={20}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              )}
              <text
                x={s.x}
                y={s.y + 32}
                textAnchor="middle"
                fontSize="11"
                className="mono"
                fill="currentColor"
                opacity={0.9}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
      {onSelectService && (
        <div className="absolute right-2 top-2 mono text-[9px] uppercase tracking-wider opacity-50">
          click a service · live blast-radius query
        </div>
      )}
    </div>
  );
}
