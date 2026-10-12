
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  Smartphone,
  ArrowRight,
  User,
} from "lucide-react";

export default function CadastroUsuario() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const celular = searchParams.get("celular");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

async function confirmarCelular() {
  if (!celular || carregando) {
    return;
  }

  setErro("");
  setCarregando(true);

  try {
    const celularNumeros = celular.replace(/\D/g, "");

    const response = await fetch(
      "http://127.0.0.1:8000/verificacao/telefone/enviar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          celular: celularNumeros,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.sucesso) {
      setErro(
        data.mensagem || "Não foi possível enviar o código."
      );
      return;
    }

    router.push(
      `/cadastro/usuario/verificar-telefone?celular=${encodeURIComponent(
        celular
      )}`
    );
  } catch (error) {
    console.error("Erro ao enviar código:", error);

    setErro(
      "Não foi possível conectar ao servidor. Tente novamente."
    );
  } finally {
    setCarregando(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* VOLTAR */}
        <Link
          href={`/cadastro?celular=${encodeURIComponent(celular || "")}`}
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
              <User size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Confirme seu celular
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Vamos utilizar este celular para criar sua conta.
            </p>
          </div>

          {/* CELULAR */}
          <div
            className="
              mt-8
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-4
            "
          >
            {/* ÍCONE DO CELULAR */}
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-red-50
                text-red-600
              "
            >
              <Smartphone size={20} />
            </div>

            {/* NÚMERO */}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">
                Celular
              </p>

              <p className="truncate font-medium text-gray-900">
                {celular || "Celular não informado"}
              </p>
            </div>
          </div>
          {erro && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {erro}
          </div>
            )}

          {/* CONFIRMAR */}
          <button
            type="button"
            onClick={confirmarCelular}
            disabled={!celular || carregando}
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
              disabled:cursor-not-allowed
              disabled:bg-gray-300
            "
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

          {/* ALTERAR */}
          <Link
            href="/login"
            className="
              mt-4
              block
              text-center
              text-sm
              font-medium
              text-red-600
              hover:text-red-700
            "
          >
            Usar outro celular
          </Link>

        </div>
      </div>
    </main>
  );
}