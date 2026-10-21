"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  Store,
  CheckCircle2,
  MapPin,
} from "lucide-react";

import Header from "../components/Header";
const API_URL = "http://127.0.0.1:8000";
export default function CheckoutPage() {
  const router = useRouter();

  const [tipoEntrega, setTipoEntrega] =
    useState("ENTREGA");
  const [enderecos, setEnderecos] = useState([]);
const [enderecoSelecionado, setEnderecoSelecionado] =
  useState(null);

const [carregandoEnderecos, setCarregandoEnderecos] =
  useState(true);
const [enderecosDisponiveis, setEnderecosDisponiveis] =
  useState([]);

const [verificandoEnderecos, setVerificandoEnderecos] =
  useState(false);
const [erro, setErro] = useState("");

const [carrinho, setCarrinho] = useState(null);

const [criandoPedido, setCriandoPedido] = useState(false);
const [erroPedido, setErroPedido] = useState("");

const [carregandoCarrinho, setCarregandoCarrinho] =
  useState(true);

async function criarPedido() {
  setErroPedido("");

  const usuarioSalvo = localStorage.getItem("usuarioLogado");

  if (!usuarioSalvo) {
    router.push("/login");
    return;
  }

  const usuario = JSON.parse(usuarioSalvo);

  if (!usuario?.id_usuario) {
    router.push("/login");
    return;
  }

  if (!carrinho?.itens?.length) {
    setErroPedido("Sua sacola está vazia.");
    return;
  }

  if (
    tipoEntrega === "ENTREGA" &&
    !enderecoSelecionado
  ) {
    setErroPedido(
      "Selecione um endereço para entrega."
    );
    return;
  }

  try {
    setCriandoPedido(true);

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/pedidos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_entrega: tipoEntrega,
          id_endereco:
            tipoEntrega === "ENTREGA"
              ? enderecoSelecionado
              : null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível criar o pedido."
      );
    }

    router.push(
      `/pagamento?pedido=${data.id_pedido}`
    );
  } catch (error) {
    setErroPedido(
      error.message ||
        "Não foi possível criar o pedido."
    );
  } finally {
    setCriandoPedido(false);
  }
}

useEffect(() => {
  async function carregarEnderecos() {
    try {
      setCarregandoEnderecos(true);
      setErro("");

      const usuarioSalvo =
        localStorage.getItem("usuarioLogado");

      if (!usuarioSalvo) {
        setErro("Você precisa estar logado.");
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      if (!usuario.id_usuario) {
        setErro(
          "Não foi possível identificar o usuário."
        );
        return;
      }
      try {
            setCarregandoCarrinho(true);

            const responseCarrinho = await fetch(
                `${API_URL}/usuarios/${usuario.id_usuario}/carrinho`
            );

            if (responseCarrinho.status === 404) {
                setCarrinho(null);
            } else {
                const dataCarrinho =
                await responseCarrinho.json();

                if (!responseCarrinho.ok) {
                throw new Error(
                    typeof dataCarrinho?.detail === "string"
                    ? dataCarrinho.detail
                    : "Não foi possível carregar a sacola."
                );
                }

                setCarrinho(dataCarrinho);
            }
            } finally {
            setCarregandoCarrinho(false);
            }

      const response = await fetch(
            `${API_URL}/usuario/${usuario.id_usuario}/enderecos`
            );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Não foi possível carregar seus endereços."
        );
      }

      setEnderecos(data);

      if (data.length > 0) {
        const enderecoPrincipal =
          data.find((endereco) => endereco.ativo) ||
          data[0];

        setEnderecoSelecionado(
          enderecoPrincipal.id_endereco
        );
      }
    } catch (error) {
      console.error(
        "Erro ao carregar endereços:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível carregar seus endereços."
      );
    } finally {
      setCarregandoEnderecos(false);
    }
  }

  carregarEnderecos();
}, []);

