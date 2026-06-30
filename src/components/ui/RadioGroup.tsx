interface RadioGroupProps {
  name: string;
  options: readonly string[];
  value?: string;
  onChange?: (value: string) => void;
}

export function RadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const id = `${name}-${opt}`;
        const checked = value === opt;
        return (
          <label
            key={opt}
            htmlFor={id}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-dark has-[:focus-visible]:ring-offset-2 ${
              checked
                ? "border-primary-dark bg-primary-dark text-white"
                : "border-line bg-white text-ink-muted hover:border-primary/50"
            }`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt}
              checked={checked}
              onChange={() => onChange?.(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}
