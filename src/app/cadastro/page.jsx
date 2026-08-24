"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Store,
} from "lucide-react";

export default function Cadastro() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const celular = searchParams.get("celular");

  function cadastrarUsuario() {
    // Cadastro iniciado por e-mail
    if (email) {
      router.push(
        `/cadastro/usuario/confirmar-email?email=${encodeURIComponent(
          email
        )}`
      );
      return;
    }

    // Cadastro iniciado por telefone
    if (celular) {
      router.push(
        `/cadastro/usuario/confirmar-telefone?celular=${encodeURIComponent(
          celular
        )}`
      );
      return;
    }
  }

  function cadastrarRestaurante() {
    // Cadastro de restaurante por e-mail
    if (email) {
      router.push(
        `/cadastro/restaurante/confirmar-email?email=${encodeURIComponent(
          email
        )}`
      );
      return;
    }

    // Cadastro de restaurante por celular
    if (celular) {
      router.push(
        `/cadastro/restaurante/confirmar-telefone?celular=${encodeURIComponent(
          celular
        )}`
      );
      return;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

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

          <div className="mb-8 text-center">
            <div className="mb-4 text-4xl">
              🍔
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Como você deseja se cadastrar?
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Escolha uma opção para continuar
            </p>
          </div>

          {/* CADASTRO DE USUÁRIO */}
          <button
            type="button"
            onClick={cadastrarUsuario}
            className="
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
                Quero pedir comida
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Crie sua conta para pedir nos seus restaurantes favoritos.
              </p>
            </div>

            <ArrowRight
              size={20}
              className="text-gray-400"
            />
          </button>

          {/* CADASTRO DE RESTAURANTE */}
          <button
            type="button"
            onClick={cadastrarRestaurante}
            className="
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
                Quero cadastrar meu restaurante
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Cadastre seu restaurante e comece a vender seus produtos.
              </p>
            </div>

            <ArrowRight
              size={20}
              className="text-gray-400"
            />
          </button>

          {/* INFORMAÇÃO DO CADASTRO */}
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
      </div>
    </main>
  );
}