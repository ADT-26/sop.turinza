interface StepperProps {
  steps: readonly string[];
  current: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol
      aria-label="Progreso del formulario"
      className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
    >
      {steps.map((label, index) => {
        const isCurrent = index === current;
        const isDone = index < current;
        return (
          <li key={label} className="shrink-0">
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2 ${
                isCurrent
                  ? "border-primary-dark bg-primary-dark text-white"
                  : isDone
                    ? "border-primary-dark/30 bg-primary/10 text-primary-dark"
                    : "border-line bg-white text-ink-muted hover:border-primary/50"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isCurrent
                    ? "bg-white text-primary-dark"
                    : isDone
                      ? "bg-primary-dark text-white"
                      : "bg-line text-ink-muted"
                }`}
              >
                {index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
