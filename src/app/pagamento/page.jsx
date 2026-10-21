"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  initMercadoPago,
  CardPayment,
} from "@mercadopago/sdk-react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Store,
} from "lucide-react";

import Header from "../components/Header";

const API_URL = "http://127.0.0.1:8000";

export default function PagamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idPedido = searchParams.get("pedido");

  const [pedido, setPedido] = useState(null);
  const [pagamentoPix, setPagamentoPix] = useState(null);
  const [gerandoPix, setGerandoPix] = useState(false);
  const [erroPagamento, setErroPagamento] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [carregando, setCarregando] = useState(true);
  const [verificandoPagamento, setVerificandoPagamento] =
  useState(false);
  const MERCADO_PAGO_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

  if (MERCADO_PAGO_PUBLIC_KEY) {
    initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, {
      locale: "pt-BR",
    });
  }
const [pagamentoAprovado, setPagamentoAprovado] =
  useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPedido() {
      try {
        setCarregando(true);
        setErro("");

        if (!idPedido) {
          setErro("Pedido não informado.");
          return;
        }

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
          `${API_URL}/usuarios/${usuario.id_usuario}/pedidos/${idPedido}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Não foi possível carregar o pedido."
          );
        }

        setPedido(data);

        if (
          data.status === "AGUARDANDO_ACEITE" ||
          data.status === "ACEITO" ||
          data.status === "EM_PREPARO" ||
          data.status === "PRONTO" ||
          data.status === "SAIU_PARA_ENTREGA" ||
          data.status === "ENTREGUE"
        ) {
          setPagamentoAprovado(true);
        }
        
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


async function gerarPix() {
  try {
    setGerandoPix(true);
    setErroPagamento("");

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
      `${API_URL}/usuarios/${usuario.id_usuario}/pedidos/${idPedido}/pagamentos/pix`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível gerar o pagamento Pix."
      );
    }

    setPagamentoPix(data);
  } catch (error) {
    setErroPagamento(
      error.message ||
        "Não foi possível gerar o pagamento Pix."
    );
  } finally {
    setGerandoPix(false);
  }
}
async function verificarPagamento() {
  console.log("🔄 VERIFICANDO PAGAMENTO AUTOMATICAMENTE");
  try {
    setVerificandoPagamento(true);
    setErroPagamento("");

    const usuarioSalvo =
      localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      router.push("/login");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/pedidos/${idPedido}/pagamentos/sincronizar`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    console.log("📦 RESPOSTA SINCRONIZAR:", data);
    
    if (!response.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível verificar o pagamento."
      );
    }

    if (data.status_pagamento === "APROVADO") {
      setPagamentoAprovado(true);

      setPedido((pedidoAtual) => ({
        ...pedidoAtual,
        status: data.status_pedido,
      }));
    }
  } catch (error) {
    setErroPagamento(
      error.message ||
        "Não foi possível verificar o pagamento."
    );
  } finally {
    setVerificandoPagamento(false);
  }
}

