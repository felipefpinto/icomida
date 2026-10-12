"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";

export default function HeaderRestaurante() {
  const router = useRouter();

  const [responsavel, setResponsavel] =
    useState(null);

  const [perfilOpen, setPerfilOpen] =
    useState(false);

  useEffect(() => {
    const responsavelSalvo =
      localStorage.getItem(
        "responsavelLogado"
      );

    if (responsavelSalvo) {
      setResponsavel(
        JSON.parse(responsavelSalvo)
      );
    }
  }, []);

  function sair() {
    localStorage.removeItem(
      "responsavelLogado"
    );

    localStorage.removeItem(
      "restauranteSelecionadoId"
    );

    setResponsavel(null);
    setPerfilOpen(false);

    router.push("/login");
  }

  return (
    <header
      className="
        flex
        h-[72px]
        items-center
        justify-between
        border-b
        border-gray-200
        bg-white
        px-8
      "
    >
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Área do restaurante
        </h1>

        <p className="text-xs text-gray-500">
          Gerencie seu restaurante
        </p>
      </div>

      {responsavel && (
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setPerfilOpen(
                !perfilOpen
              )
            }
            className="
              flex
              items-center
              gap-3
              rounded-lg
              px-3
              py-2
              transition
              hover:bg-gray-100
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-red-600
              "
            >
              <User size={21} />
            </div>

            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500">
                Olá!
              </span>

              <strong className="text-sm font-semibold text-gray-800">
                {responsavel.nome
                  ?.split(" ")[0]}
              </strong>
            </div>

            <ChevronDown
              size={16}
              className={`
                text-gray-500
                transition-transform
                ${
                  perfilOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          {perfilOpen && (
            <div
              className="
                absolute
                right-0
                top-full
                z-50
                mt-2
                w-56
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-lg
              "
            >
              <div
                className="
                  border-b
                  border-gray-100
                  px-4
                  py-3
                "
              >
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900
                  "
                >
                  {responsavel.nome}
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-xs
                    text-gray-500
                  "
                >
                  {responsavel.email}
                </p>
              </div>

              <Link
                href="/restaurantes/perfil"
                onClick={() =>
                  setPerfilOpen(false)
                }
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-sm
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                <User size={18} />

                Meu perfil
              </Link>

              <button
                type="button"
                onClick={sair}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  border-t
                  border-gray-100
                  px-4
                  py-3
                  text-sm
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >
                <LogOut size={18} />

                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}