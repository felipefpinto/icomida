"use client";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Package,
  Plus,
  Save,
  Settings2,
  Trash2,
  Pencil,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const API_URL =
  "http://127.0.0.1:8000";

export default function EditarProduto() {
  const router = useRouter();
  const params = useParams();

  const idProduto =
    Number(params.id_produto);

  const [
    restauranteId,
    setRestauranteId,
  ] = useState(null);

  const [nome, setNome] =
    useState("");

  const [
    descricao,
    setDescricao,
  ] = useState("");

  const [preco, setPreco] =
    useState("");

  const [
    estoque,
    setEstoque,
  ] = useState("");

  const [
    servePessoas,
    setServePessoas,
  ] = useState("");

  const [
    disponivel,
    setDisponivel,
  ] = useState(true);

  const [
    imagemAtual,
    setImagemAtual,
  ] = useState(null);

  const [
    novaImagem,
    setNovaImagem,
  ] = useState(null);

  const [
    previewImagem,
    setPreviewImagem,
  ] = useState(null);

  const [secoes, setSecoes] =
  useState([]);

const [
  secaoSelecionada,
  setSecaoSelecionada,
] = useState("");

const [
  secaoOriginal,
  setSecaoOriginal,
] = useState("");

const [
  gruposComplementos,
  setGruposComplementos,
] = useState([]);

const [
  carregandoComplementos,
  setCarregandoComplementos,
] = useState(false);

const [
  gruposAbertos,
  setGruposAbertos,
] = useState({});

const [
  modalAdicionarGrupo,
  setModalAdicionarGrupo,
] = useState(false);

const [
  modoAdicionarGrupo,
  setModoAdicionarGrupo,
] = useState(null);

const [
  gruposRestaurante,
  setGruposRestaurante,
] = useState([]);

const [
  carregandoGruposRestaurante,
  setCarregandoGruposRestaurante,
] = useState(false);

const [
  associandoGrupo,
  setAssociandoGrupo,
] = useState(null);

const [
  sugestoes,
  setSugestoes,
] = useState([]);

const [
  carregandoSugestoes,
  setCarregandoSugestoes,
] = useState(false);

const [
  modalAdicionarSugestao,
  setModalAdicionarSugestao,
] = useState(false);

const [
  produtosRestaurante,
  setProdutosRestaurante,
] = useState([]);

const [
  adicionandoSugestao,
  setAdicionandoSugestao,
] = useState(null);

const [
  carregandoProdutosRestaurante,
  setCarregandoProdutosRestaurante,
] = useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
  excluindo,
  setExcluindo,
] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    sucesso,
    setSucesso,
  ] = useState("");

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

    carregarProduto(
      idRestaurante
    );
    carregarSecoes(
  idRestaurante
);

carregarGruposComplementos(
  idRestaurante
);

carregarGruposComplementos(
  idRestaurante
);

