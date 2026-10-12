"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Package,
  Plus,
  Store,
  Pencil,
  Settings2,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const API_URL = "http://127.0.0.1:8000";

export default function CardapioRestaurante() {
  const [restauranteId, setRestauranteId] =
    useState(null);

  const [cardapios, setCardapios] =
    useState([]);

  const [modalCardapioAberto, setModalCardapioAberto] =
  useState(false);

  const [nomeCardapio, setNomeCardapio] =
    useState("");

  const [descricaoCardapio, setDescricaoCardapio] =
    useState("");

  const [salvandoCardapio, setSalvandoCardapio] =
    useState(false);

  const [produtos, setProdutos] =
    useState([]);

  const [secoesPorCardapio, setSecoesPorCardapio] =
    useState({});

  const [produtosPorSecao, setProdutosPorSecao] =
    useState({});

  const [modalSecaoAberto, setModalSecaoAberto] =
    useState(false);

  const [cardapioSelecionado, setCardapioSelecionado] =
    useState(null);

  const [nomeSecao, setNomeSecao] =
    useState("");

    const [secoesAbertas, setSecoesAbertas] =
  useState({});

  const [descricaoSecao, setDescricaoSecao] =
    useState("");

  const [ordemSecao, setOrdemSecao] =
    useState("");

  const [salvandoSecao, setSalvandoSecao] =
     useState(false);

  const router = useRouter();

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

    carregarDados(id);
  }, []);

  

  async function carregarDados(idRestaurante) {
    try {
      setCarregando(true);
      setErro("");

      const [
        responseCardapios,
        responseProdutos,
      ] = await Promise.all([
        fetch(
          `${API_URL}/restaurantes/${idRestaurante}/cardapios/`
        ),
        fetch(
          `${API_URL}/restaurantes/${idRestaurante}/produtos/`
        ),
      ]);

      if (!responseCardapios.ok) {
        throw new Error(
          "Não foi possível carregar os cardápios."
        );
      }

      if (!responseProdutos.ok) {
        throw new Error(
          "Não foi possível carregar os produtos."
        );
      }

      const dadosCardapios =
        await responseCardapios.json();

      const dadosProdutos =
        await responseProdutos.json();

      setCardapios(dadosCardapios);
      setProdutos(dadosProdutos);

      await carregarSecoes(
        idRestaurante,
        dadosCardapios
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível carregar o cardápio."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarSecoes(
    idRestaurante,
    listaCardapios
  ) {
    const novoMapaSecoes = {};
    const novoMapaProdutos = {};

    for (const cardapio of listaCardapios) {
      const response = await fetch(
        `${API_URL}/restaurantes/${idRestaurante}/cardapios/${cardapio.id_cardapio}/secoes/`
      );

      if (!response.ok) {
        continue;
      }

      const secoes =
        await response.json();

      novoMapaSecoes[
        cardapio.id_cardapio
      ] = secoes;

      for (const secao of secoes) {
        const responseProdutosSecao =
          await fetch(
            `${API_URL}/secoes/${secao.id_secao}/produtos/`
          );

        if (!responseProdutosSecao.ok) {
          continue;
        }

        const relacoes =
          await responseProdutosSecao.json();

        novoMapaProdutos[
          secao.id_secao
        ] = relacoes;
      }
    }

    setSecoesPorCardapio(
      novoMapaSecoes
    );

    setProdutosPorSecao(
      novoMapaProdutos
    );
  }

  const produtosPorId = useMemo(() => {
    const mapa = {};

    for (const produto of produtos) {
      mapa[
        produto.id_produto
      ] = produto;
    }

    return mapa;
  }, [produtos]);

  function obterPrecoProduto(
    relacao,
    produto
  ) {
    if (relacao.preco !== null) {
      return Number(
        relacao.preco
      );
    }

    return Number(
      produto.preco_base
    );
  }

  function abrirModalSecao(cardapio) {
  setCardapioSelecionado(cardapio);
  setNomeSecao("");
  setDescricaoSecao("");
  setOrdemSecao("");
  setErro("");
  setModalSecaoAberto(true);
}

function fecharModalSecao() {
  if (salvandoSecao) {
    return;
  }

  setModalSecaoAberto(false);
  setCardapioSelecionado(null);
  setNomeSecao("");
  setDescricaoSecao("");
  setOrdemSecao("");
}

function alternarSecao(idSecao) {
  setSecoesAbertas((estadoAtual) => {
    const estadoAtualDaSecao =
      estadoAtual[idSecao] ?? true;

    return {
      ...estadoAtual,
      [idSecao]:
        !estadoAtualDaSecao,
    };
  });
}

async function criarSecao(event) {
  event.preventDefault();

  if (!cardapioSelecionado) {
    return;
  }

  if (!nomeSecao.trim()) {
    setErro(
      "Informe o nome da seção."
    );
    return;
  }

  try {
    setSalvandoSecao(true);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/cardapios/${cardapioSelecionado.id_cardapio}/secoes/`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          nome: nomeSecao.trim(),
          descricao:
            descricaoSecao.trim() ||
            null,
          ordem:
            ordemSecao === ""
              ? 0
              : Number(ordemSecao),
        }),
      }
    );

    const dados =
      await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível criar a seção."
      );
    }

    setSecoesPorCardapio(
      (estadoAtual) => {
        const secoesAtuais =
          estadoAtual[
            cardapioSelecionado.id_cardapio
          ] || [];

        const novasSecoes = [
          ...secoesAtuais,
          dados,
        ].sort(
          (a, b) =>
            a.ordem - b.ordem ||
            a.id_secao - b.id_secao
        );

        return {
          ...estadoAtual,
          [cardapioSelecionado.id_cardapio]:
            novasSecoes,
        };
      }
    );

    setModalSecaoAberto(false);
    setCardapioSelecionado(null);
    setNomeSecao("");
    setDescricaoSecao("");
    setOrdemSecao("");
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível criar a seção."
    );
  } finally {
    setSalvandoSecao(false);
  }
}

function abrirModalCardapio() {
  setNomeCardapio("");
  setDescricaoCardapio("");
  setErro("");
  setModalCardapioAberto(true);
}

function fecharModalCardapio() {
  if (salvandoCardapio) {
    return;
  }

  setModalCardapioAberto(false);
  setNomeCardapio("");
  setDescricaoCardapio("");
}

async function criarCardapio(event) {
  event.preventDefault();

  if (!nomeCardapio.trim()) {
    setErro("Informe o nome do cardápio.");
    return;
  }

  try {
    setSalvandoCardapio(true);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/cardapios/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nomeCardapio.trim(),
          descricao:
            descricaoCardapio.trim() || null,
          ativo: true,
        }),
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível criar o cardápio."
      );
    }

    setCardapios((estadoAtual) => [
      ...estadoAtual,
      dados,
    ]);

    setSecoesPorCardapio((estadoAtual) => ({
      ...estadoAtual,
      [dados.id_cardapio]: [],
    }));

    setModalCardapioAberto(false);
    setNomeCardapio("");
    setDescricaoCardapio("");
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível criar o cardápio."
    );
  } finally {
    setSalvandoCardapio(false);
  }
}

  function formatarPreco(valor) {
    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarRestaurante />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            Carregando cardápio...
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
                Cardápio
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Organize seus produtos,
                categorias e preços.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
  type="button"
  onClick={() =>
    router.push(
      "/restaurantes/cardapio/complementos"
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
    px-4
    py-2.5
    text-sm
    font-medium
    text-gray-700
    transition
    hover:bg-gray-50
  "
>
  <Settings2 size={18} />

  Complementos
</button>

              <button
                type="button"
                onClick={() =>
                    router.push(
                    "/restaurantes/cardapio/produtos/novo"
                    )
                }
                className="
                    flex
                    items-center
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

                Novo produto
                </button>
            </div>
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
                Selecione um restaurante para
                gerenciar o cardápio.
              </p>
            </div>
          )}

          {restauranteId &&
            cardapios.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <BookOpen
                  size={44}
                  className="mx-auto mb-4 text-gray-300"
                />

                <h2 className="text-lg font-medium text-gray-900">
                  Nenhum cardápio cadastrado
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  Crie o primeiro cardápio
                  para começar a organizar
                  os produtos do restaurante.
                </p>

                <button
                  type="button"
                  onClick={abrirModalCardapio}
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
                    hover:bg-red-700
                  "
                >
                  <Plus size={18} />

                  Criar cardápio
                </button>
              </div>
            )}

          <div className="space-y-8">
            {cardapios.map(
              (cardapio) => {
                const secoes =
                  secoesPorCardapio[
                    cardapio.id_cardapio
                  ] || [];

                return (
                  <section
                    key={
                      cardapio.id_cardapio
                    }
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={20}
                            className="text-red-600"
                          />

                          <h2 className="font-semibold text-gray-900">
                            {
                              cardapio.nome
                            }
                          </h2>
                        </div>

                        {cardapio.descricao && (
                          <p className="mt-1 text-sm text-gray-500">
                            {
                              cardapio.descricao
                            }
                          </p>
                        )}
                      </div>

                        <div className="flex items-center gap-3">
  <span
    className={`
      rounded-full
      px-2.5
      py-1
      text-xs
      font-medium
      ${
        cardapio.ativo
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-500"
      }
    `}
  >
    {cardapio.ativo
      ? "Ativo"
      : "Inativo"}
  </span>

  <button
    type="button"
    onClick={() =>
      abrirModalSecao(cardapio)
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
    <Plus size={17} />

    Nova seção
  </button>
</div>                               
                    </div>

                    

                    

                    {secoes.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-gray-500">
                          Nenhuma seção
                          cadastrada neste
                          cardápio.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {secoes.map(
                        (secao) => {
                            const relacoes =
                            produtosPorSecao[
                                secao.id_secao
                            ] || [];

                             const aberta =
                                secoesAbertas[
                                    secao.id_secao
                                ] ?? true;

                              return (
    <div
      key={secao.id_secao}
      className="
        border-b
        border-gray-100
        last:border-b-0
      "
    >
      <button
        type="button"
        onClick={() =>
          alternarSecao(
            secao.id_secao
          )
        }
        className="
          flex
          w-full
          items-center
          justify-between
          bg-gray-50
          px-5
          py-3
          text-left
          transition
          hover:bg-gray-100
        "
      >
        <div>
          <h3 className="font-medium text-gray-900">
            {secao.nome}
          </h3>

          {secao.descricao && (
            <p className="mt-0.5 text-xs text-gray-500">
              {secao.descricao}
            </p>
          )}
        </div>

        <ChevronDown
          size={18}
          className={`
            text-gray-400
            transition-transform
            duration-200
            ${
              aberta
                ? "rotate-180"
                : "rotate-0"
            }
          `}
        />
      </button>

      {aberta && (
        <>
          {relacoes.length === 0 ? (
            <div className="px-5 py-6 text-sm text-gray-400">
              Nenhum produto nesta seção.
            </div>
          ) : (
            <div>
              {relacoes.map(
                (relacao) => {
                  const produto =
                    produtosPorId[
                      relacao.id_produto
                    ];

                  if (!produto) {
                    return null;
                  }

                  const preco =
                    obterPrecoProduto(
                      relacao,
                      produto
                    );

                  return (
                    <div
                      key={relacao.id}
                      className="
                        flex
                        items-center
                        gap-4
                        border-t
                        border-gray-100
                        px-5
                        py-4
                      "
                    >
                      <div className="
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-lg
                        bg-gray-100
                      ">
                        {produto.imagem_url ? (
                          <img
                            src={`${API_URL}${produto.imagem_url}`}
                            alt={
                              produto.nome
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <Package
                            size={24}
                            className="text-gray-300"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        ">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {
                                produto.nome
                              }
                            </h4>

                            {produto.descricao && (
                              <p className="
                                mt-1
                                line-clamp-2
                                text-sm
                                text-gray-500
                              ">
                                {
                                  produto.descricao
                                }
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-4">
  <p className="font-medium text-gray-900">
    {formatarPreco(preco)}
  </p>

  <button
    type="button"
    onClick={() =>
      router.push(
        `/restaurantes/cardapio/produtos/${produto.id_produto}/editar`
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

    Editar
  </button>
</div>

                          

                          
                        </div>

                        <div className="mt-2">
                          <span
                            className={`
                              text-xs
                              font-medium
                              ${
                                produto.disponivel
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            `}
                          >
                            {produto.disponivel
                              ? "Disponível"
                              : "Indisponível"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
})}
                        
                      </div>
                    )}
                  </section>
                );
              }
            )}
          </div>
        </div>
      </main>
      {modalCardapioAberto && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Novo cardápio
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Crie um cardápio para organizar os produtos
          do restaurante.
        </p>
      </div>

      <form
        onSubmit={criarCardapio}
        className="p-6"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="nome-cardapio"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Nome do cardápio
            </label>

            <input
              id="nome-cardapio"
              type="text"
              value={nomeCardapio}
              onChange={(event) =>
                setNomeCardapio(event.target.value)
              }
              placeholder="Ex.: Cardápio principal"
              maxLength={100}
              autoFocus
              className="
                w-full
                rounded-lg
                border
                border-gray-300
                px-3
                py-2.5
                text-sm
                text-gray-900
                placeholder:text-gray-300
                outline-none
                transition
                focus:border-red-500
                focus:ring-2
                focus:ring-red-100
              "
            />
          </div>

          <div>
            <label
              htmlFor="descricao-cardapio"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Descrição
            </label>

            <textarea
              id="descricao-cardapio"
              value={descricaoCardapio}
              onChange={(event) =>
                setDescricaoCardapio(
                  event.target.value
                )
              }
              placeholder="Ex.: Cardápio principal do restaurante"
              maxLength={300}
              rows={3}
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-gray-300
                px-3
                py-2.5
                text-sm
                text-gray-900
                placeholder:text-gray-300
                outline-none
                transition
                focus:border-red-500
                focus:ring-2
                focus:ring-red-100
              "
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={fecharModalCardapio}
            disabled={salvandoCardapio}
            className="
              rounded-lg
              border
              border-gray-300
              px-4
              py-2.5
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={salvandoCardapio}
            className="
              rounded-lg
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {salvandoCardapio
              ? "Salvando..."
              : "Criar cardápio"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
     {modalSecaoAberto &&
        cardapioSelecionado && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/40
              px-4
            "
          >
            <div
              className="
                w-full
                max-w-lg
                rounded-xl
                bg-white
                shadow-xl
              "
            >
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Nova seção
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Cardápio:{" "}
                  <span className="font-medium text-gray-700">
                    {cardapioSelecionado.nome}
                  </span>
                </p>
              </div>

              <form
                onSubmit={criarSecao}
                className="p-6"
              >
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="nome-secao"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Nome da seção
                    </label>

                    <input
                      id="nome-secao"
                      type="text"
                      value={nomeSecao}
                      onChange={(event) =>
                        setNomeSecao(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Lanches"
                      maxLength={100}
                      autoFocus
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        text-gray-900
                        placeholder:text-gray-300
                        outline-none
                        transition
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="descricao-secao"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Descrição
                    </label>

                    <textarea
                      id="descricao-secao"
                      value={descricaoSecao}
                      onChange={(event) =>
                        setDescricaoSecao(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: Hambúrgueres e sanduíches"
                      maxLength={300}
                      rows={3}
                      className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        transition
                        text-gray-900
                        placeholder:text-gray-300
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ordem-secao"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Ordem
                    </label>

                    <input
                      id="ordem-secao"
                      type="number"
                      min="0"
                      value={ordemSecao}
                      onChange={(event) =>
                        setOrdemSecao(
                          event.target.value
                        )
                      }
                      placeholder="Ex.: 1"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        text-gray-900
                        placeholder:text-gray-300
                        outline-none
                        transition
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      Define a posição da seção no cardápio.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={fecharModalSecao}
                    disabled={salvandoSecao}
                    className="
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-gray-50
                      disabled:opacity-50
                    "
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={salvandoSecao}
                    className="
                      rounded-lg
                      bg-red-600
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {salvandoSecao
                      ? "Salvando..."
                      : "Criar seção"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </div>
  );
}
    
