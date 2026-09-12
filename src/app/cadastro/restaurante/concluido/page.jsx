"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Store,
} from "lucide-react";

export default function CadastroConcluido() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idRestaurante = searchParams.get("id_restaurante");

  function handleContinuar() {
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={44} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Cadastro concluído!
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              As informações do seu restaurante foram
              analisadas e o cadastro foi aprovado com sucesso.
            </p>
          </div>

          {/* STATUS */}
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check size={20} />
              </div>

              <div>
                <p className="text-xs font-medium text-green-700">
                  Status do restaurante
                </p>

                <p className="mt-0.5 font-semibold text-green-800">
                  Ativo
                </p>
              </div>
            </div>
          </div>

          {/* INFORMAÇÃO */}
          <div className="mt-4 flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Store
              size={21}
              className="mt-0.5 shrink-0 text-gray-500"
            />

            <div>
              <p className="text-sm font-medium text-gray-800">
                Seu restaurante está pronto
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                O cadastro foi concluído e o restaurante
                está ativo no iComida.
              </p>
            </div>
          </div>
          {/* CONTINUAR */}
          <button
            type="button"
            onClick={handleContinuar}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Continuar

            <ArrowRight size={18} />
          </button>

        </div>
      </div>
    </main>
  );
}