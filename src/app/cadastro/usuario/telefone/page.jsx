"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Smartphone,
  User,
} from "lucide-react";

export default function TelefoneUsuario() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");

  function formatarTelefone(value) {
    const numeros = value.replace(/\D/g, "");

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7
    )}-${numeros.slice(7, 11)}`;
  }

  function handleTelefoneChange(event) {
    const value = event.target.value;

    if (value.replace(/\D/g, "").length > 11) {
      return;
    }

    setTelefone(formatarTelefone(value));
    setErro("");
  }

  function continuar() {
    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length !== 11) {
      setErro("Digite um telefone válido.");
      return;
    }

    router.push(
      `/cadastro/usuario/verificar-telefone?email=${encodeURIComponent(
        email || ""
      )}&celular=${encodeURIComponent(numeros)}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* VOLTAR */}
        <Link
          href={`/cadastro/usuario/verificar-codigo?email=${encodeURIComponent(
            email || ""
          )}`}
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
              <Smartphone size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">

            <h1 className="text-2xl font-bold text-gray-900">
              Informe seu celular
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Precisamos do seu número de celular para
              continuar o cadastro.
            </p>

          </div>

          {/* CELULAR */}
          <div className="mt-8">

            <label
              htmlFor="telefone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Celular:
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                transition
                focus-within:border-red-600
                focus-within:ring-2
                focus-within:ring-red-100
              "
            >
              <Smartphone
                size={20}
                className="text-gray-400"
              />

              <input
                id="telefone"
                type="tel"
                inputMode="numeric"
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(11) 99999-9999"
                className="
                  h-12
                  w-full
                  bg-transparent
                  text-sm
                  text-gray-900
                  outline-none
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* ERRO */}
            {erro && (
              <p className="mt-2 text-sm text-red-600">
                {erro}
              </p>
            )}

          </div>

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
            Continuar

            <ArrowRight size={18} />
          </button>

        </div>
      </div>
    </main>
  );
}