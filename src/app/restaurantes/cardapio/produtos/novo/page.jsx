"use client";

import {
  ArrowLeft,
  ImagePlus,
  Package,
  Save,
  Store,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const API_URL = "http://127.0.0.1:8000";

export default function NovoProduto() {
  const router = useRouter();

  const [restauranteId, setRestauranteId] =
    useState(null);

  const [cardapios, setCardapios] =
    useState([]);

  const [secoesPorCardapio, setSecoesPorCardapio] =
    useState({});

  const [nome, setNome] =
    useState("");

  const [descricao, setDescricao] =
    useState("");

  const [preco, setPreco] =
    useState("");

  const [estoque, setEstoque] =
    useState("");

  const [servePessoas, setServePessoas] =
    useState("");

  const [secaoId, setSecaoId] =
    useState("");
  
  const [imagem, setImagem] =
    useState(null);

  const [previewImagem, setPreviewImagem] =
    useState(null);  

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  useEffect(() => {
    const idSalvo =
      localStorage.getItem(
        "restauranteSelecionadoId"
      );

    if (!idSalvo) {
      setCarregando(false);
      return;
    }

    const idRestaurante =
      Number(idSalvo);

    setRestauranteId(
      idRestaurante
    );

    carregarCardapios(
      idRestaurante
    );
  }, []);

  async function carregarCardapios(
    idRestaurante
  ) {
    try {
      setCarregando(true);
      setErro("");

      const response =
        await fetch(
          `${API_URL}/restaurantes/${idRestaurante}/cardapios/`
        );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os cardápios."
        );
      }

      const dados =
        await response.json();

      setCardapios(dados);

      await carregarSecoes(
        idRestaurante,
        dados
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  function removerImagem() {
  if (previewImagem) {
    URL.revokeObjectURL(
      previewImagem
    );
  }

  setImagem(null);
  setPreviewImagem(null);
}

  function selecionarImagem(event) {
  const arquivo =
    event.target.files?.[0];

  if (!arquivo) {
    return;
  }

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !tiposPermitidos.includes(
      arquivo.type
    )
  ) {
    setErro(
      "Selecione uma imagem JPG, PNG ou WEBP."
    );
    return;
  }

  const tamanhoMaximo =
    5 * 1024 * 1024;

  if (
    arquivo.size >
    tamanhoMaximo
  ) {
    setErro(
      "A imagem deve ter no máximo 5 MB."
    );
    return;
  }

  setErro("");
  setImagem(arquivo);

  setPreviewImagem(
    URL.createObjectURL(
      arquivo
    )
  );
}



  async function carregarSecoes(
    idRestaurante,
    listaCardapios
  ) {
    const mapa = {};

    for (const cardapio of listaCardapios) {
      try {
        const response =
          await fetch(
            `${API_URL}/restaurantes/${idRestaurante}/cardapios/${cardapio.id_cardapio}/secoes/`
          );

        if (!response.ok) {
          mapa[
            cardapio.id_cardapio
          ] = [];

          continue;
        }

        const secoes =
          await response.json();

        mapa[
          cardapio.id_cardapio
        ] = secoes;
      } catch (error) {
        console.error(
          "Erro ao buscar seções:",
          error
        );

        mapa[
          cardapio.id_cardapio
        ] = [];
      }
    }

    setSecoesPorCardapio(
      mapa
    );
  }

  const todasSecoes = useMemo(() => {
    const lista = [];

    for (const cardapio of cardapios) {
      const secoes =
        secoesPorCardapio[
          cardapio.id_cardapio
        ] || [];

      for (const secao of secoes) {
        lista.push({
          ...secao,
          cardapioNome:
            cardapio.nome,
        });
      }
    }

    return lista;
  }, [
    cardapios,
    secoesPorCardapio,
  ]);

  useEffect(() => {
    if (
      todasSecoes.length > 0 &&
      !secaoId
    ) {
      setSecaoId(
        String(
          todasSecoes[0]
            .id_secao
        )
      );
    }
  }, [
    todasSecoes,
    secaoId,
  ]);

  async function criarProduto(
    event
  ) {
    event.preventDefault();

    if (!restauranteId) {
      setErro(
        "Nenhum restaurante selecionado."
      );
      return;
    }

    if (!nome.trim()) {
      setErro(
        "Informe o nome do produto."
      );
      return;
    }

    if (
      preco === "" ||
      Number(preco) <= 0
    ) {
      setErro(
        "Informe um preço válido."
      );
      return;
    }

    if (!secaoId) {
      setErro(
        "Selecione uma seção."
      );
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      /*
       * 1. CRIA O PRODUTO
       */

      const responseProduto =
        await fetch(
          `${API_URL}/restaurantes/${restauranteId}/produtos/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              nome:
                nome.trim(),

              descricao:
                descricao.trim() ||
                null,

              preco_base:
                Number(preco),

              estoque:
                estoque === ""
                  ? null
                  : Number(
                      estoque
                    ),

              serve_pessoas:
                servePessoas === ""
                  ? null
                  : Number(
                      servePessoas
                    ),
            }),
          }
        );

      const produtoCriado =
        await responseProduto.json();

      if (!responseProduto.ok) {
        throw new Error(
          produtoCriado.detail ||
            "Não foi possível criar o produto."
        );
      }
      /*
 * 2. ENVIA A IMAGEM
 */

if (imagem) {
  const formData =
    new FormData();

  formData.append(
    "arquivo",
    imagem
  );

  const responseImagem =
    await fetch(
      `${API_URL}/restaurantes/${restauranteId}/produtos/${produtoCriado.id_produto}/imagem`,
      {
        method: "POST",
        body: formData,
      }
    );

  const dadosImagem =
    await responseImagem.json();

  if (!responseImagem.ok) {
    throw new Error(
      dadosImagem.detail ||
        "Produto criado, mas não foi possível enviar a imagem."
    );
  }
}

      /*
       * 2. VINCULA PRODUTO À SEÇÃO
       */

      const responseSecao =
        await fetch(
          `${API_URL}/secoes/${secaoId}/produtos/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id_produto:
                produtoCriado.id_produto,

              preco: null,

              ordem: 0,
            }),
          }
        );

      const relacao =
        await responseSecao.json();

      if (!responseSecao.ok) {
        throw new Error(
          relacao.detail ||
            "Produto criado, mas não foi possível vinculá-lo à seção."
        );
      }

      setSucesso(
        "Produto criado com sucesso."
      );

      setTimeout(() => {
        router.push(
          "/restaurantes/cardapio"
        );
      }, 700);
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível criar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarRestaurante />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            Carregando...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarRestaurante />

      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">

          {/* CABEÇALHO */}

          <div className="mb-8">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/restaurantes/cardapio"
                )
              }
              className="
                mb-4
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-gray-500
                transition
                hover:text-gray-900
              "
            >
              <ArrowLeft size={18} />

              Voltar para cardápio
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Novo produto
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Cadastre as informações
                que serão exibidas no
                cardápio.
              </p>
            </div>
          </div>

          {erro && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {sucesso}
            </div>
          )}

          {!restauranteId ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <Store
                size={44}
                className="mx-auto mb-4 text-gray-300"
              />

              <h2 className="font-medium text-gray-900">
                Nenhum restaurante
                selecionado
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Selecione um restaurante
                antes de cadastrar um
                produto.
              </p>
            </div>
          ) : (
            <form
              onSubmit={
                criarProduto
              }
              className="space-y-6"
            >

              {/* INFORMAÇÕES PRINCIPAIS */}

              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Package
                      size={21}
                      className="text-red-600"
                    />

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Informações do
                        produto
                      </h2>

                      <p className="text-sm text-gray-500">
                        Dados principais
                        exibidos para o
                        cliente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div>
                    <label
                      htmlFor="nome"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Nome do produto
                    </label>

                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(
                        event
                      ) =>
                        setNome(
                          event
                            .target
                            .value
                        )
                      }
                      maxLength={120}
                      placeholder="Ex.: X-Bacon"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
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
                      htmlFor="descricao"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Descrição
                    </label>

                    <textarea
                      id="descricao"
                      value={
                        descricao
                      }
                      onChange={(
                        event
                      ) =>
                        setDescricao(
                          event
                            .target
                            .value
                        )
                      }
                      maxLength={500}
                      rows={4}
                      placeholder="Ex.: Hambúrguer artesanal, bacon, queijo, alface e tomate."
                      className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-gray-300
                        text-gray-900
                        placeholder:text-gray-300
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        transition
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />

                    <p className="mt-1 text-right text-xs text-gray-400">
                      {
                        descricao.length
                      }
                      /500
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="preco"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Preço
                    </label>

                    <div className="flex">
                      <span
                        className="
                          flex
                          items-center
                          rounded-l-lg
                          border
                          border-r-0
                          border-gray-300
                          bg-gray-50
                          px-3
                          text-sm
                          text-gray-500
                        "
                      >
                        R$
                      </span>

                      <input
                        id="preco"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={preco}
                        onChange={(
                          event
                        ) =>
                          setPreco(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="0,00"
                        className="
                          w-full
                          rounded-r-lg
                          border
                          border-gray-300
                          px-3
                          text-gray-900
                          placeholder:text-gray-300
                          py-2.5
                          text-sm
                          outline-none
                          transition
                          focus:border-red-500
                          focus:ring-2
                          focus:ring-red-100
                        "
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* IMAGEM */}

              <div className="p-6">
  {previewImagem ? (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div
        className="
          h-44
          w-44
          shrink-0
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-gray-100
        "
      >
        <img
          src={previewImagem}
          alt="Pré-visualização do produto"
          className="
            h-full
            w-full
            object-cover
          "
        />
      </div>

      <div className="flex flex-col justify-center">
        <p className="font-medium text-gray-900">
          {imagem?.name}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Imagem selecionada para o produto.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <label
            className="
              cursor-pointer
              rounded-lg
              border
              border-gray-300
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-50
            "
          >
            Trocar imagem

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                selecionarImagem
              }
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={
              removerImagem
            }
            className="
              rounded-lg
              px-4
              py-2
              text-sm
              font-medium
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  ) : (
    <label
      className="
        flex
        min-h-52
        cursor-pointer
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-gray-300
        bg-gray-50
        p-8
        text-center
        transition
        hover:border-red-300
        hover:bg-red-50/30
      "
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <ImagePlus
          size={25}
          className="text-gray-500"
        />
      </div>

      <p className="font-medium text-gray-800">
        Adicionar foto
      </p>

      <p className="mt-1 text-sm text-gray-500">
        JPG, PNG ou WEBP de até 5 MB
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={
          selecionarImagem
        }
        className="hidden"
      />
    </label>
  )}
