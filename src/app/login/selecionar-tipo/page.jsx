"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  User,
  Store,
} from "lucide-react";

export default function SelecionarTipo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const celular = searchParams.get("celular");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

async function continuar(tipo) {
  if (!email && !celular) {
    setErro("E-mail ou celular não informado.");
    return;
  }

  setErro("");
  setCarregando(true);

  try {
    // ==========================================
    // LOGIN INICIADO PELO E-MAIL
    // ==========================================
    if (email) {
      const response = await fetch(
        "http://127.0.0.1:8000/verificacao/email/enviar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        setErro(
          data.mensagem ||
            "Não foi possível enviar o código por e-mail."
        );
        return;
      }

      router.push(
        `/login/verificar-email?email=${encodeURIComponent(
          email
        )}&tipo=${encodeURIComponent(tipo)}`
      );

      return;
    }

    // ==========================================
    // LOGIN INICIADO PELO CELULAR
    // ==========================================
    if (celular) {
      const response = await fetch(
        "http://127.0.0.1:8000/verificacao/telefone/enviar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            celular: celular.replace(/\D/g, ""),
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
        `/login/verificar-telefone?celular=${encodeURIComponent(
          celular
        )}&tipo=${encodeURIComponent(tipo)}`
      );
    }
  } catch (error) {
    console.error(
      "Erro ao enviar código:",
      error
    );

    setErro(
      "Não foi possível enviar o código de verificação."
    );
  } finally {
    setCarregando(false);
  }
}

  async function continuarComoResponsavel() {
  await continuar("responsavel");
}

  async function continuarComoResponsavel() {
  await continuar("responsavel");
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

        {/* CARD */}

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* CABEÇALHO */}

          <div className="mb-8 text-center">

            <div className="mb-4 flex justify-center">

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-4xl
                "
              >
                🍔
              </div>

            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Como deseja continuar?
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Encontramos mais de uma forma de acesso para seus dados.
            </p>

          </div>

          {erro && (
          <p className="mb-4 text-center text-sm text-red-600">
            {erro}
          </p>
            )}

          {/* USUÁRIO */}

          <button
            type="button"
            onClick={continuarComoUsuario}
            disabled={carregando}
            className="
              disabled:cursor-not-allowed
              disabled:opacity-50
              mb-4
              flex
              w-full
              items-center
              gap-4
              rounded-xl
              border
              border-gray-200
              p-5
              text-left
              transition
              hover:border-red-500
              hover:bg-red-50
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <User size={24} />
            </div>

            <div className="flex-1">

              <h2 className="font-semibold text-gray-900">
                Entrar como usuário
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Acesse sua conta para pedir comida e acompanhar seus pedidos.
              </p>

            </div>

            <ArrowRight
              size={20}
              className="text-gray-400"
            />

          </button>

          {/* RESPONSÁVEL / RESTAURANTE */}

          <button
            type="button"
            onClick={continuarComoResponsavel}
            disabled={carregando}
            className="
            disabled:cursor-not-allowed
disabled:opacity-50
              flex
              w-full
              items-center
              gap-4
              rounded-xl
              border
              border-gray-200
              p-5
              text-left
              transition
              hover:border-red-500
              hover:bg-red-50
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <Store size={24} />
            </div>

            <div className="flex-1">

              <h2 className="font-semibold text-gray-900">
                Gerenciar restaurante
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Acesse o painel para gerenciar seu restaurante.
              </p>

            </div>

            <ArrowRight
              size={20}
              className="text-gray-400"
            />

          </button>

          {/* INFORMAÇÃO */}

          {email && (
            <p className="mt-6 text-center text-xs text-gray-400">
              E-mail informado: {email}
            </p>
          )}

          {celular && (
            <p className="mt-6 text-center text-xs text-gray-400">
              Celular informado: {celular}
            </p>
          )}

        </div>

        {/* TERMOS */}

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">

          Ao continuar, você concorda com os

          <span className="mx-1 text-gray-500 underline">
            Termos de Uso
          </span>

          e a

          <span className="mx-1 text-gray-500 underline">
            Política de Privacidade
          </span>

          do iComida.

        </p>

      </div>
    </main>
  );
}