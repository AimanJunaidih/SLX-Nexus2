import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T) => string;
}

export default function DataTable<T>({ columns, data, keyFn }: DataTableProps<T>) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={col.width ? { width: col.width } : undefined}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={keyFn(row)}>
            {columns.map((col) => (
              <td key={col.key}>{col.render(row)}</td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
