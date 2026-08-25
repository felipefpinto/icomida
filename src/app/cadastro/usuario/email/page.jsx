"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

export default function CadastroEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function continuar() {
    if (!email.trim()) {
      alert("Informe seu e-mail.");
      return;
    }

    router.push(
      `/cadastro/usuario/confirmar-email?email=${encodeURIComponent(email)}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        <Link
          href="/cadastro"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* CABEÇALHO */}
          <div className="mb-8 text-center">

            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Mail size={30} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Qual é o seu e-mail?
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Informe seu e-mail para começar o cadastro.
            </p>

          </div>

          {/* CAMPO DE E-MAIL */}
          <div className="mb-6">

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>

            <div className="relative">

              <Mail
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

            </div>

          </div>

          {/* BOTÃO */}
          <button
            type="button"
            onClick={continuar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Continuar
            <ArrowRight size={20} />
          </button>

          {/* INFORMAÇÃO */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Você receberá um código de confirmação no seu e-mail.
          </p>

        </div>
      </div>
    </main>
  );
}