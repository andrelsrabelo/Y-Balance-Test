'use client';

/** Card padrão das seções: cabeçalho com ícone + título e corpo com padding. */
export default function SectionCard({ icon: Icon, title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
      <header className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </header>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}
