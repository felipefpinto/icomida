"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";

export default function EmailRestaurante() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const celular = searchParams.get("celular");
  const origem = searchParams.get("origem");

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setErro("Informe seu e-mail.");
      return;
    }

    if (!validarEmail(emailLimpo)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      router.push(
        `/cadastro/restaurante/confirmar-email?email=${encodeURIComponent(
          emailLimpo
        )}&celular=${encodeURIComponent(
          celular || ""
        )}&origem=${encodeURIComponent(origem || "celular")}`
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={`/cadastro/restaurante/confirmar-telefone?celular=${encodeURIComponent(
            celular || ""
          )}&origem=${encodeURIComponent(origem || "celular")}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Mail size={30} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Qual é o seu e-mail?
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Informe seu e-mail para continuar o cadastro como responsável
              pelo restaurante.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErro("");
              }}
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />

            {erro && (
              <p className="mt-3 text-sm text-red-600">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
            >
              {carregando ? "Continuando..." : "Continuar"}

              {!carregando && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}