"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";

import Header from "../components/Header";

const API_URL = "http://127.0.0.1:8000";

export default function PedidosPage() {
  const router = useRouter();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPedidos() {
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

        if (!usuario?.id_usuario) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/usuarios/${usuario.id_usuario}/pedidos`
        );

        const data = await response.json();
        
        console.log("PEDIDOS RECEBIDOS:", data);

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Não foi possível carregar seus pedidos."
          );
        }

        setPedidos(data);
      } catch (error) {
        setErro(
          error.message ||
            "Não foi possível carregar seus pedidos."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarPedidos();
  }, [router]);

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function obterStatus(status) {
    const statusMap = {
      AGUARDANDO_PAGAMENTO: {
        texto: "Aguardando pagamento",
        classe: "bg-yellow-50 text-yellow-700",
      },

      AGUARDANDO_ACEITE: {
        texto: "Aguardando restaurante",
        classe: "bg-orange-50 text-orange-700",
      },

      ACEITO: {
        texto: "Pedido aceito",
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

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Meus pedidos
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Acompanhe seus pedidos atuais e consulte seu histórico.
            </p>
          </div>

          {carregando && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Carregando seus pedidos...
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

          {!carregando &&
            !erro &&
            pedidos.length === 0 && (
              <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
                <ShoppingBag
                  size={44}
                  className="mx-auto text-gray-300"
                />

                <h2 className="mt-4 font-semibold text-gray-900">
                  Você ainda não fez nenhum pedido
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Seus pedidos aparecerão aqui.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Explorar restaurantes
                </button>
              </div>
            )}

          {!carregando &&
            !erro &&
            pedidos.length > 0 && (
              <div className="mt-6 space-y-4">
                {pedidos.map((pedido) => {
                  const status = obterStatus(
                    pedido.status
                  );

                  return (
  <button
    key={pedido.id_pedido}
    type="button"
    onClick={() =>
      router.push(`/pedidos/${pedido.id_pedido}`)
    }
    className="w-full rounded-2xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
  >
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

      {/* LADO ESQUERDO */}
      <div className="flex min-w-0 items-start gap-4">

        {/* Logo */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            {pedido.logo_restaurante ? (
            <img
                src={`${API_URL}${pedido.logo_restaurante}`}
                alt={pedido.nome_restaurante || "Restaurante"}
                className="h-full w-full object-cover"
            />
            ) : (
            <Store
              size={24}
              className="text-gray-400"
            />
          )}
        </div>

        {/* Informações */}
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">
            {pedido.nome_restaurante || "Restaurante"}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">
              Pedido #{pedido.id_pedido}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.classe}`}
            >
              {status.texto}
            </span>
          </div>

          {/* Data */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <Clock3 size={16} />

            {formatarData(pedido.created_at)}
          </div>

          {/* Entrega ou retirada */}
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            {pedido.tipo_entrega === "ENTREGA" ? (
              <>
                <MapPin size={16} />
                Entrega
              </>
            ) : (
              <>
                <Store size={16} />
                Retirada
              </>
            )}
          </div>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <div className="sm:text-right">
          <p className="text-xs text-gray-400">
            Total
          </p>

          <p className="mt-1 font-bold text-gray-900">
            {formatarMoeda(pedido.valor_total)}
          </p>
        </div>

        <ArrowRight
          size={20}
          className="shrink-0 text-gray-400"
        />
      </div>
    </div>
  </button>
);
                })}
              </div>
            )}
        </div>
      </main>
    </>
  );
}