useEffect(() => {
  async function verificarEnderecosDisponiveis() {
    if (
      tipoEntrega !== "ENTREGA" ||
      !carrinho?.id_restaurante ||
      enderecos.length === 0
    ) {
      return;
    }

    try {
      setVerificandoEnderecos(true);
      setErro("");

      const verificacoes = await Promise.all(
        enderecos.map(async (endereco) => {
          try {
            const response = await fetch(
              `${API_URL}/restaurantes/${carrinho.id_restaurante}/calcular-entrega?endereco_id=${endereco.id_endereco}`
            );

            if (!response.ok) {
              return null;
            }

            const entrega = await response.json();

            if (
              !entrega.dentro_area_entrega ||
              entrega.taxa_entrega === null
            ) {
              return null;
            }

            return {
              ...endereco,
              distancia_km: entrega.distancia_km,
              taxa_entrega: entrega.taxa_entrega,
              valor_minimo_pedido:
                entrega.valor_minimo_pedido,
            };
          } catch (error) {
            console.error(
              `Erro ao verificar endereço ${endereco.id_endereco}:`,
              error
            );

            return null;
          }
        })
      );

      const disponiveis =
        verificacoes.filter(Boolean);

      setEnderecosDisponiveis(disponiveis);

      if (disponiveis.length > 0) {
        const principal =
          disponiveis.find(
            (endereco) => endereco.ativo
          ) || disponiveis[0];

        setEnderecoSelecionado(
          principal.id_endereco
        );
      } else {
        setEnderecoSelecionado(null);
      }
    } finally {
      setVerificandoEnderecos(false);
    }
  }

  verificarEnderecosDisponiveis();
}, [tipoEntrega, carrinho, enderecos]);
const subtotal =
  carrinho?.itens?.reduce((totalCarrinho, item) => {
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
  }, 0) ?? 0;
const enderecoEntregaSelecionado =
  enderecosDisponiveis.find(
    (endereco) =>
      endereco.id_endereco === enderecoSelecionado
  );

const taxaEntrega =
  tipoEntrega === "ENTREGA"
    ? Number(
        enderecoEntregaSelecionado?.taxa_entrega || 0
      )
    : 0;

