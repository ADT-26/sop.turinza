interface StepperProps {
  steps: readonly string[];
  current: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Progreso del formulario">
      <ol className="scroll-fade-right flex items-center overflow-x-auto pb-2 sm:overflow-visible">
        {steps.map((label, index) => {
          const isCurrent = index === current;
          const isDone = index < current;
          const isLast = index === steps.length - 1;
          return (
            <li key={label} className="flex flex-1 items-center">
              <div className="flex shrink-0 flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Paso ${index + 1}: ${label}`}
                  className={`flex h-7 w-7 shrink-0 rotate-45 items-center justify-center rounded-[4px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark focus-visible:ring-offset-2 ${
                    isCurrent
                      ? "bg-accent"
                      : isDone
                        ? "bg-primary-dark"
                        : "border border-line bg-white hover:border-primary/50"
                  }`}
                >
                  <span
                    className={`-rotate-45 font-mono text-[11px] font-semibold ${
                      isCurrent || isDone ? "text-white" : "text-ink-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                </button>
                <span className="mt-1.5 hidden w-20 text-center text-[10.5px] leading-tight text-ink-muted sm:block">
                  {label}
                </span>
              </div>
              {!isLast && (
                <span
                  className={`mx-1 h-px min-w-3 flex-1 ${isDone ? "bg-primary-dark" : "bg-line"}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
