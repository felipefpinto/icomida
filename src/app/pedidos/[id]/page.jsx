"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  Store,
  Truck,
} from "lucide-react";

import Header from "../../components/Header";

const API_URL = "http://127.0.0.1:8000";

export default function AcompanharPedidoPage() {
  const router = useRouter();
  const params = useParams();

  const idPedido = params.id;

  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPedido() {
      try {
        setCarregando(true);
        setErro("");

        const usuarioSalvo =
          localStorage.getItem("usuarioLogado");

        if (!usuarioSalvo) {
          router.push("/login");
          return;
        }

        const usuario = JSON.parse(usuarioSalvo);

        const response = await fetch(
          `${API_URL}/usuarios/${usuario.id_usuario}/pedidos/${idPedido}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Não foi possível carregar o pedido."
          );
        }

        setPedido(data);
      } catch (error) {
        setErro(
          error.message ||
            "Não foi possível carregar o pedido."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarPedido();
  }, [idPedido, router]);

  useEffect(() => {
  if (!idPedido) return;

  async function atualizarPedido() {
    try {
      const usuarioSalvo =
        localStorage.getItem("usuarioLogado");

      if (!usuarioSalvo) return;

      const usuario = JSON.parse(usuarioSalvo);

      const response = await fetch(
        `${API_URL}/usuarios/${usuario.id_usuario}/pedidos/${idPedido}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setPedido(data);
    } catch (error) {
      console.error(
        "Erro ao atualizar acompanhamento do pedido:",
        error
      );
    }
  }

  const intervalo = setInterval(() => {
    atualizarPedido();
  }, 3000);

  return () => {
    clearInterval(intervalo);
  };
}, [idPedido]);

function obterStatusPedido(status) {
  const statusMap = {
    AGUARDANDO_PAGAMENTO: {
      titulo: "Aguardando pagamento",
      descricao: "Estamos aguardando a confirmação do pagamento.",
    },

    AGUARDANDO_ACEITE: {
      titulo: "Aguardando o restaurante",
      descricao: "Pagamento aprovado! Seu pedido foi enviado ao restaurante.",
    },

    ACEITO: {
      titulo: "Pedido aceito",
      descricao: "O restaurante aceitou seu pedido.",
    },

    EM_PREPARO: {
      titulo: "Preparando seu pedido",
      descricao: "O restaurante está preparando seu pedido.",
    },

    PRONTO: {
      titulo:
        pedido?.tipo_entrega === "RETIRADA"
          ? "Pronto para retirada"
          : "Pedido pronto",
      descricao:
        pedido?.tipo_entrega === "RETIRADA"
          ? "Seu pedido está pronto para ser retirado."
          : "Seu pedido está pronto e aguarda a saída para entrega.",
    },

    SAIU_PARA_ENTREGA: {
      titulo: "Saiu para entrega",
      descricao: "Seu pedido está a caminho.",
    },

    ENTREGUE: {
      titulo: "Pedido entregue",
      descricao:
        pedido?.tipo_entrega === "RETIRADA"
          ? "Seu pedido foi retirado. Bom apetite!"
          : "Seu pedido foi entregue. Bom apetite!",
    },

    RECUSADO: {
      titulo: "Pedido recusado",
      descricao: "O restaurante não pôde aceitar seu pedido.",
    },

    CANCELADO: {
      titulo: "Pedido cancelado",
      descricao: "Este pedido foi cancelado.",
    },
  };

  return (
    statusMap[status] || {
      titulo: status,
      descricao: "Acompanhe o andamento do seu pedido.",
    }
  );
}

function obterEtapasPedido() {
  if (!pedido) return [];

  if (pedido.tipo_entrega === "RETIRADA") {
    return [
      {
        status: "AGUARDANDO_ACEITE",
        titulo: "Pedido enviado",
        icone: Store,
      },
      {
        status: "ACEITO",
        titulo: "Pedido aceito",
        icone: CheckCircle2,
      },
      {
        status: "EM_PREPARO",
        titulo: "Em preparo",
        icone: Package,
      },
      {
        status: "PRONTO",
        titulo: "Pronto para retirada",
        icone: Store,
      },
      {
        status: "ENTREGUE",
        titulo: "Retirado",
        icone: CheckCircle2,
      },
    ];
  }

  return [
    {
      status: "AGUARDANDO_ACEITE",
      titulo: "Pedido enviado",
      icone: Store,
    },
    {
      status: "ACEITO",
      titulo: "Pedido aceito",
      icone: CheckCircle2,
    },
    {
      status: "EM_PREPARO",
      titulo: "Em preparo",
      icone: Package,
    },
    {
      status: "PRONTO",
      titulo: "Pedido pronto",
      icone: Package,
    },
    {
      status: "SAIU_PARA_ENTREGA",
      titulo: "Saiu para entrega",
      icone: Truck,
    },
    {
      status: "ENTREGUE",
      titulo: "Entregue",
      icone: CheckCircle2,
    },
  ];
}

