type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

/**
 * Simple, warm page header for the thin public sub-pages.
 * Rendered inside the (site) layout, above the shared sections.
 */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-border/60 bg-secondary/60">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="pattern-divider mx-auto mt-8 w-40" aria-hidden />
      </div>
    </section>
  );
}
