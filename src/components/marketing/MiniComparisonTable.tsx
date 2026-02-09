import type { ComparisonRow } from "@/content/marketing";

type Props = {
  title: string;
  subtitle: string;
  columns: string[];
  rows: ComparisonRow[];
};

export function MiniComparisonTable({ title, subtitle, columns, rows }: Props) {
  return (
    <section className="border-t bg-slate-50/50 py-16" aria-labelledby="comparison-heading">
      <div className="container mx-auto px-4">
        <h2 id="comparison-heading" className="mb-2 text-center text-2xl font-bold">
          {title}
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-sm text-muted-foreground">
          {subtitle}
        </p>
        <div className="mx-auto max-w-4xl overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm" role="grid" aria-label={title}>
            <thead>
              <tr className="border-b bg-muted/50">
                <th scope="col" className="p-3 font-semibold">
                  Feature
                </th>
                {columns.map((col) => (
                  <th key={col} scope="col" className="p-3 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3 text-muted-foreground">{row.label}</td>
                  <td className="p-3">{row.freeTools}</td>
                  <td className="p-3">{row.tenantPortal}</td>
                  <td className="p-3">{row.management}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