const total = subtotal + taxaEntrega;
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Finalizar pedido
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Escolha como você deseja receber seu pedido.
            </p>
          </div>

          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Como você quer receber?
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setTipoEntrega("ENTREGA")
                }
                className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  tipoEntrega === "ENTREGA"
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    tipoEntrega === "ENTREGA"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Bike size={21} />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Entrega
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Receba no seu endereço
                  </p>
                </div>

                {tipoEntrega === "ENTREGA" && (
                  <CheckCircle2
                    size={20}
                    className="text-red-600"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setTipoEntrega("RETIRADA")
                }
                className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  tipoEntrega === "RETIRADA"
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    tipoEntrega === "RETIRADA"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Store size={21} />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Retirada
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Retire no restaurante
                  </p>
                </div>

                {tipoEntrega === "RETIRADA" && (
                  <CheckCircle2
                    size={20}
                    className="text-red-600"
                  />
                )}
              </button>
            </div>
          </section>
          {tipoEntrega === "ENTREGA" && (
  <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2">
      <MapPin
        size={20}
        className="text-red-600"
      />

      <h2 className="font-bold text-gray-900">
        Endereço de entrega
      </h2>
    </div>

    {carregandoEnderecos && (
      <p className="mt-4 text-sm text-gray-500">
         Verificando endereços disponíveis...
      </p>
    )}

    {!carregandoEnderecos && erro && (
      <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
        {erro}
      </div>
    )}

    {!carregandoEnderecos &&
      !erro &&
      enderecosDisponiveis.length === 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Este restaurante não entrega em nenhum dos
            seus endereços cadastrados.
            </p>

            <button
            type="button"
            onClick={() =>
                router.push("/perfil/enderecos")
            }
            className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
            >
            Cadastrar outro endereço
            </button>
        </div>
      )}

    {!carregandoEnderecos &&
      !erro &&
      enderecos.length > 0 && (
        <div className="mt-4 space-y-3">
          {enderecosDisponiveis.map((endereco) => {
            const selecionado =
              enderecoSelecionado ===
              endereco.id_endereco;

            return (
              <button
                key={endereco.id_endereco}
                type="button"
                onClick={() =>
                  setEnderecoSelecionado(
                    endereco.id_endereco
                  )
                }
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  selecionado
                    ? "border-red-600 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {endereco.apelido ||
                      "Endereço"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {endereco.logradouro},{" "}
                    {endereco.numero}
                  </p>

                  <p className="text-sm text-gray-500">
                    {endereco.bairro} •{" "}
                    {endereco.cidade} -{" "}
                    {endereco.uf}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>
                    {Number(endereco.distancia_km).toFixed(1)} km
                </span>

                <span>•</span>

                <span>
                    Entrega R${" "}
                    {Number(endereco.taxa_entrega).toFixed(2)}
                </span>
                </div>

                {selecionado && (
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-red-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
  </section>
)}
        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
  <h2 className="font-bold text-gray-900">
    Resumo do pedido
  </h2>

  {carregandoCarrinho && (
    <p className="mt-4 text-sm text-gray-500">
      Carregando pedido...
    </p>
  )}

  {!carregandoCarrinho && !carrinho && (
    <div className="mt-4">
      <p className="text-sm text-gray-500">
        Sua sacola está vazia.
      </p>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
      >
        Escolher restaurante
      </button>
    </div>
  )}

  {!carregandoCarrinho && carrinho && (
    <>
      <div className="mt-4 border-b border-gray-100 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Restaurante
        </p>

        <p className="mt-1 font-semibold text-gray-900">
          {carrinho.nome_restaurante}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {carrinho.itens?.map((item) => {
          const precoComplementos =
            item.complementos?.reduce(
              (total, complemento) =>
                total +
                Number(
                  complemento.preco_unitario ?? 0
                ) *
                  Number(
                    complemento.quantidade ?? 1
                  ),
              0
            ) ?? 0;

          const valorUnitario =
            Number(item.preco_unitario ?? 0) +
            precoComplementos;

          const totalItem =
            valorUnitario *
            Number(item.quantidade ?? 1);

          return (
            <div
              key={item.id_item}
              className="py-4"
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
                          complemento.id_item_complemento
                        }
                        className="mt-1 text-sm text-gray-500"
                      >
                        +{" "}
                        {
                          complemento.nome_complemento
                        }
                      </p>
                    )
                  )}
                </div>

                <p className="shrink-0 text-sm font-medium text-gray-700">
                  R${" "}
                  {totalItem
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
  <div className="flex items-center justify-between text-sm text-gray-600">
    <span>Subtotal</span>

    <span>
      R$ {subtotal.toFixed(2)}
    </span>
  </div>

  <div className="flex items-center justify-between text-sm text-gray-600">
    <span>
      {tipoEntrega === "ENTREGA"
        ? "Taxa de entrega"
        : "Retirada"}
    </span>

    <span>
      {tipoEntrega === "ENTREGA"
        ? `R$ ${taxaEntrega.toFixed(2)}`
        : "Grátis"}
    </span>
  </div>

  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
    <span className="font-semibold text-gray-900">
      Total
    </span>

    <span className="text-lg font-bold text-gray-900">
      R$ {total.toFixed(2)}
    </span>
  </div>
</div>
    </>
  )}
</section>
{erroPedido && (
  <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
    {erroPedido}
  </div>
)}
          <div className="mt-6 flex justify-end">
            <button
                type="button"
                onClick={criarPedido}
                disabled={
                    criandoPedido ||
                    !carrinho?.itens?.length ||
                    (tipoEntrega === "ENTREGA" &&
                    !enderecoSelecionado)
                }
                className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                {criandoPedido
                    ? "Criando pedido..."
                    : "Continuar para pagamento"}
                </button>
          </div>
        </div>
      </main>
    </>
  );
}