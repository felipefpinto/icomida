"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Store,
  Truck,
  Utensils,
} from "lucide-react";

import Header from "../../components/Header";
import ModalProduto from "../../components/ModalProduto";

const API_URL = "http://127.0.0.1:8000";

export default function RestaurantePage() {
  const params = useParams();
  const router = useRouter();

  const idRestaurante = params.id;

  const [restaurante, setRestaurante] = useState(null);
  const [cardapio, setCardapio] = useState(null);
  const [secoes, setSecoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] =
  useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!idRestaurante) return;

    async function carregarPagina() {
      try {
        setCarregando(true);
        setErro("");

        /*
         * 1. RESTAURANTE
         */
        const respostaRestaurante = await fetch(
          `${API_URL}/restaurantes/${idRestaurante}`
        );

        if (!respostaRestaurante.ok) {
          throw new Error(
            "Não foi possível carregar o restaurante."
          );
        }

        const dadosRestaurante =
          await respostaRestaurante.json();

        setRestaurante(dadosRestaurante);

        /*
         * 2. CARDÁPIOS
         */
        const respostaCardapios = await fetch(
          `${API_URL}/restaurantes/${idRestaurante}/cardapios/`
        );

        if (!respostaCardapios.ok) {
          throw new Error(
            "Não foi possível carregar o cardápio."
          );
        }

        const cardapios =
          await respostaCardapios.json();

        if (cardapios.length === 0) {
          setCardapio(null);
          setSecoes([]);
          setProdutos([]);
          return;
        }

        /*
         * Procura primeiro um cardápio ativo.
         * Se o schema não possuir "ativo",
         * utiliza o primeiro cardápio.
         */
        const cardapioSelecionado =
          cardapios.find(
            (item) => item.ativo === true
          ) ?? cardapios[0];

        setCardapio(cardapioSelecionado);

        /*
         * 3. SEÇÕES + PRODUTOS
         *
         * Podemos buscar as duas coisas ao mesmo tempo.
         */
        const [
          respostaSecoes,
          respostaProdutos,
        ] = await Promise.all([
          fetch(
            `${API_URL}/restaurantes/${idRestaurante}/cardapios/${cardapioSelecionado.id_cardapio}/secoes/`
          ),

          fetch(
            `${API_URL}/restaurantes/${idRestaurante}/produtos/`
          ),
        ]);

        if (!respostaSecoes.ok) {
          throw new Error(
            "Não foi possível carregar as seções."
          );
        }

        if (!respostaProdutos.ok) {
          throw new Error(
            "Não foi possível carregar os produtos."
          );
        }

        const dadosSecoes =
          await respostaSecoes.json();

        const dadosProdutos =
          await respostaProdutos.json();

        /*
         * 4. BUSCAR OS PRODUTOS DE CADA SEÇÃO
         */
        const secoesComProdutos =
          await Promise.all(
            dadosSecoes.map(async (secao) => {
              const respostaVinculos =
                await fetch(
                  `${API_URL}/secoes/${secao.id_secao}/produtos/`
                );

              if (!respostaVinculos.ok) {
                return {
                  ...secao,
                  produtos: [],
                };
              }

              const vinculos =
                await respostaVinculos.json();

              /*
               * Cruza secao_produto com produto
               */
              const produtosDaSecao =
                vinculos
                  .map((vinculo) =>
                    dadosProdutos.find(
                      (produto) =>
                        produto.id_produto ===
                        vinculo.id_produto
                    )
                  )
                  .filter(Boolean);

              return {
                ...secao,
                produtos: produtosDaSecao,
              };
            })
          );

        setSecoes(secoesComProdutos);
        setProdutos(dadosProdutos);
      } catch (error) {
        console.error(error);

        setErro(
          error.message ||
            "Ocorreu um erro ao carregar o restaurante."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarPagina();
  }, [idRestaurante]);

  /*
   * CARREGANDO
   */
  if (carregando) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 rounded-3xl bg-gray-200" />

            <div className="mt-8 h-8 w-72 rounded bg-gray-200" />

            <div className="mt-4 h-4 w-96 rounded bg-gray-100" />
          </div>
        </main>
      </div>
    );
  }

  /*
   * ERRO
   */
  if (erro) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="rounded-2xl bg-red-50 p-6 text-red-600">
            {erro}
          </div>
        </main>
      </div>
    );
  }

  if (!restaurante) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        {/* VOLTAR */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* BANNER */}
        <div className="relative h-52 overflow-hidden rounded-3xl bg-gray-200 sm:h-64 lg:h-72">
          {restaurante.banner_url ? (
            <img
              src={`${API_URL}${restaurante.banner_url}`}
              alt={restaurante.nome_fantasia}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Store
                size={64}
                className="text-gray-300"
              />
            </div>
          )}
        </div>

        {/* INFORMAÇÕES */}
        <section className="relative mx-2 -mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:mx-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* LOGO */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {restaurante.logo_url ? (
                <img
                  src={`${API_URL}${restaurante.logo_url}`}
                  alt={`Logo ${restaurante.nome_fantasia}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store
                  size={36}
                  className="text-gray-400"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {restaurante.nome_fantasia}
              </h1>

              {restaurante.categorias?.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {restaurante.categorias
                    .map((categoria) =>
                      typeof categoria === "string"
                        ? categoria
                        : categoria.nome
                    )
                    .join(" • ")}
                </p>
              )}

              {restaurante.descricao && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                  {restaurante.descricao}
                </p>
              )}

              {/* INFORMAÇÕES RÁPIDAS */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">

                {restaurante.distancia_km != null && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />

                    {Number(
                      restaurante.distancia_km
                    ).toFixed(1)}{" "}
                    km
                  </span>
                )}

                {restaurante.taxa_entrega != null && (
                  <span className="flex items-center gap-1.5">
                    <Truck size={16} />

                    {Number(
                      restaurante.taxa_entrega
                    ) === 0
                      ? "Entrega grátis"
                      : `R$ ${Number(
                          restaurante.taxa_entrega
                        )
                          .toFixed(2)
                          .replace(".", ",")}`}
                  </span>
                )}

                {restaurante.status_funcionamento && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />

                    {restaurante.status_funcionamento}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CARDÁPIO */}
        <section className="mt-12">

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Utensils size={21} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Cardápio
              </h2>

              {cardapio?.nome && (
                <p className="text-sm text-gray-500">
                  {cardapio.nome}
                </p>
              )}
            </div>
          </div>

          {/* SEM CARDÁPIO */}
          {!cardapio && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <Utensils
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-4 font-medium text-gray-700">
                Este restaurante ainda não possui cardápio.
              </p>
            </div>
          )}

          {/* SEÇÕES */}
          {cardapio && secoes.length > 0 && (
            <div className="space-y-12">
              {secoes.map((secao) => (
                <div key={secao.id_secao}>

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                      {secao.nome}
                    </h3>

                    {secao.descricao && (
                      <p className="mt-1 text-sm text-gray-500">
                        {secao.descricao}
                      </p>
                    )}
                  </div>

                  {secao.produtos.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Nenhum produto disponível nesta seção.
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {secao.produtos.map(
                        (produto) => (
                          <ProdutoCard
                            key={produto.id_produto}
                            produto={produto}
                            onClick={() => {
                                console.log("Produto clicado:", produto);
                                setProdutoSelecionado(produto);
                            }}
                            />
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CARDÁPIO SEM SEÇÕES */}
          {cardapio && secoes.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
              Nenhuma seção cadastrada neste cardápio.
            </div>
          )}
        </section>
      </main>
          {produtoSelecionado && (
      <ModalProduto
        produto={produtoSelecionado}
        idRestaurante={idRestaurante}
        produtosRestaurante={produtos}
        onClose={() => setProdutoSelecionado(null)}
        onSelecionarProduto={(produto) =>
        setProdutoSelecionado(produto)
}
      />
    )}
    </div>
  );
}


/*
 * CARD DO PRODUTO
 */
function ProdutoCard({ produto, onClick }) {
  const preco = Number(produto.preco_base ?? 0);

  return (
    <article
      onClick={onClick}
      className="group flex min-h-40 cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <h4 className="font-semibold text-gray-900">
          {produto.nome}
        </h4>

        {produto.descricao && (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
            {produto.descricao}
          </p>
        )}

        <div className="mt-auto pt-4">
          <span className="font-semibold text-gray-900">
            R$ {preco.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      <div className="m-4 ml-0 h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {produto.imagem_url ? (
          <img
            src={`${API_URL}${produto.imagem_url}`}
            alt={produto.nome}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils
              size={28}
              className="text-gray-300"
            />
          </div>
        )}
      </div>
    </article>
  );
}