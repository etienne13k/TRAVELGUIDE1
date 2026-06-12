"use client";

interface Step {
  key: string;
  label: string;
  description: string;
  is_completed: boolean;
  is_active: boolean;
}

const STEP_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  order_received:       { icon: "✅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  questionnaire_filled: { icon: "📋", color: "#425B48", bg: "#d4e0d6", border: "#b3cbb9" },
  generating:           { icon: "🤖", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  human_review:         { icon: "👀", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  pdf_conversion:       { icon: "📄", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  delivered:            { icon: "✈️", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

export default function OrderTimeline({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-1">
      {steps.map((step, i) => {
        const cfg = STEP_CONFIG[step.key] ?? { icon: "⏳", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
        const isLast = i === steps.length - 1;
        const isGray = !step.is_completed && !step.is_active;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Left connector */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 transition-all duration-300"
                style={{
                  background: isGray ? "#f3f4f6" : cfg.bg,
                  border: `2px solid ${isGray ? "#e5e7eb" : cfg.border}`,
                  boxShadow: step.is_active ? `0 0 0 4px ${cfg.border}` : undefined,
                }}
              >
                <span style={{ filter: isGray ? "grayscale(1) opacity(0.4)" : undefined }}>
                  {cfg.icon}
                </span>
              </div>
              {!isLast && (
                <div
                  className="w-0.5 flex-1 my-1 min-h-[24px]"
                  style={{ background: step.is_completed ? cfg.color : "#e5e7eb" }}
                />
              )}
            </div>

            {/* Content */}
            <div
              className="mb-2 rounded-xl px-4 py-3 flex-1 transition-all duration-300"
              style={{
                background: isGray ? "#f9fafb" : cfg.bg,
                border: `1px solid ${isGray ? "#e5e7eb" : cfg.border}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="font-semibold text-sm"
                  style={{ color: isGray ? "#9ca3af" : cfg.color }}
                >
                  {step.label}
                </span>
                {step.is_completed && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    ✓ Complété
                  </span>
                )}
                {step.is_active && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full animate-pulse" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    En cours…
                  </span>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: isGray ? "#d1d5db" : "#6b7280" }}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