carregarSugestoes(
  idRestaurante
);
  }, []);

  async function carregarProduto(
    idRestaurante
  ) {
    try {
      setCarregando(true);
      setErro("");

      const response =
        await fetch(
          `${API_URL}/restaurantes/${idRestaurante}/produtos/${idProduto}`
        );

      const dados =
        await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail ||
            "Não foi possível carregar o produto."
        );
      }

      setNome(
        dados.nome || ""
      );

      setDescricao(
        dados.descricao || ""
      );

      setPreco(
        String(
          dados.preco_base
        )
      );

      setEstoque(
        dados.estoque === null
          ? ""
          : String(
              dados.estoque
            )
      );

      setServePessoas(
        dados.serve_pessoas ===
          null
          ? ""
          : String(
              dados.serve_pessoas
            )
      );

      setDisponivel(
        dados.disponivel
      );

      setImagemAtual(
        dados.imagem_url
      );
    } catch (error) {
      console.error(
        error
      );

      setErro(
        error.message ||
          "Não foi possível carregar o produto."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarSecoes(
  idRestaurante
) {
  try {
    const responseCardapios =
      await fetch(
        `${API_URL}/restaurantes/${idRestaurante}/cardapios/`
      );

    const dadosCardapios =
      await responseCardapios.json();

    if (!responseCardapios.ok) {
      throw new Error(
        "Não foi possível carregar os cardápios."
      );
    }

    const listaSecoes = [];

    for (
      const cardapio
      of dadosCardapios
    ) {
      const responseSecoes =
        await fetch(
          `${API_URL}/restaurantes/${idRestaurante}/cardapios/${cardapio.id_cardapio}/secoes/`
        );

      if (!responseSecoes.ok) {
        continue;
      }

      const dadosSecoes =
        await responseSecoes.json();

      for (
        const secao
        of dadosSecoes
      ) {
        listaSecoes.push({
          ...secao,
          cardapioNome:
            cardapio.nome,
        });
      }
    }

    setSecoes(listaSecoes);

    await descobrirSecaoProduto(
      listaSecoes
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível carregar as seções."
    );
  }
}

async function descobrirSecaoProduto(
  listaSecoes
) {
  for (
    const secao
    of listaSecoes
  ) {
    const response =
      await fetch(
        `${API_URL}/secoes/${secao.id_secao}/produtos/`
      );

    if (!response.ok) {
      continue;
    }

    const relacoes =
      await response.json();

    const pertence =
      relacoes.some(
        (relacao) =>
          Number(
            relacao.id_produto
          ) === idProduto
      );

    if (pertence) {
      const id =
        String(
          secao.id_secao
        );

      setSecaoOriginal(id);
      setSecaoSelecionada(id);

      return;
    }
  }
}

async function carregarGruposComplementos(
  idRestaurante
) {
  try {
    setCarregandoComplementos(true);

    const response = await fetch(
      `${API_URL}/restaurantes/${idRestaurante}/produtos/${idProduto}/grupos-complementos/`
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível carregar os grupos de complementos."
      );
    }

    const gruposComOpcoes =
      await Promise.all(
        dados.map(async (grupo) => {
          const responseComplementos =
            await fetch(
              `${API_URL}/restaurantes/${idRestaurante}/produtos/${idProduto}/grupos-complementos/${grupo.id_grupo}/complementos/`
            );

          if (!responseComplementos.ok) {
            return {
              ...grupo,
              complementos: [],
            };
          }

          const complementos =
            await responseComplementos.json();

          return {
            ...grupo,
            complementos,
          };
        })
      );

    setGruposComplementos(
      gruposComOpcoes
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível carregar os complementos."
    );
  } finally {
    setCarregandoComplementos(false);
  }
}

async function carregarGruposRestaurante() {
  try {
    setCarregandoGruposRestaurante(true);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/grupos-complementos/`
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível carregar os grupos do restaurante."
      );
    }

    setGruposRestaurante(dados);
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível carregar os grupos."
    );
  } finally {
    setCarregandoGruposRestaurante(false);
  }
}

async function associarGrupo(idGrupo) {
  try {
    setAssociandoGrupo(idGrupo);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${idGrupo}/associar`,
      {
        method: "POST",
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível adicionar o grupo."
      );
    }

    await carregarGruposComplementos(
      restauranteId
    );

    setModalAdicionarGrupo(false);
    setModoAdicionarGrupo(null);

    setSucesso(
      "Grupo adicionado ao produto com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível adicionar o grupo."
    );
  } finally {
    setAssociandoGrupo(null);
  }
}

async function removerGrupoDoProduto(idGrupo) {
  const confirmar = window.confirm(
    "Deseja remover estes complementos deste produto?\n\n" +
      "Os complementos continuarão cadastrados no restaurante " +
      "e poderão ser usados em outros produtos."
  );

  if (!confirmar) {
    return;
  }

  try {
    setErro("");
    setSucesso("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${idGrupo}/associar`,
      {
        method: "DELETE",
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível remover os complementos deste produto."
      );
    }

    await carregarGruposComplementos(restauranteId);

    setSucesso(
      "Complementos removidos deste produto com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível remover os complementos."
    );
  }
}

