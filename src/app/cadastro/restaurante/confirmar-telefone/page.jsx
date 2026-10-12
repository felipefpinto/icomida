"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Smartphone,
  ArrowRight,
  Store,
} from "lucide-react";

export default function ConfirmarTelefoneRestaurante() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const celular = searchParams.get("celular");
  const origem = searchParams.get("origem");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmarCelular() {
  if (!celular) {
    setErro("Celular não informado.");
    return;
  }

  const celularLimpo = celular.replace(/\D/g, "");

  if (celularLimpo.length !== 11) {
    setErro("Informe um celular válido.");
    return;
  }

  setErro("");
  setCarregando(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/verificacao/telefone/enviar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          celular: celularLimpo,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.sucesso) {
      setErro(
        data.mensagem ||
          "Não foi possível enviar o código por SMS."
      );
      return;
    }

    router.push(
      `/cadastro/restaurante/verificar-telefone?email=${encodeURIComponent(
        email || ""
      )}&celular=${encodeURIComponent(
        celularLimpo
      )}&origem=${encodeURIComponent(origem || "")}`
    );
  } catch (error) {
    console.error(
      "Erro ao enviar código por SMS:",
      error
    );

    setErro(
      "Não foi possível enviar o código por SMS."
    );
  } finally {
    setCarregando(false);
  }
}

  function formatarCelular(numero) {
    if (!numero) {
      return "Celular não informado";
    }

    return numero.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={
            email
              ? `/cadastro/restaurante/telefone?email=${encodeURIComponent(
                  email
                )}&origem=${encodeURIComponent(origem || "")}`
              : `/cadastro?celular=${encodeURIComponent(celular || "")}`
          }
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Store size={30} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Confirme seu celular
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Vamos utilizar este celular no cadastro do responsável pelo
              restaurante.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Smartphone size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">
                Celular
              </p>

              <p className="truncate font-medium text-gray-900">
                {formatarCelular(celular)}
              </p>
            </div>
            {erro && (
            <p className="mt-4 text-center text-sm text-red-600">
              {erro}
            </p>
          )}
          </div>

          <button
            type="button"
            onClick={confirmarCelular}
            disabled={!celular || carregando}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {carregando ? (
            "Enviando código..."
          ) : (
            <>
              Confirmar celular
              <ArrowRight size={18} />
            </>
          )}
          </button>

          <Link
            href="/login"
            className="mt-4 block text-center text-sm font-medium text-red-600 hover:text-red-700"
          >
            Usar outro celular
          </Link>
        </div>
      </div>
    </main>
  );
}