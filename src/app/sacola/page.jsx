"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";

import Header from "../components/Header";

const API_URL = "http://127.0.0.1:8000";

export default function SacolaPage() {
  const router = useRouter();

  const [carrinho, setCarrinho] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const [removendoItem, setRemovendoItem] = useState(false);
  const [confirmarEsvaziar, setConfirmarEsvaziar] = useState(false);
  const [esvaziando, setEsvaziando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarCarrinho() {
      try {
        setCarregando(true);
        setErro("");

        const usuarioSalvo =
          localStorage.getItem("usuarioLogado");

        if (!usuarioSalvo) {
          setErro(
            "Você precisa estar logado para visualizar sua sacola."
          );
          return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        if (!usuario.id_usuario) {
          setErro(
            "Não foi possível identificar o usuário logado."
          );
          return;
        }

        const response = await fetch(
          `${API_URL}/usuarios/${usuario.id_usuario}/carrinho`
        );

        if (response.status === 404) {
          setCarrinho(null);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setErro(
            typeof data?.detail === "string"
              ? data.detail
              : "Não foi possível carregar sua sacola."
          );
          return;
        }

        setCarrinho(data);
      } catch (error) {
        console.error(
          "Erro ao carregar carrinho:",
          error
        );

        setErro(
          "Não foi possível carregar sua sacola."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarCarrinho();
  }, []);

  const subtotal = useMemo(() => {
    if (!carrinho?.itens) {
      return 0;
    }

    return carrinho.itens.reduce(
      (totalCarrinho, item) => {
        const precoProduto =
          Number(item.preco_unitario ?? 0);

        const precoComplementos =
          item.complementos?.reduce(
            (totalComplementos, complemento) =>
              totalComplementos +
              Number(
                complemento.preco_unitario ?? 0
              ) *
                Number(
                  complemento.quantidade ?? 1
                ),
            0
          ) ?? 0;

        const valorUnitario =
          precoProduto + precoComplementos;

        return (
          totalCarrinho +
          valorUnitario *
            Number(item.quantidade ?? 1)
        );
      },
      0
    );
  }, [carrinho]);

  async function esvaziarSacola() {
  try {
    setEsvaziando(true);
    setErro("");

    const usuarioSalvo =
      localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      setErro("Você precisa estar logado.");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/carrinho`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      let data = null;

      try {
        data = await response.json();
      } catch {}

      setErro(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível esvaziar a sacola."
      );

      return;
    }

    setCarrinho(null);
    window.dispatchEvent(
        new CustomEvent("carrinhoAlterado")
        );
    setConfirmarEsvaziar(false);
  } catch (error) {
    console.error("Erro ao esvaziar sacola:", error);

    setErro("Não foi possível esvaziar a sacola.");
  } finally {
    setEsvaziando(false);
  }
}

  async function alterarQuantidade(item, novaQuantidade) {
  if (novaQuantidade < 1) {
    return;
  }

  try {
    setErro("");

    const usuarioSalvo =
      localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      setErro("Você precisa estar logado.");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/carrinho/itens/${item.id_item}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantidade: novaQuantidade,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setErro(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível alterar a quantidade."
      );
      return;
    }

    setCarrinho(data);
    window.dispatchEvent(
    new CustomEvent("carrinhoAlterado")
);
  } catch (error) {
    console.error(
      "Erro ao alterar quantidade:",
      error
    );

    setErro(
      "Não foi possível alterar a quantidade."
    );
  }
}

function removerItem(item) {
  setItemParaRemover(item);
}

async function confirmarRemocao() {
  if (!itemParaRemover) {
    return;
  }

  try {
    setRemovendoItem(true);
    setErro("");

    const usuarioSalvo =
      localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      setErro("Você precisa estar logado.");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/carrinho/itens/${itemParaRemover.id_item}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setErro(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível remover o item."
      );
      return;
    }

    if (data.id_carrinho) {
      setCarrinho(data);
    } else {
      setCarrinho(null);
    }

    window.dispatchEvent(
        new CustomEvent("carrinhoAlterado")
        );

    setItemParaRemover(null);
  } catch (error) {
    console.error("Erro ao remover item:", error);

    setErro("Não foi possível remover o item.");
  } finally {
    setRemovendoItem(false);
  }
}

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

          {/* VOLTAR */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Sua sacola
          </h1>

          {/* CARREGANDO */}
          {carregando && (
            <div className="mt-6 space-y-4">
              <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
              <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
              {erro}
            </div>
          )}

          {/* SACOLA VAZIA */}
          {!carregando &&
            !erro &&
            !carrinho && (
              <div className="mt-8 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <ShoppingBag
                    size={28}
                    className="text-red-600"
                  />
                </div>

                <h2 className="mt-5 text-xl font-bold text-gray-900">
                  Sua sacola está vazia
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Adicione itens de um restaurante
                  para começar seu pedido.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  Ver restaurantes
                </button>
              </div>
            )}

          {/* CARRINHO */}
          {!carregando &&
            !erro &&
            carrinho && (
              <div className="mt-6 space-y-4">

                {/* RESTAURANTE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                      {carrinho.logo_restaurante ? (
                        <img
                          src={`${API_URL}${carrinho.logo_restaurante}`}
                          alt={
                            carrinho.nome_restaurante
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Utensils
                          size={24}
                          className="text-gray-300"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Seu pedido em
                      </p>

                      <h2 className="mt-1 font-bold text-gray-900">
                        {carrinho.nome_restaurante}
                      </h2>
                    </div>
                  </div>
                </section>

                {/* ITENS */}
                <section className="divide-y divide-gray-100 rounded-2xl bg-white px-5 shadow-sm">
                  {carrinho.itens.map((item) => {
                    const precoComplementos =
                      item.complementos?.reduce(
                        (
                          totalComplementos,
                          complemento
                        ) =>
                          totalComplementos +
                          Number(
                            complemento.preco_unitario ??
                              0
                          ) *
                            Number(
                              complemento.quantidade ??
                                1
                            ),
                        0
                      ) ?? 0;

                    const valorUnitario =
                      Number(
                        item.preco_unitario ?? 0
                      ) + precoComplementos;

                    const totalItem =
                      valorUnitario *
                      Number(item.quantidade ?? 1);

                    return (
                      <article
                        key={item.id_item}
                        className="py-5"
                      >
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {item.quantidade}x{" "}
                                  {item.nome_produto}
                                </h3>

                                <p className="mt-1 text-sm font-medium text-gray-700">
                                  R${" "}
                                  {totalItem
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </p>
                              </div>

                              {item.imagem_url && (
                                <img
                                  src={`${API_URL}${item.imagem_url}`}
                                  alt={item.nome_produto}
                                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                                />
                              )}
                            </div>

                            {/* COMPLEMENTOS */}
                            {item.complementos?.length >
                              0 && (
                              <div className="mt-3 space-y-1">
                                {item.complementos.map(
                                  (complemento) => (
                                    <p
                                      key={
                                        complemento.id_item_complemento
                                      }
                                      className="text-sm text-gray-500"
                                    >
                                      +{" "}
                                      {
                                        complemento.nome_complemento
                                      }

                                      {Number(
                                        complemento.preco_unitario
                                      ) > 0 && (
                                        <>
                                          {" "}
                                          • R${" "}
                                          {Number(
                                            complemento.preco_unitario
                                          )
                                            .toFixed(2)
                                            .replace(
                                              ".",
                                              ","
                                            )}
                                        </>
                                      )}
                                    </p>
                                  )
                                )}
                              </div>
                            )}

                            {/* OBSERVAÇÃO */}
                            {item.observacao && (
                              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                                <span className="font-medium text-gray-600">
                                  Observação:
                                </span>{" "}
                                {item.observacao}
                              </div>
                            )}
                          </div>
                        </div>
                                                {/* QUANTIDADE */}
                        {/* AÇÕES DO ITEM */}
<div className="mt-4 flex items-center justify-between">
  <button
    type="button"
    onClick={() => removerItem(item)}
    className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700"
  >
    <Trash2 size={16} />
    Remover
  </button>

  <div className="flex items-center rounded-xl border border-gray-200">
    <button
      type="button"
      onClick={() =>
        alterarQuantidade(
          item,
          item.quantidade - 1
        )
      }
      disabled={item.quantidade <= 1}
      className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
      aria-label="Diminuir quantidade"
    >
      <Minus size={16} />
    </button>

    <span className="w-9 text-center text-sm font-semibold text-gray-900">
      {item.quantidade}
    </span>

    <button
      type="button"
      onClick={() =>
        alterarQuantidade(
          item,
          item.quantidade + 1
        )
      }
      className="flex h-9 w-9 items-center justify-center text-red-600 transition hover:bg-red-50"
      aria-label="Aumentar quantidade"
    >
      <Plus size={16} />
    </button>
  </div>
</div>
                      </article>
                    );
                  })}
                </section>

                {/* RESUMO */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      Subtotal
                    </span>

                    <span className="text-lg font-bold text-gray-900">
                      R${" "}
                      {subtotal
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    </div>
                    <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => router.push("/checkout")}
                      className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                    >
                      Continuar
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmarEsvaziar(true)}
                      className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Esvaziar sacola
                    </button>
                  </div>
                </section>
              </div>
            )}
        </div>
      </main>
      {itemParaRemover && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold text-gray-900">
        Remover item?
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Deseja remover{" "}
        <span className="font-semibold text-gray-700">
          {itemParaRemover.nome_produto}
        </span>{" "}
        da sua sacola?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={removendoItem}
          onClick={() =>
            setItemParaRemover(null)
          }
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={removendoItem}
          onClick={confirmarRemocao}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removendoItem
            ? "Removendo..."
            : "Remover"}
        </button>
      </div>
    </div>
  </div>
)}
{confirmarEsvaziar && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold text-gray-900">
        Esvaziar sacola?
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Todos os itens da sua sacola serão removidos.
        Essa ação não poderá ser desfeita.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={esvaziando}
          onClick={() => setConfirmarEsvaziar(false)}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={esvaziando}
          onClick={esvaziarSacola}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {esvaziando
            ? "Esvaziando..."
            : "Esvaziar sacola"}
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}