async function carregarSugestoes(
  idRestaurante
) {
  try {
    setCarregandoSugestoes(true);

    const response = await fetch(
      `${API_URL}/restaurantes/${idRestaurante}/produtos/${idProduto}/sugestoes/`
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível carregar as sugestões."
      );
    }

    setSugestoes(dados);
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível carregar o Compre também."
    );
  } finally {
    setCarregandoSugestoes(false);
  }
}

async function carregarProdutosRestaurante() {
  try {
    setCarregandoProdutosRestaurante(true);
    setErro("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/produtos/`
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível carregar os produtos."
      );
    }

    setProdutosRestaurante(dados);
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível carregar os produtos."
    );
  } finally {
    setCarregandoProdutosRestaurante(false);
  }
}

async function adicionarSugestao(
  idProdutoSugerido
) {
  try {
    setAdicionandoSugestao(
      idProdutoSugerido
    );

    setErro("");
    setSucesso("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/sugestoes/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id_produto_sugerido:
            idProdutoSugerido,

          ordem: sugestoes.length,
        }),
      }
    );

    const dados = await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível adicionar o produto."
      );
    }

    /*
     * Atualiza a lista do Compre também
     */
    await carregarSugestoes(
      restauranteId
    );

    /*
     * Fecha o modal
     */
    setModalAdicionarSugestao(
      false
    );

    setSucesso(
      "Produto adicionado ao Compre também com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível adicionar o produto."
    );
  } finally {
    setAdicionandoSugestao(null);
  }
}

async function removerSugestao(
  idSugestao
) {
  const confirmar = window.confirm(
    "Deseja remover este produto do Compre também?"
  );

  if (!confirmar) {
    return;
  }

  try {
    setErro("");
    setSucesso("");

    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/sugestoes/${idSugestao}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      let mensagem =
        "Não foi possível remover a sugestão.";

      try {
        const dados =
          await response.json();

        mensagem =
          dados.detail || mensagem;
      } catch {
        // DELETE pode retornar sem conteúdo
      }

      throw new Error(mensagem);
    }

    await carregarSugestoes(
      restauranteId
    );

    setSucesso(
      "Produto removido do Compre também."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível remover a sugestão."
    );
  }
}

