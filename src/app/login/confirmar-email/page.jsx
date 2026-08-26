"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";

export default function ConfirmarEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const celular = searchParams.get("celular");

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarEmail() {
      if (!celular) {
        setErro("Celular não informado.");
        setCarregando(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/usuario/email?celular=${encodeURIComponent(
            celular
          )}`
        );

        if (!response.ok) {
          throw new Error("Celular não encontrado.");
        }

        const usuario = await response.json();

        setEmail(usuario.email);
      } catch (error) {
        console.error(error);
        setErro("Não foi possível encontrar o e-mail cadastrado.");
      } finally {
        setCarregando(false);
      }
    }

    buscarEmail();
  }, [celular]);

  function continuar() {
    if (!email) return;

    router.push(
      `/login/verificar-email?email=${encodeURIComponent(
        email
      )}&celular=${encodeURIComponent(celular || "")}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* VOLTAR */}
        <Link
          href="/login"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            text-gray-600
            transition
            hover:text-red-600
          "
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-600
              "
            >
              <Mail size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Confirme seu e-mail
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Encontramos um e-mail cadastrado para este celular.
            </p>
          </div>

          {/* CARREGANDO */}
          {carregando && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Buscando seu e-mail...
              </p>
            </div>
          )}

          {/* ERRO */}
          {erro && (
            <div className="mt-8 text-center">
              <p className="text-sm text-red-600">
                {erro}
              </p>
            </div>
          )}

          {/* E-MAIL */}
          {!carregando && !erro && email && (
            <>
              <div
                className="
                  mt-8
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-4
                  text-center
                "
              >
                <p className="text-xs text-gray-500">
                  E-mail cadastrado
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {(email)}
                </p>
              </div>

              <p className="mt-4 text-center text-sm text-gray-500">
                Vamos enviar um código de confirmação para
                este endereço.
              </p>

              {/* CONTINUAR */}
              <button
                type="button"
                onClick={continuar}
                className="
                  mt-6
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
                Confirmar e-mail
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}