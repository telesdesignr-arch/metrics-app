"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "im_session=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <header className="border-b border-line bg-card">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted">
            Atitude Méier · Comunicação
          </p>
          <h1 className="font-display text-lg font-semibold text-ink leading-tight">
            Painel de Métricas
          </h1>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`text-sm px-3 py-1.5 rounded-sm transition-colors ${
              pathname === "/"
                ? "bg-ink text-white"
                : "text-graphite hover:bg-line"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/nova-metrica"
            className={`text-sm px-3 py-1.5 rounded-sm transition-colors ${
              pathname === "/nova-metrica"
                ? "bg-ink text-white"
                : "text-graphite hover:bg-line"
            }`}
          >
            + Nova métrica
          </Link>
          <Link
            href="/gerenciar"
            className={`text-sm px-3 py-1.5 rounded-sm transition-colors ${
              pathname === "/gerenciar"
                ? "bg-ink text-white"
                : "text-graphite hover:bg-line"
            }`}
          >
            Gerenciar
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-sm text-muted hover:bg-line transition-colors"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