</div>

              {/* ORGANIZAÇÃO */}

              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">
                    Organização no cardápio
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Escolha onde esse
                    produto será exibido.
                  </p>
                </div>

                <div className="p-6">
                  <label
                    htmlFor="secao"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Seção
                  </label>

                  {todasSecoes.length >
                  0 ? (
                    <select
                      id="secao"
                      value={
                        secaoId
                      }
                      onChange={(
                        event
                      ) =>
                        setSecaoId(
                          event
                            .target
                            .value
                        )
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-3
                        py-2.5
                        text-gray-500
                        outline-none
                        transition
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    >
                      {todasSecoes.map(
                        (
                          secao
                        ) => (
                          <option
                            key={
                              secao.id_secao
                            }
                            value={
                              secao.id_secao
                            }
                          >
                            {
                              secao.nome
                            }
                            {" — "}
                            {
                              secao.cardapioNome
                            }
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Nenhuma seção
                      cadastrada. Crie uma
                      seção no cardápio
                      antes de cadastrar o
                      produto.
                    </div>
                  )}
                </div>
              </section>

              {/* INFORMAÇÕES ADICIONAIS */}

              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">
                    Informações adicionais
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Campos opcionais para
                    controle e exibição.
                  </p>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="estoque"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Estoque
                    </label>

                    <input
                      id="estoque"
                      type="number"
                      min="0"
                      value={
                        estoque
                      }
                      onChange={(
                        event
                      ) =>
                        setEstoque(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Ex.: 50"
                      className="
                        w-full
                        text-gray-900
                        placeholder:text-gray-300
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      Deixe vazio caso não
                      queira controlar
                      estoque.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="serve-pessoas"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Serve quantas pessoas?
                    </label>

                    <input
                      id="serve-pessoas"
                      type="number"
                      min="1"
                      value={
                        servePessoas
                      }
                      onChange={(
                        event
                      ) =>
                        setServePessoas(
                          event
                            .target
                            .value
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
                        text-gray-900
                        placeholder:text-gray-300
                        text-sm
                        outline-none
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />
                  </div>
                </div>
              </section>

              {/* AÇÕES */}

              <div className="flex items-center justify-end gap-3 pb-8">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/restaurantes/cardapio"
                    )
                  }
                  disabled={
                    salvando
                  }
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-5
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
                  disabled={
                    salvando ||
                    todasSecoes.length ===
                      0
                  }
                  className="
                    flex
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
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Save size={18} />

                  {salvando
                    ? "Salvando..."
                    : "Criar produto"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}