function obterIndiceEtapaAtual() {
  if (!pedido) return -1;

  const etapas = obterEtapasPedido();

  return etapas.findIndex(
    (etapa) => etapa.status === pedido.status
  );
}

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Acompanhar pedido
          </h1>

          {carregando && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Carregando pedido...
              </p>
            </div>
          )}

          {!carregando && erro && (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm text-red-600">
                {erro}
              </p>
            </div>
          )}

          {!carregando && !erro && pedido && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Pedido #{pedido.id_pedido}
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-900">
                {obterStatusPedido(pedido.status).titulo}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                {obterStatusPedido(pedido.status).descricao}
                </p>
            </div>

            
            
            
          )}
        </div>
        

        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="font-semibold text-gray-900">
    Acompanhe seu pedido
  </h2>

  <div className="mt-8 overflow-x-auto pb-2">
    <div className="flex min-w-max items-start">
      {obterEtapasPedido().map((etapa, index) => {
        const Icone = etapa.icone;
        const indiceAtual = obterIndiceEtapaAtual();

        const concluida = index < indiceAtual;
        const atual = index === indiceAtual;
        const ativa = concluida || atual;

        const ultimaEtapa =
          index === obterEtapasPedido().length - 1;

        return (
          <div
            key={etapa.status}
            className="flex items-start"
          >
            <div className="w-28 shrink-0 text-center sm:w-32">
              <div
                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                  ativa
                    ? "border-green-500 bg-green-100 text-green-600"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                <Icone size={20} />
              </div>

              <p
                className={`mt-3 text-xs font-medium sm:text-sm ${
                  ativa
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {etapa.titulo}
              </p>

              {atual && (
                <p className="mt-1 text-xs font-medium text-green-600">
                  Etapa atual
                </p>
              )}

              {concluida && (
                <p className="mt-1 text-xs text-gray-400">
                  Concluído
                </p>
              )}
            </div>

            {!ultimaEtapa && (
              <div
                className={`mt-[21px] h-0.5 w-10 shrink-0 sm:w-14 ${
                  concluida
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
  
</div>
{/* Resumo do pedido */}
{!carregando && !erro && pedido && (
  <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="font-semibold text-gray-900">
    Resumo do pedido
  </h2>

  {/* Itens */}
  <div className="mt-5 divide-y divide-gray-100">
    {pedido.itens?.map((item) => (
      <div
        key={item.id_item_pedido}
        className="py-4 first:pt-0"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
              {item.quantidade}
            </div>

            <div>
              <p className="font-medium text-gray-900">
                {item.nome_produto}
              </p>

              {/* Complementos */}
              {item.complementos?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {item.complementos.map((complemento) => (
                    <p
                      key={
                        complemento.id_item_pedido_complemento
                      }
                      className="text-sm text-gray-500"
                    >
                      + {complemento.quantidade}x{" "}
                      {complemento.nome_complemento}
                    </p>
                  ))}
                </div>
              )}

              {/* Observação do item */}
              {item.observacao && (
                <p className="mt-2 text-sm text-gray-500">
                  Observação: {item.observacao}
                </p>
              )}
            </div>
          </div>

          <p className="shrink-0 text-sm font-medium text-gray-900">
            {Number(item.subtotal).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            )}
          </p>
        </div>
      </div>
    ))}
  </div>

  {/* Valores */}
  <div className="mt-2 border-t border-gray-100 pt-5">
    <div className="flex justify-between text-sm text-gray-500">
      <span>Subtotal</span>

      <span>
        {Number(pedido.subtotal).toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          }
        )}
      </span>
    </div>

    {pedido.tipo_entrega === "ENTREGA" && (
      <div className="mt-3 flex justify-between text-sm text-gray-500">
        <span>Taxa de entrega</span>

        <span>
          {Number(pedido.taxa_entrega).toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            }
          )}
        </span>
      </div>
    )}

    {Number(pedido.desconto) > 0 && (
      <div className="mt-3 flex justify-between text-sm text-green-600">
        <span>Desconto</span>

        <span>
          -{" "}
          {Number(pedido.desconto).toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            }
          )}
        </span>
      </div>
    )}

    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
      <span className="font-semibold text-gray-900">
        Total
      </span>

      <span className="text-lg font-bold text-gray-900">
        {Number(pedido.valor_total).toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          }
        )}
      </span>
    </div>
  </div>
</div>
)}
      </main>
    </>
  );
}