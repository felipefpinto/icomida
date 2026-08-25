"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  ArrowRight,
} from "lucide-react";

export default function ConfirmarTelefoneLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [celular, setCelular] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function buscarTelefone() {
      if (!email) {
        setErro("E-mail não informado.");
        setCarregando(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/usuario/telefone?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
          throw new Error("Telefone não encontrado.");
        }

        const data = await response.json();

        setCelular(data.numero);
      } catch (error) {
        setErro("Não foi possível encontrar o telefone cadastrado.");
      } finally {
        setCarregando(false);
      }
    }

    buscarTelefone();
  }, [email]);

  function enviarCodigo() {
    router.push(
      `/login/verificar-telefone?email=${encodeURIComponent(
        email
      )}&celular=${encodeURIComponent(celular)}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Smartphone size={30} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Confirme seu telefone
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Enviaremos um código de confirmação para o número:
            </p>

            {carregando && (
              <p className="mt-4 text-gray-500">
                Carregando telefone...
              </p>
            )}

            {erro && (
              <p className="mt-4 text-sm text-red-600">
                {erro}
              </p>
            )}

            {!carregando && !erro && (
              <p className="mt-4 text-lg font-semibold text-gray-900">
                {celular}
              </p>
            )}
          </div>

          {!carregando && !erro && (
            <button
              type="button"
              onClick={enviarCodigo}
              className="
                mt-8
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-red-600
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
              "
            >
              Enviar código
              <ArrowRight size={18} />
            </button>
          )}

        </div>
      </div>
    </main>
  );
}