async function excluirProduto() {
  const confirmar =
    window.confirm(
      "Tem certeza que deseja excluir este produto? Essa ação não poderá ser desfeita."
    );

  if (!confirmar) {
    return;
  }

  try {
    setExcluindo(true);
    setErro("");
    setSucesso("");

    const response =
      await fetch(
        `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}`,
        {
          method: "DELETE",
        }
      );

    if (!response.ok) {
      let mensagem =
        "Não foi possível excluir o produto.";

      try {
        const dados =
          await response.json();

        mensagem =
          dados.detail ||
          mensagem;
      } catch {
        // resposta sem JSON
      }

      throw new Error(
        mensagem
      );
    }

    router.push(
      "/restaurantes/cardapio"
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível excluir o produto."
    );
  } finally {
    setExcluindo(false);
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

  function selecionarImagem(
    event
  ) {
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

    if (
      arquivo.size >
      5 * 1024 * 1024
    ) {
      setErro(
        "A imagem deve ter no máximo 5 MB."
      );
      return;
    }

    if (previewImagem) {
      URL.revokeObjectURL(
        previewImagem
      );
    }

    setNovaImagem(
      arquivo
    );

    setPreviewImagem(
      URL.createObjectURL(
        arquivo
      )
    );

    setErro("");
  }

  function cancelarNovaImagem() {
    if (
      previewImagem
    ) {
      URL.revokeObjectURL(
        previewImagem
      );
    }

    setNovaImagem(null);
    setPreviewImagem(null);
  }

  async function salvarProduto(
    event
  ) {
    event.preventDefault();

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

    if (
  secaoSelecionada &&
  secaoSelecionada !==
    secaoOriginal
) {
  /*
   * Remove da seção antiga
   */

  if (secaoOriginal) {
    const responseRemover =
      await fetch(
        `${API_URL}/secoes/${secaoOriginal}/produtos/${idProduto}`,
        {
          method: "DELETE",
        }
      );

    if (!responseRemover.ok) {
      const dados =
        await responseRemover.json();

      throw new Error(
        dados.detail ||
          "Não foi possível remover o produto da seção anterior."
      );
    }
  }

  /*
   * Adiciona na nova seção
   */

  const responseAdicionar =
    await fetch(
      `${API_URL}/secoes/${secaoSelecionada}/produtos/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          id_produto:
            idProduto,

          preco: null,
          ordem: 0,
        }),
      }
    );

  const dadosAdicionar =
    await responseAdicionar.json();

  if (!responseAdicionar.ok) {
    throw new Error(
      dadosAdicionar.detail ||
        "Não foi possível adicionar o produto à nova seção."
    );
  }

  setSecaoOriginal(
    secaoSelecionada
  );
}

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      const response =
        await fetch(
          `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
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

                disponivel:
                  disponivel,
              }),
              
          }
        );

      const dados =
        await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail ||
            "Não foi possível atualizar o produto."
        );
      }

      if (novaImagem) {
        const formData =
          new FormData();

        formData.append(
          "arquivo",
          novaImagem
        );

        const responseImagem =
          await fetch(
            `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/imagem`,
            {
              method: "POST",
              body: formData,
            }
          );

        const dadosImagem =
          await responseImagem.json();

        if (
          !responseImagem.ok
        ) {
          throw new Error(
            dadosImagem.detail ||
              "Produto atualizado, mas não foi possível atualizar a imagem."
          );
        }

        setImagemAtual(
          dadosImagem.imagem_url
        );

        cancelarNovaImagem();
      }

      setSucesso(
        "Produto atualizado com sucesso."
      );
    } catch (error) {
      console.error(
        error
      );

      setErro(
        error.message ||
          "Não foi possível atualizar o produto."
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
            Carregando produto...
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
              hover:text-gray-900
            "
          >
            <ArrowLeft
              size={18}
            />

            Voltar para cardápio
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Editar produto
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Altere as informações
              exibidas no cardápio.
            </p>
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

          <form
            onSubmit={
              salvarProduto
            }
            className="space-y-6"
          >

            {/* DADOS */}

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Package
                    size={21}
                    className="text-red-600"
                  />

                  <h2 className="font-semibold text-gray-900">
                    Informações do produto
                  </h2>
                </div>
              </div>

              <div className="space-y-5 p-6">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nome
                  </label>

                  <input
                    value={nome}
                    onChange={(
                      event
                    ) =>
                      setNome(
                        event.target
                          .value
                      )
                    }
                    maxLength={120}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2.5
                      text-sm
                      text-gray-900
                      outline-none
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Descrição
                  </label>

                  <textarea
                    value={
                      descricao
                    }
                    onChange={(
                      event
                    ) =>
                      setDescricao(
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    maxLength={500}
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
                      outline-none
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Preço
                  </label>

                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      R$
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={preco}
                      onChange={(
                        event
                      ) =>
                        setPreco(
                          event.target
                            .value
                        )
                      }
                      className="
                        w-full
                        rounded-r-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        text-gray-900
                        outline-none
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Estoque
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        estoque
                      }
                      onChange={(
                        event
                      ) =>
                        setEstoque(
                          event.target
                            .value
                        )
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        text-gray-900
                        outline-none
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Serve pessoas
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        servePessoas
                      }
                      onChange={(
                        event
                      ) =>
                        setServePessoas(
                          event.target
                            .value
                        )
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2.5
                        text-sm
                        text-gray-900
                        outline-none
                      "
                    />
                  </div>
                  <div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Seção do cardápio
  </label>

  <select
    value={
      secaoSelecionada
    }
    onChange={(event) =>
      setSecaoSelecionada(
        event.target.value
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
      text-sm
      text-gray-900
      outline-none
      focus:border-red-500
      focus:ring-2
      focus:ring-red-100
    "
  >
    <option value="">
      Selecione uma seção
    </option>

    {secoes.map(
      (secao) => (
        <option
          key={
            secao.id_secao
          }
          value={
            secao.id_secao
          }
        >
          {secao.cardapioNome}
          {" — "}
          {secao.nome}
        </option>
      )
    )}
  </select>

  <p className="mt-1.5 text-xs text-gray-500">
    Define onde o produto
    aparecerá no cardápio.
  </p>
</div>
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      Produto disponível
                    </p>

                    <p className="text-sm text-gray-500">
                      Quando desativado,
                      o produto não deve
                      ficar disponível
                      para pedidos.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      disponivel
                    }
                    onChange={(
                      event
                    ) =>
                      setDisponivel(
                        event.target
                          .checked
                      )
                    }
                    className="h-5 w-5 accent-red-600"
                  />
                </label>
              </div>
            </section>

            {/* IMAGEM */}

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <ImagePlus
                    size={21}
                    className="text-red-600"
                  />

                  <h2 className="font-semibold text-gray-900">
                    Foto do produto
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row">

                  <div className="flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100">

                    {previewImagem ? (
                      <img
                        src={
                          previewImagem
                        }
                        alt="Nova imagem"
                        className="h-full w-full object-cover"
                      />
                    ) : imagemAtual ? (
                      <img
                        src={`${API_URL}${imagemAtual}`}
                        alt={nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus
                        size={30}
                        className="text-gray-300"
                      />
                    )}

                  </div>

                  <div className="flex flex-1 flex-col justify-center">
                    <p className="font-medium text-gray-900">
                      {novaImagem
                        ? novaImagem.name
                        : imagemAtual
                          ? "Imagem atual do produto"
                          : "Produto sem imagem"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      JPG, PNG ou WEBP
                      de até 5 MB.
                    </p>

                    <div className="mt-4">
                      <label
                        className="
                          inline-flex
                          cursor-pointer
                          rounded-lg
                          border
                          border-gray-300
                          px-4
                          py-2
                          text-sm
                          font-medium
                          text-gray-700
                          hover:bg-gray-50
                        "
                      >
                        {imagemAtual ||
                        novaImagem
                          ? "Trocar imagem"
                          : "Adicionar imagem"}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            selecionarImagem
                          }
                          className="hidden"
                        />
                      </label>

                      {novaImagem && (
                        <button
                          type="button"
                          onClick={
                            cancelarNovaImagem
                          }
                          className="ml-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Cancelar troca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

{/* COMPLEMENTOS */}

<section className="rounded-xl border border-gray-200 bg-white">
  {/* CABEÇALHO */}
  <div className="border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Settings2
          size={21}
          className="text-red-600"
        />

        <div>
          <h2 className="font-semibold text-gray-900">
            Complementos
          </h2>

          <p className="mt-0.5 text-sm text-gray-500">
            Configure as opções que o cliente
            poderá escolher.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setModoAdicionarGrupo(null);
          setModalAdicionarGrupo(true);
        }}
        className="
          flex
          items-center
          gap-2
          rounded-lg
          bg-red-600
          px-4
          py-2
          text-sm
          font-medium
          text-white
          transition
          hover:bg-red-700
        "
      >
        <Plus size={17} />

        Adicionar complementos
      </button>
    </div>
  </div>

  {/* CONTEÚDO */}
  <div className="p-6">
    {carregandoComplementos ? (
      <p className="text-sm text-gray-500">
        Carregando complementos...
      </p>
    ) : gruposComplementos.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center">
        <Settings2
          size={28}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 font-medium text-gray-700">
          Nenhum complemento configurado
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Adicione opções de personalização
          para este produto.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {gruposComplementos.map((grupo) => {
          const aberto =
            gruposAbertos[grupo.id_grupo];

          return (
            <div
              key={grupo.id_grupo}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              {/* CABEÇALHO DO GRUPO */}
              <div className="flex items-center justify-between gap-4 px-4 py-4">
                {/* INFORMAÇÕES */}
                <button
                  type="button"
                  onClick={() =>
                    alternarGrupo(
                      grupo.id_grupo
                    )
                  }
                  className="
                    flex
                    min-w-0
                    flex-1
                    items-center
                    text-left
                  "
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {grupo.nome}
                      </p>

                      <span
                        className={`
                          rounded-full
                          px-2
                          py-0.5
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
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {grupo.min_selecoes ===
                      grupo.max_selecoes
                        ? `Escolha ${grupo.max_selecoes}`
                        : `Escolha de ${grupo.min_selecoes} até ${grupo.max_selecoes}`}

                      {" • "}

                      {grupo.complementos.length}{" "}

                      {grupo.complementos.length === 1
                        ? "opção"
                        : "opções"}
                    </p>
                  </div>
                </button>

                {/* AÇÕES DO GRUPO */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* GERENCIAR */}
<button
  type="button"
  onClick={() => {
    router.push(
      `/restaurantes/cardapio/produtos/${idProduto}/complementos/${grupo.id_grupo}/editar`
    );
  }}
  className="
    flex
    items-center
    gap-1.5
    rounded-lg
    border
    border-gray-200
    px-3
    py-2
    text-sm
    font-medium
    text-gray-700
    transition
    hover:border-gray-300
    hover:bg-gray-50
  "
>
  <Pencil size={15} />

  Gerenciar
</button>
                  {/* REMOVER DO PRODUTO */}
                  <button
                    type="button"
                    onClick={() =>
                      removerGrupoDoProduto(
                        grupo.id_grupo
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-red-200
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <Trash2 size={15} />

                    Remover
                  </button>

                  {/* ABRIR / FECHAR */}
                  <button
                    type="button"
                    onClick={() =>
                      alternarGrupo(
                        grupo.id_grupo
                      )
                    }
                    className="
                      rounded-lg
                      p-2
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-gray-700
                    "
                    aria-label={
                      aberto
                        ? "Fechar complementos"
                        : "Abrir complementos"
                    }
                  >
                    {aberto ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* OPÇÕES */}
              {aberto && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                  {grupo.complementos.length ===
                  0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhuma opção cadastrada.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {grupo.complementos.map(
                        (complemento) => (
                          <div
                            key={
                              complemento.id_complemento
                            }
                            className="flex items-center justify-between gap-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {complemento.nome}
                              </p>

                              {complemento.descricao && (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {
                                    complemento.descricao
                                  }
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 text-sm font-medium text-gray-700">
                              {Number(
                                complemento.preco_adicional
                              ) === 0
                                ? "Grátis"
                                : `+ R$ ${Number(
                                    complemento.preco_adicional
                                  )
                                    .toFixed(2)
                                    .replace(
                                      ".",
                                      ","
                                    )}`}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
</section>

{/* COMPRE TAMBÉM */}

<section className="rounded-xl border border-gray-200 bg-white">
  <div className="border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <ShoppingBag
          size={21}
          className="text-red-600"
        />

        <div>
          <h2 className="font-semibold text-gray-900">
            Compre também
          </h2>

          <p className="mt-0.5 text-sm text-gray-500">
            Sugira outros produtos para o cliente
            adicionar ao pedido.
          </p>
        </div>
      </div>

<button
  type="button"
  onClick={() => {
    setModalAdicionarSugestao(true);
    carregarProdutosRestaurante();
  }}
  className="
    flex
    items-center
    gap-2
    rounded-lg
    bg-red-600
    px-4
    py-2
    text-sm
    font-medium
    text-white
    transition
    hover:bg-red-700
  "
>
  <Plus size={17} />

  Adicionar produto
</button>
    </div>
  </div>

  <div className="p-6">
    {carregandoSugestoes ? (
      <p className="text-sm text-gray-500">
        Carregando sugestões...
      </p>
    ) : sugestoes.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-300 px-6 py-8 text-center">
        <ShoppingBag
          size={28}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 font-medium text-gray-700">
          Nenhuma sugestão configurada
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Adicione outros produtos para aparecerem
          em "Compre também".
        </p>
      </div>
    ) : (
      <div className="divide-y divide-gray-200">
        {sugestoes.map((sugestao) => {
          const produto =
            sugestao.produto_sugerido;

          return (
            <div
              key={sugestao.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  {produto.imagem_url ? (
                    <img
                      src={`${API_URL}${produto.imagem_url}`}
                      alt={produto.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package
                      size={22}
                      className="text-gray-300"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {produto.nome}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    R${" "}
                    {Number(
                      produto.preco_base
                    )
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                </div>
              </div>

<button
  type="button"
  onClick={() =>
    removerSugestao(
      sugestao.id
    )
  }
  className="
    flex
    items-center
    gap-1.5
    rounded-lg
    border
    border-red-200
    px-3
    py-2
    text-sm
    font-medium
    text-red-600
    transition
    hover:bg-red-50
  "
>
  <Trash2 size={15} />

  Remover
</button>
            </div>
          );
        })}
      </div>
    )}
  </div>
</section>




            {/* AÇÕES */}

            <div className="flex flex-col justify-between gap-4 pb-8 sm:flex-row">
<button
  type="button"
  onClick={
    excluirProduto
  }
  disabled={
    salvando ||
    excluindo
  }
  className="
    flex
    items-center
    justify-center
    gap-2
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
    disabled:opacity-50
  "
>
  <Trash2
    size={18}
  />

  {excluindo
    ? "Excluindo..."
    : "Excluir produto"}
</button>
<div className="flex gap-3">
  <button
    type="button"
    onClick={() =>
      router.push(
        "/restaurantes/cardapio"
      )
    }
    disabled={
      salvando ||
      excluindo
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
      hover:bg-gray-50
    "
  >
    Cancelar
  </button>

  <button
    type="submit"
    disabled={
      salvando ||
      excluindo
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
      hover:bg-red-700
      disabled:opacity-50
    "
  >
    <Save
      size={18}
    />

    {salvando
      ? "Salvando..."
      : "Salvar alterações"}
  </button>
</div>

            </div>
          </form>
        {modalAdicionarGrupo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Adicionar complementos
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Crie um novo grupo ou reutilize um
          grupo já cadastrado.
        </p>
      </div>

      <div className="p-6">
        {!modoAdicionarGrupo && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/restaurantes/cardapio/produtos/${idProduto}/complementos/novo`
                )
              }
              className="w-full rounded-lg border border-gray-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50"
            >
              <p className="font-medium text-gray-900">
                + Criar novo grupo
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Cadastre um novo grupo de
                complementos para este produto.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setModoAdicionarGrupo(
                  "existente"
                );

                carregarGruposRestaurante();
              }}
              className="w-full rounded-lg border border-gray-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50"
            >
              <p className="font-medium text-gray-900">
                Usar grupo existente
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Reutilize um grupo já
                cadastrado no restaurante.
              </p>
            </button>
          </div>
        )}

        {modoAdicionarGrupo ===
          "existente" && (
          <div>
            <button
              type="button"
              onClick={() =>
                setModoAdicionarGrupo(null)
              }
              className="mb-4 text-sm font-medium text-red-600 hover:text-red-700"
            >
              ← Voltar
            </button>

            {carregandoGruposRestaurante ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Carregando grupos...
              </p>
            ) : (
              <div className="space-y-2">
                {gruposRestaurante
                  .filter(
                    (grupo) =>
                      !gruposComplementos.some(
                        (grupoProduto) =>
                          grupoProduto.id_grupo ===
                          grupo.id_grupo
                      )
                  )
                  .map((grupo) => (
                    <div
                      key={grupo.id_grupo}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {grupo.nome}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {grupo.obrigatorio
                            ? "Obrigatório"
                            : "Opcional"}

                          {" • "}

                          {grupo.min_selecoes ===
                          grupo.max_selecoes
                            ? `Escolha ${grupo.max_selecoes}`
                            : `Escolha de ${grupo.min_selecoes} até ${grupo.max_selecoes}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          associandoGrupo ===
                          grupo.id_grupo
                        }
                        onClick={() =>
                          associarGrupo(
                            grupo.id_grupo
                          )
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {associandoGrupo ===
                        grupo.id_grupo
                          ? "Adicionando..."
                          : "Adicionar"}
                      </button>
                    </div>
                  ))}

                {gruposRestaurante.filter(
                  (grupo) =>
                    !gruposComplementos.some(
                      (grupoProduto) =>
                        grupoProduto.id_grupo ===
                        grupo.id_grupo
                    )
                ).length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Nenhum grupo disponível
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Todos os grupos existentes
                      já estão associados a este
                      produto.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {modoAdicionarGrupo === "novo" && (
          <div>
            <button
              type="button"
              onClick={() =>
                setModoAdicionarGrupo(null)
              }
              className="mb-4 text-sm font-medium text-red-600 hover:text-red-700"
            >
              ← Voltar
            </button>

            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="font-medium text-gray-700">
                Criar novo grupo
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Vamos implementar este formulário
                no próximo passo.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-gray-200 px-6 py-4">
        <button
          type="button"
          onClick={() => {
            setModalAdicionarGrupo(false);
            setModoAdicionarGrupo(null);
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}  
{modalAdicionarSugestao && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">

      {/* CABEÇALHO */}

      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Adicionar ao Compre também
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Escolha um produto para recomendar junto
          com {nome}.
        </p>
      </div>

      {/* CONTEÚDO */}

      <div className="max-h-[500px] overflow-y-auto p-6">
        {carregandoProdutosRestaurante ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Carregando produtos...
          </p>
        ) : (
          <div className="space-y-2">

            {produtosRestaurante
              .filter((produto) => {
                /*
                 * Não mostra o próprio produto
                 */
                if (
                  Number(produto.id_produto) ===
                  idProduto
                ) {
                  return false;
                }

                /*
                 * Não mostra produtos que já
                 * estão no Compre também
                 */
                const jaAdicionado =
                  sugestoes.some(
                    (sugestao) =>
                      Number(
                        sugestao.id_produto_sugerido
                      ) ===
                      Number(
                        produto.id_produto
                      )
                  );

                return !jaAdicionado;
              })
              .map((produto) => (
                <div
                  key={produto.id_produto}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-lg
                    border
                    border-gray-200
                    p-3
                    transition
                    hover:border-red-200
                    hover:bg-red-50/30
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">

                    {/* IMAGEM */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                      {produto.imagem_url ? (
                        <img
                          src={`${API_URL}${produto.imagem_url}`}
                          alt={produto.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          size={21}
                          className="text-gray-300"
                        />
                      )}
                    </div>

                    {/* INFORMAÇÕES */}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {produto.nome}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        R${" "}
                        {Number(
                          produto.preco_base
                        )
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                  </div>

                  <button
  type="button"
  onClick={() =>
    adicionarSugestao(
      produto.id_produto
    )
  }
  disabled={
    adicionandoSugestao ===
    produto.id_produto
  }
  className="
    shrink-0
    rounded-lg
    bg-red-600
    px-3
    py-2
    text-sm
    font-medium
    text-white
    transition
    hover:bg-red-700
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
>
  {adicionandoSugestao ===
  produto.id_produto
    ? "Adicionando..."
    : "Adicionar"}
</button>
                </div>
              ))}

            {/* NENHUM PRODUTO DISPONÍVEL */}

            {produtosRestaurante.filter(
              (produto) =>
                Number(produto.id_produto) !==
                  idProduto &&
                !sugestoes.some(
                  (sugestao) =>
                    Number(
                      sugestao.id_produto_sugerido
                    ) ===
                    Number(
                      produto.id_produto
                    )
                )
            ).length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                <Package
                  size={26}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  Nenhum produto disponível
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Todos os outros produtos já estão
                  no Compre também.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RODAPÉ */}

      <div className="flex justify-end border-t border-gray-200 px-6 py-4">
        <button
          type="button"
          onClick={() =>
            setModalAdicionarSugestao(false)
          }
          className="
            rounded-lg
            border
            border-gray-300
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            hover:bg-gray-50
          "
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </main>
    </div>
  );
}