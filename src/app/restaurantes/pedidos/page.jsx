"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const API_URL = "http://127.0.0.1:8000";

export default function PedidosRestaurante() {
  const [restauranteId, setRestauranteId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pedidoProcessando, setPedidoProcessando] = useState(null);
  const [erro, setErro] = useState("");

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
    carregarPedidos(id);
  }, []);

  useEffect(() => {
  if (!restauranteId) return;

  const intervalo = setInterval(() => {
    atualizarPedidosAutomaticamente(restauranteId);
  }, 3000);

  return () => {
    clearInterval(intervalo);
  };
}, [restauranteId]);

  async function carregarPedidos(idRestaurante) {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `${API_URL}/restaurantes/${idRestaurante}/pedidos`
      );

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail ||
            "Não foi possível carregar os pedidos."
        );
      }

      setPedidos(dados);
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível carregar os pedidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarPedidosAutomaticamente(idRestaurante) {
  try {
    const response = await fetch(
      `${API_URL}/restaurantes/${idRestaurante}/pedidos`
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível atualizar os pedidos."
      );
    }

    setPedidos(dados);
  } catch (error) {
    console.error(
      "Erro ao atualizar pedidos automaticamente:",
      error
    );
  }
}
  async function aceitarPedido(idPedido) {
  if (!restauranteId) {
    return;
  }

  try {
    setPedidoProcessando(idPedido);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/pedidos/${idPedido}/aceitar`,
      {
        method: "PATCH",
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof dados.detail === "string"
          ? dados.detail
          : "Não foi possível aceitar o pedido."
      );
    }

    setPedidos((pedidosAtuais) =>
      pedidosAtuais.map((pedido) =>
        pedido.id_pedido === idPedido
          ? dados
          : pedido
      )
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível aceitar o pedido."
    );
  } finally {
    setPedidoProcessando(null);
  }
}

async function recusarPedido(idPedido) {
  if (!restauranteId) {
    return;
  }

  try {
    setPedidoProcessando(idPedido);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/pedidos/${idPedido}/recusar`,
      {
        method: "PATCH",
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof dados.detail === "string"
          ? dados.detail
          : "Não foi possível recusar o pedido."
      );
    }

    setPedidos((pedidosAtuais) =>
      pedidosAtuais.map((pedido) =>
        pedido.id_pedido === idPedido
          ? dados
          : pedido
      )
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível recusar o pedido."
    );
  } finally {
    setPedidoProcessando(null);
  }
}

