"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bike,
  Store,
  Save,
  CheckCircle2,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

export default function CanaisVenda() {
  const router = useRouter();

  const [idRestaurante, setIdRestaurante] =
    useState(null);

  const [canaisExistentes, setCanaisExistentes] =
    useState([]);

  const [entrega, setEntrega] =
    useState(false);

  const [retirada, setRetirada] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  useEffect(() => {
    const restauranteSelecionadoId =
      localStorage.getItem(
        "restauranteSelecionadoId"
      );

    if (!restauranteSelecionadoId) {
      router.push("/restaurantes");
      return;
    }

    setIdRestaurante(
      restauranteSelecionadoId
    );

    buscarCanaisVenda(
      restauranteSelecionadoId
    );
  }, [router]);

  async function buscarCanaisVenda(
    restauranteId
  ) {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `http://127.0.0.1:8000/restaurantes/${restauranteId}/canais-venda`
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os canais de venda."
        );
      }

      const dados = await response.json();

      setCanaisExistentes(dados);

      const canalEntrega = dados.find(
        (canal) =>
          canal.tipo === "ENTREGA"
      );

      const canalRetirada = dados.find(
        (canal) =>
          canal.tipo === "RETIRADA"
      );

      setEntrega(
        canalEntrega?.ativo ?? false
      );

      setRetirada(
        canalRetirada?.ativo ?? false
      );
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar os canais de venda."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function salvarCanal(
    tipo,
    ativo
  ) {
    const canalExistente =
      canaisExistentes.find(
        (canal) =>
          canal.tipo === tipo
      );

    // =================================
    // CANAL JÁ EXISTE → PATCH
    // =================================

    if (canalExistente) {
      const response = await fetch(
        `http://127.0.0.1:8000/restaurantes/${idRestaurante}/canais-venda/${canalExistente.id_canal_venda}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ativo: ativo,
          }),
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        console.error(dados);

        throw new Error(
          dados.detail ||
            `Não foi possível atualizar o canal ${tipo}.`
        );
      }

      return dados;
    }

    // =================================
    // CANAL NÃO EXISTE
    // =================================
    // Só cria se estiver sendo ativado.

    if (!ativo) {
      return null;
    }

    const response = await fetch(
      `http://127.0.0.1:8000/restaurantes/${idRestaurante}/canais-venda`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          tipo: tipo,
          ativo: true,
        }),
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      console.error(dados);

      throw new Error(
        dados.detail ||
          `Não foi possível criar o canal ${tipo}.`
      );
    }

    return dados;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!entrega && !retirada) {
      setErro(
        "O restaurante precisa possuir pelo menos um canal de venda ativo."
      );

      return;
    }

    try {
      setSalvando(true);

      await salvarCanal(
        "ENTREGA",
        entrega
      );

      await salvarCanal(
        "RETIRADA",
        retirada
      );

      // Recarrega para pegar novos IDs,
      // caso algum canal tenha sido criado.

      await buscarCanaisVenda(
        idRestaurante
      );

      setSucesso(
        "Canais de venda atualizados com sucesso."
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível atualizar os canais de venda."
      );
    } finally {
      setSalvando(false);
    }
  }

  function alternarEntrega() {
    setEntrega(
      (valorAtual) =>
        !valorAtual
    );

    setErro("");
    setSucesso("");
  }

  function alternarRetirada() {
    setRetirada(
      (valorAtual) =>
        !valorAtual
    );

    setErro("");
    setSucesso("");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}

      <SidebarRestaurante />

      {/* CONTEÚDO */}

      <div className="min-w-0 flex-1">

        {/* HEADER */}

        <header
          className="
            flex
            h-20
            items-center
            border-b
            border-gray-200
            bg-white
            px-6
            lg:px-8
          "
        >
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Entrega e Retirada
            </h1>

            <p className="text-xs text-gray-400">
              Escolha como seus clientes podem receber os pedidos
            </p>
          </div>
        </header>

        {/* CONTEÚDO */}

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-4xl">

            {/* TÍTULO */}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Formas de atendimento
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Ative os canais de entrega disponíveis para o restaurante.
              </p>
            </div>

            {carregando ? (

              <div
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-8
                  text-center
                  text-sm
                  text-gray-500
                "
              >
                Carregando canais entrega...
              </div>

            ) : (

              <form
                onSubmit={handleSubmit}
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                  shadow-sm
                  md:p-8
                "
              >

                {/* ERRO */}

                {erro && (
                  <div
                    className="
                      mb-6
                      rounded-lg
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      text-red-700
                    "
                  >
                    {erro}
                  </div>
                )}

                {/* SUCESSO */}

                {sucesso && (
                  <div
                    className="
                      mb-6
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-green-200
                      bg-green-50
                      px-4
                      py-3
                      text-sm
                      text-green-700
                    "
                  >
                    <CheckCircle2
                      size={18}
                    />

                    {sucesso}
                  </div>
                )}

                {/* CARDS */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-2
                  "
                >

                  {/* ENTREGA */}

                  <button
                    type="button"
                    onClick={
                      alternarEntrega
                    }
                    className={`
                      relative
                      flex
                      min-h-44
                      flex-col
                      items-start
                      rounded-2xl
                      border-2
                      p-5
                      text-left
                      transition

                      ${
                        entrega
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }
                    `}
                  >

                    <div
                      className={`
                        mb-4
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl

                        ${
                          entrega
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      <Bike size={24} />
                    </div>

                    <h3
                      className={`
                        font-semibold

                        ${
                          entrega
                            ? "text-red-700"
                            : "text-gray-900"
                        }
                      `}
                    >
                      Entrega
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      O cliente recebe o pedido no endereço informado.
                    </p>

                    {/* CHECK */}

                    <div
                      className={`
                        absolute
                        right-5
                        top-5
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        border

                        ${
                          entrega
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {entrega && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <span
                      className={`
                        mt-auto
                        pt-4
                        text-xs
                        font-semibold

                        ${
                          entrega
                            ? "text-green-700"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {entrega
                        ? "Ativo"
                        : "Inativo"}
                    </span>

                  </button>

                  {/* RETIRADA */}

                  <button
                    type="button"
                    onClick={
                      alternarRetirada
                    }
                    className={`
                      relative
                      flex
                      min-h-44
                      flex-col
                      items-start
                      rounded-2xl
                      border-2
                      p-5
                      text-left
                      transition

                      ${
                        retirada
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }
                    `}
                  >

                    <div
                      className={`
                        mb-4
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl

                        ${
                          retirada
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      <Store size={24} />
                    </div>

                    <h3
                      className={`
                        font-semibold

                        ${
                          retirada
                            ? "text-red-700"
                            : "text-gray-900"
                        }
                      `}
                    >
                      Retirada
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      O cliente faz o pedido e retira diretamente no restaurante.
                    </p>

                    {/* CHECK */}

                    <div
                      className={`
                        absolute
                        right-5
                        top-5
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        border

                        ${
                          retirada
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {retirada && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <span
                      className={`
                        mt-auto
                        pt-4
                        text-xs
                        font-semibold

                        ${
                          retirada
                            ? "text-green-700"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {retirada
                        ? "Ativo"
                        : "Inativo"}
                    </span>

                  </button>

                </div>

                {/* INFORMAÇÃO */}

                <div
                  className="
                    mt-6
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-4
                  "
                >
                  <p className="text-sm text-gray-600">
                    O restaurante precisa manter
                    pelo menos uma forma de
                    atendimento ativa.
                  </p>
                </div>

                {/* BOTÃO */}

                <div
                  className="
                    mt-8
                    flex
                    justify-end
                    border-t
                    border-gray-100
                    pt-6
                  "
                >
                  <button
                    type="submit"
                    disabled={salvando}
                    className="
                      flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-red-600
                      px-6
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <Save size={18} />

                    {salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                </div>

              </form>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}