useEffect(() => {
  if (!pedido) return;
  if (!pagamentoPix) return;
  if (pagamentoAprovado) return;
  if (pedido.status !== "AGUARDANDO_PAGAMENTO") return;

  // Verifica imediatamente
  verificarPagamento();

  // Depois continua verificando a cada 3 segundos
  const intervalo = setInterval(() => {
    verificarPagamento();
  }, 3000);

  return () => {
    clearInterval(intervalo);
  };
}, [
  pagamentoPix,
  pagamentoAprovado,
  pedido?.status,
]);


  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
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

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Pagamento
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Confira seu pedido antes de pagar.
            </p>
          </div>

          {carregando && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Carregando pedido...
              </p>
            </div>
          )}

          {!carregando && erro && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm text-red-600">
                {erro}
              </p>
            </div>
          )}

          {!carregando && !erro && pedido && (
            <div className="space-y-5">
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      #{pedido.id_pedido}
                    </h2>
                  </div>

                  {pedido.status === "AGUARDANDO_PAGAMENTO" ? (
                    <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-700">
                      <Clock3 size={15} />
                      Aguardando pagamento
                    </div>
                  ) : pedido.status === "AGUARDANDO_ACEITE" ? (
                    <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={15} />
                      Pagamento aprovado
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                      <Clock3 size={15} />
                      {pedido.status}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                  {pedido.tipo_entrega === "ENTREGA" ? (
                    <>
                      <MapPin size={17} />
                      Entrega
                    </>
                  ) : (
                    <>
                      <Store size={17} />
                      Retirada
                    </>
                  )}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  Itens do pedido
                </h2>

                <div className="mt-4 divide-y divide-gray-100">
                  {pedido.itens?.map((item) => (
                    <div
                      key={item.id_item_pedido}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.quantidade}x{" "}
                            {item.nome_produto}
                          </p>

                          {item.complementos?.map(
                            (complemento) => (
                              <p
                                key={
                                  complemento.id_item_pedido_complemento
                                }
                                className="mt-1 text-xs text-gray-500"
                              >
                                + {complemento.quantidade}x{" "}
                                {complemento.nome_complemento}
                              </p>
                            )
                          )}
                        </div>

                        <span className="text-sm font-medium text-gray-700">
                          {formatarMoeda(
                            Number(item.preco_unitario) *
                              Number(item.quantidade)
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  Resumo
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      {formatarMoeda(pedido.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxa de entrega</span>
                    <span>
                      {pedido.tipo_entrega === "RETIRADA"
                        ? "Grátis"
                        : formatarMoeda(
                            pedido.taxa_entrega
                          )}
                    </span>
                  </div>

                  {Number(pedido.desconto || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>
                        - {formatarMoeda(pedido.desconto)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-gray-100 pt-4">
                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      {formatarMoeda(
                        pedido.valor_total
                      )}
                    </span>
                  </div>
                </div>
              </section>
              

              <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">
    Forma de pagamento
  </h2>

  <p className="mt-1 text-sm text-gray-500">
    Escolha como deseja pagar seu pedido.
  </p>

  <div className="mt-5 grid gap-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={() => setMetodoPagamento("PIX")}
      className={`rounded-xl border p-4 text-left transition ${
        metodoPagamento === "PIX"
          ? "border-red-500 bg-red-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <p className="font-semibold text-gray-900">
        Pix
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Pagamento instantâneo
      </p>
    </button>

    <button
      type="button"
      onClick={() => setMetodoPagamento("CARTAO")}
      className={`rounded-xl border p-4 text-left transition ${
        metodoPagamento === "CARTAO"
          ? "border-red-500 bg-red-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <p className="font-semibold text-gray-900">
        Cartão de crédito/Débito
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Pague com cartão
      </p>
    </button>
  </div>
</div>

{metodoPagamento === "PIX" && (
  <>
  <div className="flex items-start gap-3">
    <div className="rounded-xl bg-red-50 p-3 text-red-600">
      <CreditCard size={22} />
    </div>

    <div>
      <h2 className="font-semibold text-gray-900">
        Pagamento via Pix
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Pague usando o QR Code ou copie o código Pix.
      </p>
    </div>
  </div>

  {erroPagamento && (
    <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
      {erroPagamento}
    </div>
  )}

  {!pagamentoPix && (
    <button
      type="button"
      onClick={gerarPix}
      disabled={gerandoPix}
      className="mt-6 w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {gerandoPix
        ? "Gerando Pix..."
        : "Pagar com Pix"}
    </button>
  )}

{pagamentoPix && !pagamentoAprovado && (
  <div className="mt-6">
    <div className="rounded-2xl bg-gray-50 p-5 text-center">
      <p className="font-semibold text-gray-900">
        Escaneie o QR Code
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Abra o aplicativo do seu banco e escolha pagar com Pix.
      </p>

      {pagamentoPix.qr_code_base64 && (
        <img
          src={`data:image/png;base64,${pagamentoPix.qr_code_base64}`}
          alt="QR Code Pix"
          className="mx-auto mt-5 h-56 w-56 rounded-xl bg-white p-2"
        />
      )}
    </div>

    {pagamentoPix.qr_code && (
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Pix Copia e Cola
        </p>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="break-all text-xs leading-5 text-gray-600">
            {pagamentoPix.qr_code}
          </p>
        </div>
      </div>
    )}

    <div className="mt-5">
      <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
        <Clock3 size={17} />
        Aguardando pagamento
      </div>

      <button
        type="button"
        onClick={verificarPagamento}
        disabled={verificandoPagamento}
        className="mt-4 w-full rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {verificandoPagamento
          ? "Verificando pagamento..."
          : "Já paguei"}
      </button>
    </div>
  </div>
)}

{pagamentoAprovado && (
  <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
      <CheckCircle2 size={26} />
    </div>

    <h3 className="mt-4 text-lg font-bold text-green-800">
      Pagamento aprovado!
    </h3>

    <p className="mt-2 text-sm text-green-700">
      Seu pedido foi enviado para o restaurante.
    </p>

    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-gray-700">
      <Clock3 size={18} />
      Aguardando o restaurante aceitar seu pedido...
    </div>
  </div>
)}
  <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
    <CheckCircle2 size={17} />
    Pagamento processado com segurança
  </div>
    </>
)}
{metodoPagamento === "CARTAO" && pedido && (
  <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
    <h2 className="mb-5 text-lg font-semibold text-gray-900">
      Cartão de Crédito/Débito 
    </h2>

    <CardPayment
      initialization={{
        amount: Number(pedido.valor_total),
      }}
      onSubmit={async (formData) => {
  try {
    setErro("");

    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      throw new Error("Usuário não encontrado.");
    }

    const usuario = JSON.parse(usuarioSalvo);

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/pedidos/${pedido.id_pedido}/pagamentos/cartao`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: formData.token,
          payment_method_id: formData.payment_method_id,
          installments: Number(formData.installments),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("ERRO CARTÃO:", data);

      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Não foi possível processar o pagamento."
      );
    }

    console.log("PAGAMENTO CARTÃO:", data);

    if (data.status === "APROVADO") {
      router.push(`/pedidos/${pedido.id_pedido}`);
      return;
    }

    if (data.status === "RECUSADO") {
      setErro(
        "Pagamento recusado. Verifique os dados do cartão ou tente outra forma de pagamento."
      );
      return;
    }

    // Se o Mercado Pago ainda estiver processando,
    // mantemos o usuário na página.
    if (data.status === "PENDENTE") {
      setErro(
        "Seu pagamento está sendo processado. Aguarde a confirmação."
      );
    }
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível processar o pagamento com cartão."
    );
  }
}}
      onReady={() => {
        console.log("Card Payment Brick carregado.");
      }}
      onError={(error) => {
        console.error("Erro no Card Payment Brick:", error);
      }}
    />
  </div>
)}
</section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}