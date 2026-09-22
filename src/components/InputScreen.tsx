"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { OrynHeader } from "./OrynHeader";

const DOMAIN_PATTERN = /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/.*)?$/i;

export function InputScreen({ onSubmit }: { onSubmit: (url: string, businessName?: string) => void }) {
  const [value, setValue] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Escribe el sitio web que quieres analizar.");
      return;
    }
    if (!DOMAIN_PATTERN.test(trimmed)) {
      setError("Escribe un dominio válido, por ejemplo: tunegocio.com.do");
      return;
    }
    setError(null);
    onSubmit(trimmed, businessName.trim() || undefined);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-10"
    >
      <OrynHeader />

      <div className="flex flex-col gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl">
          ¿Tu página está lista para vender?
        </h1>
        <p className="max-w-[38ch] text-base leading-relaxed text-[var(--color-text-muted)]">
          Revisamos velocidad, SEO técnico y tu perfil de Google en segundos.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="site-url" className="text-sm font-medium text-[var(--color-text)]">
            Sitio web
          </label>
          <input
            id="site-url"
            name="site-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="tunegocio.com.do"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "site-url-error" : undefined}
            className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 font-[family-name:var(--font-mono)] text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
          />
          {error && (
            <p id="site-url-error" className="text-sm text-[var(--color-fail)]">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="business-name" className="text-sm font-medium text-[var(--color-text)]">
            Nombre del negocio <span className="font-normal text-[var(--color-text-muted)]">(opcional)</span>
          </label>
          <input
            id="business-name"
            name="business-name"
            type="text"
            autoComplete="organization"
            placeholder="Ferretería El Progreso"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Ayuda a encontrar el perfil de Google correcto si el dominio no se parece al nombre real.
          </p>
        </div>

        <button
          type="submit"
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 text-base font-bold text-[#14101f] transition-transform active:scale-[0.98]"
        >
          Analizar sitio
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </form>
    </motion.div>
  );
}
