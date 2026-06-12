'use client';

const baseInputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

export function FieldLabel({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input type="text" className={`${baseInputClass} ${className}`} {...props} />;
}

export function DateInput({ className = '', ...props }) {
  return <input type="date" className={`${baseInputClass} ${className}`} {...props} />;
}

/** Mantém apenas dígitos e um único separador decimal (vírgula ou ponto). */
export function sanitizeDecimal(raw, maxLen = 6) {
  let s = raw.replace(/[^\d.,]/g, '');
  const sep = s.search(/[.,]/);
  if (sep !== -1) {
    s = s.slice(0, sep + 1) + s.slice(sep + 1).replace(/[.,]/g, '');
  }
  return s.slice(0, maxLen);
}

export function DecimalInput({ value, onChange, className = '', ...props }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(sanitizeDecimal(e.target.value))}
      className={`${baseInputClass} ${className}`}
      {...props}
    />
  );
}

export function IntegerInput({ value, onChange, maxLen = 3, className = '', ...props }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, maxLen))}
      className={`${baseInputClass} ${className}`}
      {...props}
    />
  );
}
