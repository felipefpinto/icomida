"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  ChevronUp,
  PackagePlus,
  Pencil,
  Plus,
  Settings2,
  Store,
  Trash2,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const API_URL = "http://127.0.0.1:8000";

export default function ComplementosRestaurante() {
  const router = useRouter();

  const [restauranteId, setRestauranteId] =
    useState(null);

  const [grupos, setGrupos] =
    useState([]);

  const [complementosPorGrupo, setComplementosPorGrupo] =
    useState({});

  const [gruposAbertos, setGruposAbertos] =
    useState({});

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    const idSalvo = localStorage.getItem(
      "restauranteSelecionadoId"
    );

    if (!idSalvo) {
      setCarregando(false);
      return;
    }

    const id = Number(idSalvo);

    setRestauranteId(id);

    carregarGrupos(id);
  }, []);

  async function carregarGrupos(idRestaurante) {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `${API_URL}/restaurantes/${idRestaurante}/grupos-complementos/`
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os grupos de complementos."
        );
      }

      const dados = await response.json();

      setGrupos(dados);

      const mapaComplementos = {};

      await Promise.all(
        dados.map(async (grupo) => {
          try {
            const responseComplementos =
              await fetch(
                `${API_URL}/restaurantes/${idRestaurante}/grupos-complementos/${grupo.id_grupo}/complementos/`
              );

            if (!responseComplementos.ok) {
              mapaComplementos[
                grupo.id_grupo
              ] = [];

              return;
            }

            const dadosComplementos =
              await responseComplementos.json();

            mapaComplementos[
              grupo.id_grupo
            ] = dadosComplementos;
          } catch (error) {
            console.error(error);

            mapaComplementos[
              grupo.id_grupo
            ] = [];
          }
        })
      );

      setComplementosPorGrupo(
        mapaComplementos
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível carregar os complementos."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function excluirGrupo(grupo) {
  const confirmar = window.confirm(
    `Tem certeza que deseja excluir o grupo "${grupo.nome}" definitivamente?\n\n` +
      "Ele será removido de todos os produtos que utilizam este grupo."
  );

  if (!confirmar) {
    return;
  }

  try {
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/grupos-complementos/${grupo.id_grupo}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      let mensagem =
        "Não foi possível excluir o grupo.";

      try {
        const dados = await response.json();

        mensagem =
          dados.detail || mensagem;
      } catch {
        // resposta sem JSON
      }

      throw new Error(mensagem);
    }

    setGrupos((listaAtual) =>
      listaAtual.filter(
        (item) =>
          item.id_grupo !==
          grupo.id_grupo
      )
    );

    setComplementosPorGrupo(
      (estadoAtual) => {
        const novoEstado = {
          ...estadoAtual,
        };

        delete novoEstado[
          grupo.id_grupo
        ];

        return novoEstado;
      }
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível excluir o grupo."
    );
  }
}

  function alternarGrupo(idGrupo) {
    setGruposAbertos(
      (estadoAtual) => ({
        ...estadoAtual,
        [idGrupo]:
          !estadoAtual[idGrupo],
      })
    );
  }

  function formatarPreco(valor) {
    const preco = Number(valor || 0);

    if (preco === 0) {
      return "Sem acréscimo";
    }

    return preco.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function textoSelecoes(grupo) {
    if (
      grupo.min_selecoes ===
      grupo.max_selecoes
    ) {
      return grupo.min_selecoes === 1
        ? "Escolha 1 opção"
        : `Escolha ${grupo.min_selecoes} opções`;
    }

    if (grupo.min_selecoes === 0) {
      return `Escolha até ${grupo.max_selecoes}`;
    }

    return `Escolha de ${grupo.min_selecoes} até ${grupo.max_selecoes}`;
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarRestaurante />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            Carregando complementos...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarRestaurante />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">

          {/* CABEÇALHO */}

          <div className="
            mb-8
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-center
            md:justify-between
          ">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Complementos
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Gerencie os grupos de complementos
                disponíveis no seu restaurante.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/restaurantes/cardapio/complementos/novo"
                )
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-red-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-red-700
              "
            >
              <Plus size={18} />

              Novo grupo
            </button>
          </div>

          {/* ERRO */}

          {erro && (
            <div className="
              mb-6
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            ">
              {erro}
            </div>
          )}

          {/* SEM RESTAURANTE */}

          {!restauranteId && (
            <div className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-10
              text-center
            ">
              <Store
                size={42}
                className="mx-auto mb-3 text-gray-300"
              />

              <h2 className="font-medium text-gray-900">
                Nenhum restaurante selecionado
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Selecione um restaurante para
                gerenciar os complementos.
              </p>
            </div>
          )}

          {/* SEM GRUPOS */}

          {restauranteId &&
            grupos.length === 0 && (
              <div className="
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-white
                p-12
                text-center
              ">
                <PackagePlus
                  size={44}
                  className="mx-auto mb-4 text-gray-300"
                />

                <h2 className="text-lg font-medium text-gray-900">
                  Nenhum grupo de complementos
                </h2>

                <p className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  text-gray-500
                ">
                  Crie grupos de complementos para
                  oferecer opções adicionais aos
                  seus produtos.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/restaurantes/cardapio/complementos/novo"
                    )
                  }
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-red-700
                  "
                >
                  <Plus size={18} />

                  Criar grupo
                </button>
              </div>
            )}

          {/* GRUPOS */}

          {restauranteId &&
            grupos.length > 0 && (
              <div className="space-y-4">
                {grupos.map((grupo) => {
                  const complementos =
                    complementosPorGrupo[
                      grupo.id_grupo
                    ] || [];

                  const aberto =
                    gruposAbertos[
                      grupo.id_grupo
                    ] ?? false;

                  return (
                    <section
                      key={grupo.id_grupo}
                      className="
                        overflow-hidden
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                      "
                    >
                      {/* CABEÇALHO DO GRUPO */}

                      <div className="
                        flex
                        flex-col
                        gap-4
                        px-5
                        py-4
                        md:flex-row
                        md:items-center
                        md:justify-between
                      ">
                        <div className="min-w-0 flex-1">
                          <div className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          ">
                            <Settings2
                              size={19}
                              className="text-red-600"
                            />

                            <h2 className="
                              font-semibold
                              text-gray-900
                            ">
                              {grupo.nome}
                            </h2>

                            <span
                              className={`
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                ${
                                  grupo.obrigatorio
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                                }
                              `}
                            >
                              {grupo.obrigatorio
                                ? "Obrigatório"
                                : "Opcional"}
                            </span>

                            {!grupo.ativo && (
                              <span className="
                                rounded-full
                                bg-gray-100
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                text-gray-500
                              ">
                                Inativo
                              </span>
                            )}
                          </div>

                          {grupo.descricao && (
                            <p className="
                              mt-2
                              text-sm
                              text-gray-500
                            ">
                              {grupo.descricao}
                            </p>
                          )}

                          <div className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-1
                            text-xs
                            text-gray-500
                          ">
                            <span>
                              {textoSelecoes(
                                grupo
                              )}
                            </span>

                            <span>
                              {complementos.length}{" "}
                              {complementos.length ===
                              1
                                ? "opção"
                                : "opções"}
                            </span>
                          </div>
                        </div>

                        {/* AÇÕES */}

                        <div className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                        ">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/restaurantes/cardapio/complementos/${grupo.id_grupo}/editar`
                              )
                            }
                            className="
                              flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-gray-300
                              bg-white
                              px-3
                              py-2
                              text-sm
                              font-medium
                              text-gray-700
                              transition
                              hover:bg-gray-50
                            "
                          >
                            <Pencil size={16} />

                            Gerenciar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                                excluirGrupo(grupo)
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-red-200
                                bg-white
                                px-3
                                py-2
                                text-sm
                                font-medium
                                text-red-600
                                transition
                                hover:bg-red-50
                            "
                            >
                            <Trash2 size={16} />

                            Excluir
                            </button>

                          <button
                            type="button"
                            onClick={() =>
                              alternarGrupo(
                                grupo.id_grupo
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-gray-300
                              bg-white
                              text-gray-500
                              transition
                              hover:bg-gray-50
                            "
                            aria-label={
                              aberto
                                ? "Fechar opções"
                                : "Ver opções"
                            }
                          >
                            {aberto ? (
                              <ChevronUp
                                size={18}
                              />
                            ) : (
                              <ChevronDown
                                size={18}
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* COMPLEMENTOS */}

                      {aberto && (
                        <div className="
                          border-t
                          border-gray-200
                          bg-gray-50
                        ">
                          {complementos.length ===
                          0 ? (
                            <div className="
                              px-5
                              py-6
                              text-sm
                              text-gray-500
                            ">
                              Nenhuma opção
                              cadastrada neste
                              grupo.
                            </div>
                          ) : (
                            <div>
                              {complementos.map(
                                (
                                  complemento,
                                  indice
                                ) => (
                                  <div
                                    key={
                                      complemento.id_complemento
                                    }
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      gap-4
                                      border-b
                                      border-gray-200
                                      px-5
                                      py-3.5
                                      last:border-b-0
                                    "
                                  >
                                    <div className="min-w-0">
                                      <div className="
                                        flex
                                        items-center
                                        gap-2
                                      ">
                                        <span className="
                                          text-xs
                                          text-gray-400
                                        ">
                                          {indice +
                                            1}.
                                        </span>

                                        <p className="
                                          font-medium
                                          text-gray-800
                                        ">
                                          {
                                            complemento.nome
                                          }
                                        </p>
                                      </div>

                                      {complemento.descricao && (
                                        <p className="
                                          mt-1
                                          text-xs
                                          text-gray-500
                                        ">
                                          {
                                            complemento.descricao
                                          }
                                        </p>
                                      )}
                                    </div>

                                    <div className="
                                      shrink-0
                                      text-right
                                    ">
                                      <p className="
                                        text-sm
                                        font-medium
                                        text-gray-700
                                      ">
                                        {formatarPreco(
                                          complemento.preco_adicional
                                        )}
                                      </p>

                                      {!complemento.disponivel && (
                                        <p className="
                                          mt-0.5
                                          text-xs
                                          text-gray-400
                                        ">
                                          Indisponível
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}