async function atualizarStatusPedido(idPedido, novoStatus) {
  if (!restauranteId) {
    return;
  }

  try {
    setPedidoProcessando(idPedido);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/pedidos/${idPedido}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: novoStatus,
        }),
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof dados.detail === "string"
          ? dados.detail
          : "Não foi possível atualizar o pedido."
      );
    }

    setPedidos((pedidosAtuais) =>
      pedidosAtuais.map((pedido) =>
        pedido.id_pedido === idPedido
          ? dados
          : pedido
      )
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível atualizar o pedido."
    );
  } finally {
    setPedidoProcessando(null);
  }
}

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) {
      return "";
    }

    return new Date(data).toLocaleString("pt-BR");
  }

  function obterStatus(status) {
    const statusMap = {
      AGUARDANDO_PAGAMENTO: {
        texto: "Aguardando pagamento",
        classe: "bg-yellow-50 text-yellow-700",
      },
      AGUARDANDO_ACEITE: {
        texto: "Aguardando aceite",
        classe: "bg-orange-50 text-orange-700",
      },
      ACEITO: {
        texto: "Aceito",
        classe: "bg-blue-50 text-blue-700",
      },
      EM_PREPARO: {
        texto: "Em preparo",
        classe: "bg-purple-50 text-purple-700",
      },
      PRONTO: {
        texto: "Pronto",
        classe: "bg-green-50 text-green-700",
      },
      SAIU_PARA_ENTREGA: {
        texto: "Saiu para entrega",
        classe: "bg-blue-50 text-blue-700",
      },
      ENTREGUE: {
        texto: "Entregue",
        classe: "bg-green-50 text-green-700",
      },
      RECUSADO: {
        texto: "Recusado",
        classe: "bg-red-50 text-red-700",
      },
      CANCELADO: {
        texto: "Cancelado",
        classe: "bg-gray-100 text-gray-600",
      },
    };

    return (
      statusMap[status] || {
        texto: status,
        classe: "bg-gray-100 text-gray-600",
      }
    );
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarRestaurante />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            Carregando pedidos...
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
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Pedidos
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Acompanhe e gerencie os pedidos do restaurante.
              </p>
            </div>

            {restauranteId && (
              <button
                type="button"
                onClick={() =>
                  carregarPedidos(restauranteId)
                }
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw size={17} />

                Atualizar
              </button>
            )}
          </div>

          {erro && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {!restauranteId && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <Store
                size={42}
                className="mx-auto mb-3 text-gray-300"
              />

              <h2 className="font-medium text-gray-900">
                Nenhum restaurante selecionado
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Selecione um restaurante para visualizar
                os pedidos.
              </p>
            </div>
          )}

          {restauranteId && pedidos.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <ShoppingBag
                size={44}
                className="mx-auto mb-4 text-gray-300"
              />

              <h2 className="text-lg font-medium text-gray-900">
                Nenhum pedido encontrado
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Os novos pedidos aparecerão aqui.
              </p>
            </div>
          )}

          {restauranteId && pedidos.length > 0 && (
            <div className="space-y-4">
              {pedidos.map((pedido) => {
                const statusPedido = obterStatus(
                  pedido.status
                );
                
                return (
                  <section
                    key={pedido.id_pedido}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-semibold text-gray-900">
                            Pedido #{pedido.id_pedido}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusPedido.classe}`}
                          >
                            {statusPedido.texto}
                          </span>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {pedido.tipo_entrega ===
                            "RETIRADA"
                              ? "Retirada"
                              : "Entrega"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={14} />

                          {formatarData(
                            pedido.created_at
                          )}
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="text-lg font-semibold text-gray-900">
                          {formatarPreco(
                            pedido.valor_total
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <div className="space-y-3">
                        {pedido.itens?.map((item) => (
                          <div
                            key={item.id_item_pedido}
                            className="flex gap-3"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <Package
                                size={17}
                                className="text-gray-400"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between gap-4">
                                <p className="text-sm font-medium text-gray-800">
                                  {item.quantidade}x{" "}
                                  {item.nome_produto}
                                </p>

                                <p className="shrink-0 text-sm text-gray-600">
                                  {formatarPreco(
                                    item.subtotal
                                  )}
                                </p>
                              </div>

                              {item.complementos?.map(
                                (complemento) => (
                                  <p
                                    key={
                                      complemento.id_item_pedido_complemento
                                    }
                                    className="mt-1 text-xs text-gray-400"
                                  >
                                    +{" "}
                                    {
                                      complemento.quantidade
                                    }
                                    x{" "}
                                    {
                                      complemento.nome_complemento
                                    }
                                  </p>
                                )
                              )}

                              {item.observacao && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Obs.:{" "}
                                  {item.observacao}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {pedido.tipo_entrega ===
                        "ENTREGA" &&
                        pedido.endereco_logradouro && (
                          <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                            <MapPin
                              size={18}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Entrega
                              </p>

                              <p className="mt-0.5 text-sm text-gray-500">
                                {
                                  pedido.endereco_logradouro
                                }
                                ,{" "}
                                {
                                  pedido.endereco_numero
                                }
                              </p>

                              <p className="text-sm text-gray-500">
                                {
                                  pedido.endereco_bairro
                                }
                                {" - "}
                                {
                                  pedido.endereco_cidade
                                }
                                /{pedido.endereco_uf}
                              </p>
                            </div>
                          </div>
                        )}

                      {pedido.observacao && (
                        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
                          <p className="text-xs font-medium text-gray-500">
                            Observação do pedido
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            {pedido.observacao}
                          </p>
                        </div>
                      )}
                      {pedido.status === "AGUARDANDO_ACEITE" && (
                        <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">

                          <button
                            type="button"
                            onClick={() =>
                              recusarPedido(pedido.id_pedido)
                            }
                            disabled={
                              pedidoProcessando === pedido.id_pedido
                            }
                            className="
                              rounded-lg
                              border
                              border-red-200
                              bg-white
                              px-5
                              py-2.5
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-50
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          >
                            {pedidoProcessando === pedido.id_pedido
                              ? "Processando..."
                              : "Recusar pedido"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              aceitarPedido(pedido.id_pedido)
                            }
                            disabled={
                              pedidoProcessando === pedido.id_pedido
                            }
                            className="
                              rounded-lg
                              bg-green-600
                              px-5
                              py-2.5
                              text-sm
                              font-medium
                              text-white
                              transition
                              hover:bg-green-700
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          >
                            {pedidoProcessando === pedido.id_pedido
                              ? "Processando..."
                              : "Aceitar pedido"}
                          </button>

                        </div>
                      )}
                
                    

                    {/* PEDIDO ACEITO */}
{pedido.status === "ACEITO" && (
  <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
    <button
      type="button"
      onClick={() =>
        atualizarStatusPedido(
          pedido.id_pedido,
          "EM_PREPARO"
        )
      }
      disabled={
        pedidoProcessando === pedido.id_pedido
      }
      className="
        rounded-lg
        bg-purple-600
        px-5
        py-2.5
        text-sm
        font-medium
        text-white
        transition
        hover:bg-purple-700
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {pedidoProcessando === pedido.id_pedido
        ? "Atualizando..."
        : "Iniciar preparo"}
    </button>
  </div>
)}

{/* EM PREPARO */}
{pedido.status === "EM_PREPARO" && (
  <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
    <button
      type="button"
      onClick={() =>
        atualizarStatusPedido(
          pedido.id_pedido,
          "PRONTO"
        )
      }
      disabled={
        pedidoProcessando === pedido.id_pedido
      }
      className="
        rounded-lg
        bg-green-600
        px-5
        py-2.5
        text-sm
        font-medium
        text-white
        transition
        hover:bg-green-700
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {pedidoProcessando === pedido.id_pedido
        ? "Atualizando..."
        : "Marcar como pronto"}
    </button>
  </div>
)}

{/* PRONTO - ENTREGA */}
{pedido.status === "PRONTO" &&
  pedido.tipo_entrega === "ENTREGA" && (
    <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={() =>
          atualizarStatusPedido(
            pedido.id_pedido,
            "SAIU_PARA_ENTREGA"
          )
        }
        disabled={
          pedidoProcessando === pedido.id_pedido
        }
        className="
          rounded-lg
          bg-blue-600
          px-5
          py-2.5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {pedidoProcessando === pedido.id_pedido
          ? "Atualizando..."
          : "Saiu para entrega"}
      </button>
    </div>
  )}

{/* PRONTO - RETIRADA */}
{pedido.status === "PRONTO" &&
  pedido.tipo_entrega === "RETIRADA" && (
    <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={() =>
          atualizarStatusPedido(
            pedido.id_pedido,
            "ENTREGUE"
          )
        }
        disabled={
          pedidoProcessando === pedido.id_pedido
        }
        className="
          rounded-lg
          bg-green-600
          px-5
          py-2.5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-green-700
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {pedidoProcessando === pedido.id_pedido
          ? "Atualizando..."
          : "Pedido retirado"}
      </button>
    </div>
  )}

{/* SAIU PARA ENTREGA */}
{pedido.status === "SAIU_PARA_ENTREGA" && (
  <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
    <button
      type="button"
      onClick={() =>
        atualizarStatusPedido(
          pedido.id_pedido,
          "ENTREGUE"
        )
      }
      disabled={
        pedidoProcessando === pedido.id_pedido
      }
      className="
        rounded-lg
        bg-green-600
        px-5
        py-2.5
        text-sm
        font-medium
        text-white
        transition
        hover:bg-green-700
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {pedidoProcessando === pedido.id_pedido
        ? "Atualizando..."
        : "Marcar como entregue"}
    </button>
  </div>
)}
                    </div>
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