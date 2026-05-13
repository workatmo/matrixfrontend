import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-neutral-600">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.href}-${idx}`} className="flex items-center gap-2">
              {idx > 0 ? <span className="text-neutral-300">/</span> : null}
              {isLast ? (
                <span className="font-medium text-neutral-900">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-neutral-900 hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

