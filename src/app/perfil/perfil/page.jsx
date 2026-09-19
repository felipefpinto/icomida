"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  Store,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function PerfilResponsavel() {
  const router = useRouter();

  const [responsavel, setResponsavel] =
    useState(null);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    const responsavelSalvo =
      localStorage.getItem(
        "responsavelLogado"
      );

    if (!responsavelSalvo) {
      router.push("/login");
      return;
    }

    try {
      const responsavelLogado =
        JSON.parse(
          responsavelSalvo
        );

      setResponsavel(
        responsavelLogado
      );
    } catch (error) {
      console.error(
        "Erro ao carregar responsável:",
        error
      );

      localStorage.removeItem(
        "responsavelLogado"
      );

      localStorage.removeItem(
        "restauranteSelecionadoId"
      );

      router.push("/login");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  function sair() {
    localStorage.removeItem(
      "responsavelLogado"
    );

    localStorage.removeItem(
      "restauranteSelecionadoId"
    );

    router.push("/login");
  }

  if (carregando) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-50
        "
      >
        <p className="text-sm text-gray-500">
          Carregando...
        </p>
      </main>
    );
  }

  if (!responsavel) {
    return null;
  }

  return (
    <main
      className="
        min-h-screen
        bg-gray-50
        px-4
        py-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-4xl
        "
      >

        {/* TÍTULO */}

        <div className="mb-8">
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <h1
              className="
                text-3xl
                font-bold
                text-gray-900
              "
            >
              Minha conta
            </h1>

            <Link
              href="/restaurantes"
              className="
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

              Voltar para o painel
            </Link>
          </div>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Gerencie seus dados e seus restaurantes.
          </p>
        </div>


        {/* RESPONSÁVEL */}

        <div
          className="
            mb-6
            flex
            items-center
            gap-4
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-600
            "
          >
            <User size={30} />
          </div>

          <div className="min-w-0">
            <h2
              className="
                truncate
                text-lg
                font-bold
                text-gray-900
              "
            >
              {responsavel.nome}
            </h2>

            <p
              className="
                mt-1
                truncate
                text-sm
                text-gray-500
              "
            >
              {responsavel.email}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-gray-400
              "
            >
              Responsável pelo restaurante
            </p>
          </div>
        </div>


        {/* OPÇÕES */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >

          {/* MEU PERFIL */}

          <Link
            href="/restaurantes/perfil/dados-pessoais"
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-100
              p-5
              transition
              hover:bg-gray-50
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <User size={21} />
            </div>

            <div className="flex-1">
              <h3
                className="
                  text-sm
                  font-semibold
                  text-gray-900
                "
              >
                Meu perfil
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Nome, e-mail, celular e dados da conta
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />
          </Link>


          {/* MEUS RESTAURANTES */}

          <Link
            href="/restaurantes/perfil/meus-restaurantes"
            className="
              flex
              items-center
              gap-4
              p-5
              transition
              hover:bg-gray-50
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gray-100
                text-gray-700
              "
            >
              <Store size={21} />
            </div>

            <div className="flex-1">
              <h3
                className="
                  text-sm
                  font-semibold
                  text-gray-900
                "
              >
                Meus restaurantes
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Acesse, gerencie ou exclua seus restaurantes
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />
          </Link>

        </div>


        {/* SAIR */}

        <button
          type="button"
          onClick={sair}
          className="
            mt-6
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            text-sm
            font-semibold
            text-gray-700
            shadow-sm
            transition
            hover:bg-gray-50
          "
        >
          <LogOut size={19} />

          Sair da conta
        </button>

      </div>
    </main>
  );
}