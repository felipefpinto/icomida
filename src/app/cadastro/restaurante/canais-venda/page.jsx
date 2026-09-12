"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ShoppingBag,
  Store,
} from "lucide-react";

export default function CanaisVenda() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idRestaurante = searchParams.get("id_restaurante");

  const [canaisSelecionados, setCanaisSelecionados] =
    useState([]);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const canais = [
    {
      tipo: "ENTREGA",
      titulo: "Entrega",
      descricao:
        "Os pedidos são entregues no endereço do cliente.",
      icone: Bike,
    },
    {
      tipo: "RETIRADA",
      titulo: "Retirada",
      descricao:
        "O cliente faz o pedido e retira diretamente no restaurante.",
      icone: ShoppingBag,
    },
  ];

  function alternarCanal(tipo) {
    setCanaisSelecionados((atuais) => {
      if (atuais.includes(tipo)) {
        return atuais.filter(
          (canal) => canal !== tipo
        );
      }

      return [...atuais, tipo];
    });

    setErro("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (!idRestaurante) {
      setErro(
        "Restaurante não identificado."
      );
      return;
    }

    if (canaisSelecionados.length === 0) {
      setErro(
        "Selecione pelo menos um canal de venda."
      );
      return;
    }

    try {
      setCarregando(true);

      for (const tipo of canaisSelecionados) {
        const response = await fetch(
          `http://127.0.0.1:8000/restaurantes/${encodeURIComponent(
            idRestaurante
          )}/canais-venda`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tipo,
              ativo: true,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Erro retornado pela API:",
            data
          );

          if (typeof data.detail === "string") {
            throw new Error(data.detail);
          }

          if (Array.isArray(data.detail)) {
            throw new Error(
              data.detail[0]?.msg ||
                "Dados inválidos."
            );
          }

          throw new Error(
            "Não foi possível cadastrar o canal de venda."
          );
        }
      }

      router.push(
        `/cadastro/restaurante/horarios-funcionamento?id_restaurante=${encodeURIComponent(
          idRestaurante
        )}`
      );
    } catch (error) {
      console.error(
        "Erro ao cadastrar canais de venda:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível conectar com o servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* VOLTAR */}
        <button
          type="button"
          onClick={() => router.back()}
          disabled={carregando}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Store size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Canais de venda
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Como seus clientes poderão receber os pedidos?
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            {/* OPÇÕES */}
            <div className="space-y-3">
              {canais.map((canal) => {
                const selecionado =
                  canaisSelecionados.includes(
                    canal.tipo
                  );

                const Icone = canal.icone;

                return (
                  <button
                    key={canal.tipo}
                    type="button"
                    onClick={() =>
                      alternarCanal(canal.tipo)
                    }
                    disabled={carregando}
                    className={`
                      relative flex w-full
                      items-center gap-4
                      rounded-xl border
                      p-4 text-left
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${
                        selecionado
                          ? "border-red-600 bg-red-50 ring-1 ring-red-600"
                          : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40"
                      }
                    `}
                  >
                    {/* ÍCONE */}
                    <div
                      className={`
                        flex h-11 w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          selecionado
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      <Icone size={22} />
                    </div>

                    {/* TEXTO */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`
                          text-sm font-semibold
                          ${
                            selecionado
                              ? "text-red-700"
                              : "text-gray-900"
                          }
                        `}
                      >
                        {canal.titulo}
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {canal.descricao}
                      </p>
                    </div>

                    {/* CHECK */}
                    <div
                      className={`
                        flex h-6 w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        transition
                        ${
                          selecionado
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {selecionado && (
                        <Check size={15} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* INFORMAÇÃO */}
            {canaisSelecionados.length > 0 && (
              <p className="mt-3 text-center text-xs text-gray-500">
                {canaisSelecionados.length === 1
                  ? "1 canal selecionado"
                  : `${canaisSelecionados.length} canais selecionados`}
              </p>
            )}

            {/* ERRO */}
            {erro && (
              <p className="mt-4 text-center text-sm text-red-600">
                {erro}
              </p>
            )}

            {/* CONTINUAR */}
            <button
              type="submit"
              disabled={carregando}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {carregando
                ? "Salvando..."
                : "Continuar"}

              {!carregando && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}