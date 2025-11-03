"use client";

import Link from "next/link";
import Image from "next/image";

type AuthHeaderProps = {
  preText: string;
  ctaHref: string;
  ctaLabel: string;
};

export default function AuthHeader({ preText, ctaHref, ctaLabel }: AuthHeaderProps) {
  return (
    <header className="w-full bg-[#141414] border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          {/* Usar logo desde public/assets para compatibilidad con Turbopack */}
          <Image src="/assets/logo-wow.svg" alt="Warclass" width={28} height={28} className="opacity-90" />
          <span className="sr-only">Warclass</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-neutral-300">{preText}</span>
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
