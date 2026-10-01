import { ChevronDown } from 'lucide-react';

/** Standaard ingeklapt. */
export function Disclosure({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex min-h-touch cursor-pointer list-none items-center gap-2 py-2 text-body font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex-1">{title}</span>
        {aside}
        <ChevronDown
          aria-hidden
          size={20}
          className="text-ink-3 transition-transform duration-(--duration-base) group-open:rotate-180"
        />
      </summary>
      <div className="pb-4 text-body text-ink-2">{children}</div>
    </details>
  );
}
