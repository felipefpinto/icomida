"use client";

import {
  ArrowLeft,
  Plus,
  Save,
  Settings2,
  Trash2,
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

export default function GerenciarComplementos() {
  const router = useRouter();
  const params = useParams();
  
  const idProduto =
  Number(params.id_produto);

const idGrupo =
  Number(params.id_grupo);

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

  const [
    obrigatorio,
    setObrigatorio,
  ] = useState(false);

  const [
    minSelecoes,
    setMinSelecoes,
  ] = useState("0");

  const [
    maxSelecoes,
    setMaxSelecoes,
  ] = useState("1");

  const [
    complementos,
    setComplementos,
  ] = useState([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    excluindoGrupo,
    setExcluindoGrupo,
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
      setErro(
        "Nenhum restaurante selecionado."
      );

      setCarregando(false);
      return;
    }

    if (
      !idProduto ||
      Number.isNaN(idProduto)
    ) {
      setErro(
        "Produto não informado."
      );

      setCarregando(false);
      return;
    }

    const idRestaurante =
      Number(idSalvo);

    setRestauranteId(
      idRestaurante
    );

    carregarDados(
      idRestaurante
    );
  }, []);

  async function carregarDados(
    idRestaurante
  ) {
    try {
      setCarregando(true);
      setErro("");

      /*
       * CARREGA O GRUPO
       */

      const responseGrupo =
        await fetch(
          `${API_URL}/restaurantes/${idRestaurante}/produtos/${idProduto}/grupos-complementos/${idGrupo}`
        );

      const dadosGrupo =
        await responseGrupo.json();

      if (!responseGrupo.ok) {
        throw new Error(
          dadosGrupo.detail ||
            "Não foi possível carregar os complementos."
        );
      }

      setNome(
        dadosGrupo.nome || ""
      );

      setDescricao(
        dadosGrupo.descricao || ""
      );

      setObrigatorio(
        dadosGrupo.obrigatorio
      );

      setMinSelecoes(
        String(
          dadosGrupo.min_selecoes
        )
      );

      setMaxSelecoes(
        String(
          dadosGrupo.max_selecoes
        )
      );

      /*
       * CARREGA AS OPÇÕES
       */

      const responseComplementos =
        await fetch(
          `${API_URL}/restaurantes/${idRestaurante}/produtos/${idProduto}/grupos-complementos/${idGrupo}/complementos/`
        );

      const dadosComplementos =
        await responseComplementos.json();

      if (
        !responseComplementos.ok
      ) {
        throw new Error(
          dadosComplementos.detail ||
            "Não foi possível carregar as opções."
        );
      }

      setComplementos(
        dadosComplementos.map(
          (complemento) => ({
            ...complemento,

            preco_adicional:
              String(
                complemento.preco_adicional ??
                  ""
              ),

            estoque:
              complemento.estoque ===
              null
                ? ""
                : String(
                    complemento.estoque
                  ),

            novo: false,
          })
        )
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível carregar os complementos."
      );
    } finally {
      setCarregando(false);
    }
  }

  function voltar() {
    router.back();
  }

  function alterarComplemento(
    indice,
    campo,
    valor
  ) {
    setComplementos(
      (listaAtual) =>
        listaAtual.map(
          (complemento, index) =>
            index === indice
              ? {
                  ...complemento,
                  [campo]: valor,
                }
              : complemento
        )
    );
  }

  function adicionarComplemento() {
    setComplementos(
      (listaAtual) => [
        ...listaAtual,

        {
          id_complemento: null,
          nome: "",
          descricao: "",
          preco_adicional: "",
          estoque: "",
          disponivel: true,
          ativo: true,
          novo: true,
        },
      ]
    );
  }

  async function excluirComplemento(
    complemento,
    indice
  ) {
    /*
     * Se ainda não existe no banco,
     * remove somente da tela.
     */

    if (complemento.novo) {
      setComplementos(
        (listaAtual) =>
          listaAtual.filter(
            (_, index) =>
              index !== indice
          )
      );

      return;
    }

    const confirmar =
      window.confirm(
        `Deseja excluir a opção "${complemento.nome}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      const response =
        await fetch(
          `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${idGrupo}/complementos/${complemento.id_complemento}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        let mensagem =
          "Não foi possível excluir a opção.";

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

      setComplementos(
        (listaAtual) =>
          listaAtual.filter(
            (item) =>
              item.id_complemento !==
              complemento.id_complemento
          )
      );

      setSucesso(
        "Opção excluída com sucesso."
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível excluir a opção."
      );
    }
  }

  function validar() {
    if (!nome.trim()) {
      return (
        "Informe o nome dos complementos."
      );
    }

    const minimo =
      Number(minSelecoes);

    const maximo =
      Number(maxSelecoes);

    if (
      Number.isNaN(minimo) ||
      minimo < 0
    ) {
      return "Informe um mínimo válido.";
    }

    if (
      Number.isNaN(maximo) ||
      maximo < 1
    ) {
      return "Informe um máximo válido.";
    }

    if (minimo > maximo) {
      return (
        "O mínimo não pode ser maior que o máximo."
      );
    }

    if (
      obrigatorio &&
      minimo < 1
    ) {
      return (
        "Complementos obrigatórios devem exigir pelo menos uma escolha."
      );
    }

    if (
      complementos.length === 0
    ) {
      return (
        "Cadastre pelo menos uma opção."
      );
    }

    for (
      let indice = 0;
      indice <
      complementos.length;
      indice++
    ) {
      const complemento =
        complementos[indice];

      if (
        !complemento.nome.trim()
      ) {
        return `Informe o nome da opção ${indice + 1}.`;
      }

      if (
        complemento.preco_adicional !==
          "" &&
        Number(
          complemento.preco_adicional
        ) < 0
      ) {
        return `Informe um preço válido para a opção ${indice + 1}.`;
      }

      if (
        complemento.estoque !== "" &&
        Number(
          complemento.estoque
        ) < 0
      ) {
        return `Informe um estoque válido para a opção ${indice + 1}.`;
      }
    }

    if (
      maximo >
      complementos.length
    ) {
      return (
        "O máximo de escolhas não pode ser maior que a quantidade de opções."
      );
    }

    return null;
  }

  async function salvar(
    event
  ) {
    event.preventDefault();

    const erroValidacao =
      validar();

    if (erroValidacao) {
      setErro(
        erroValidacao
      );

      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      /*
       * ATUALIZA O GRUPO
       */

      const responseGrupo =
        await fetch(
          `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${idGrupo}`,
          {
            method: "PATCH",

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

              obrigatorio,

              min_selecoes:
                Number(
                  minSelecoes
                ),

              max_selecoes:
                Number(
                  maxSelecoes
                ),
            }),
          }
        );

      const dadosGrupo =
        await responseGrupo.json();

      if (!responseGrupo.ok) {
        throw new Error(
          dadosGrupo.detail ||
            "Não foi possível atualizar os complementos."
        );
      }

      /*
       * CRIA / ATUALIZA
       * AS OPÇÕES
       */

      for (
        let indice = 0;
        indice <
        complementos.length;
        indice++
      ) {
        const complemento =
          complementos[indice];

        const dados = {
          nome:
            complemento.nome.trim(),

          descricao:
            complemento.descricao
              ?.trim() ||
            null,

          preco_adicional:
            complemento
              .preco_adicional ===
            ""
              ? 0
              : Number(
                  complemento
                    .preco_adicional
                ),

          estoque:
            complemento.estoque ===
            ""
              ? null
              : Number(
                  complemento
                    .estoque
                ),

          ordem: indice,
        };

        /*
         * NOVO
         */

        if (complemento.novo) {
          const response =
            await fetch(
              `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${idGrupo}/complementos/`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    dados
                  ),
              }
            );

          const resultado =
            await response.json();

          if (!response.ok) {
            throw new Error(
              resultado.detail ||
                `Não foi possível criar "${complemento.nome}".`
            );
          }
        }

        /*
         * EXISTENTE
         */

        else {
          const response =
            await fetch(
              `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${idGrupo}/complementos/${complemento.id_complemento}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    dados
                  ),
              }
            );

          const resultado =
            await response.json();

          if (!response.ok) {
            throw new Error(
              resultado.detail ||
                `Não foi possível atualizar "${complemento.nome}".`
            );
          }
        }
      }

      await carregarDados(
        restauranteId
      );

      setSucesso(
        "Complementos atualizados com sucesso."
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirGrupo() {
    const confirmar =
      window.confirm(
        "Tem certeza que deseja excluir estes complementos definitivamente?\n\n" +
          "Eles serão removidos de todos os produtos que utilizam este grupo."
      );

    if (!confirmar) {
      return;
    }

    try {
      setExcluindoGrupo(true);
      setErro("");

      const response =
        await fetch(
          `${API_URL}/restaurantes/${restauranteId}/grupos-complementos/${idGrupo}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        let mensagem =
          "Não foi possível excluir os complementos.";

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

      router.back();
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível excluir os complementos."
      );
    } finally {
      setExcluindoGrupo(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarRestaurante />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            Carregando complementos...
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
          {/* VOLTAR */}

          <button
            type="button"
            onClick={voltar}
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
            <ArrowLeft size={18} />

            Voltar para o produto
          </button>

          {/* TÍTULO */}

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Gerenciar complementos
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Edite as regras e opções
              disponíveis para o cliente.
            </p>
          </div>

          {/* MENSAGENS */}

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
            onSubmit={salvar}
            className="space-y-6"
          >
            {/* CONFIGURAÇÃO */}

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Settings2
                    size={21}
                    className="text-red-600"
                  />

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Informações
                    </h2>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Configure como o cliente
                      poderá escolher.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nome
                  </label>

                  <input
                    value={nome}
                    onChange={(event) =>
                      setNome(
                        event.target.value
                      )
                    }
                    maxLength={120}
                    className="w-full text-sm
                      text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Descrição
                  </label>

                  <textarea
                    value={descricao}
                    onChange={(event) =>
                      setDescricao(
                        event.target.value
                      )
                    }
                    rows={3}
                    maxLength={255}
                    className="w-full text-sm
                      text-gray-900 resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      Escolha obrigatória
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      O cliente deverá escolher
                      pelo menos uma opção.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={obrigatorio}
                    onChange={(event) => {
                      const valor =
                        event.target.checked;

                      setObrigatorio(
                        valor
                      );

                      if (
                        valor &&
                        Number(
                          minSelecoes
                        ) === 0
                      ) {
                        setMinSelecoes(
                          "1"
                        );
                      }
                    }}
                    className="h-5 w-5 accent-red-600"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Mínimo de escolhas
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        minSelecoes
                      }
                      onChange={(event) =>
                        setMinSelecoes(
                          event.target.value
                        )
                      }
                      className="w-full text-sm
                      text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Máximo de escolhas
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        maxSelecoes
                      }
                      onChange={(event) =>
                        setMaxSelecoes(
                          event.target.value
                        )
                      }
                      className="w-full text-sm
                      text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* OPÇÕES */}

            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Opções
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Edite, adicione ou remova
                    opções deste grupo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    adicionarComplemento
                  }
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Plus size={17} />

                  Adicionar opção
                </button>
              </div>

              <div className="space-y-4 p-6">
                {complementos.map(
                  (
                    complemento,
                    indice
                  ) => (
                    <div
                      key={
                        complemento.id_complemento ??
                        `novo-${indice}`
                      }
                      className="rounded-xl border border-gray-200 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Opção{" "}
                            {indice + 1}
                          </p>

                          {complemento.novo && (
                            <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              Nova
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            excluirComplemento(
                              complemento,
                              indice
                            )
                          }
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2
                            size={16}
                          />

                          Excluir
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Nome
                          </label>

                          <input
                            value={
                              complemento.nome
                            }
                            onChange={(event) =>
                              alterarComplemento(
                                indice,
                                "nome",
                                event.target.value
                              )
                            }
                            maxLength={120}
                            className="w-full text-sm
                      text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Preço adicional
                          </label>

                          <div className="flex">
                            <span className="flex text-sm
                      text-gray-900 items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                              R$
                            </span>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                complemento.preco_adicional
                              }
                              onChange={(event) =>
                                alterarComplemento(
                                  indice,
                                  "preco_adicional",
                                  event.target.value
                                )
                              }
                              className="w-full text-sm
                      text-gray-900 rounded-r-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Descrição
                          </label>

                          <input
                            value={
                              complemento.descricao ||
                              ""
                            }
                            onChange={(event) =>
                              alterarComplemento(
                                indice,
                                "descricao",
                                event.target.value
                              )
                            }
                            maxLength={255}
                            placeholder="Opcional"
                            className="w-full  text-sm
                      text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Estoque
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              complemento.estoque
                            }
                            onChange={(event) =>
                              alterarComplemento(
                                indice,
                                "estoque",
                                event.target.value
                              )
                            }
                            placeholder="Ilimitado"
                            className="w-full rounded-lg text-sm
                      text-gray-900 border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />

                          <p className="mt-1.5 text-xs text-gray-500">
                            Deixe vazio para não
                            controlar estoque.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={
                    adicionarComplemento
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Plus size={17} />

                  Adicionar outra opção
                </button>
              </div>
            </section>

            {/* AÇÕES */}

            <div className="flex flex-col justify-between gap-4 pb-8 sm:flex-row">
              <button
                type="button"
                onClick={
                  excluirGrupo
                }
                disabled={
                  salvando ||
                  excluindoGrupo
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={18} />

                {excluindoGrupo
                  ? "Excluindo..."
                  : "Excluir definitivamente"}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={voltar}
                  disabled={
                    salvando ||
                    excluindoGrupo
                  }
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    salvando ||
                    excluindoGrupo
                  }
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <Save size={18} />

                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}