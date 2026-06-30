import type { ReactNode } from "react";

interface RepeatableTableProps<T> {
  rows: readonly T[];
  renderRow: (row: T, index: number) => ReactNode;
  getRowKey: (row: T, index: number) => string;
  onAddRow?: () => void;
  onRemoveRow?: (index: number) => void;
  addLabel?: string;
}

export function RepeatableTable<T>({
  rows,
  renderRow,
  getRowKey,
  onAddRow,
  onRemoveRow,
  addLabel = "Agregar fila",
}: RepeatableTableProps<T>) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={getRowKey(row, index)} className="rounded-lg border border-line bg-surface p-4">
          <div className="grid gap-4 sm:grid-cols-2">{renderRow(row, index)}</div>
          {onRemoveRow && (
            <button
              type="button"
              onClick={() => onRemoveRow(index)}
              className="mt-3 text-xs font-medium text-accent hover:underline"
            >
              Eliminar fila
            </button>
          )}
        </div>
      ))}
      {onAddRow && (
        <button
          type="button"
          onClick={onAddRow}
          className="rounded-md border border-dashed border-primary/40 px-4 py-2 text-sm font-medium text-primary-dark hover:bg-primary/5"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}
