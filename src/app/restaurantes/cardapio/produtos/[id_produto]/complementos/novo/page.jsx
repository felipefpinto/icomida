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

export default function CriarComplementos() {
  const router = useRouter();
  const params = useParams();

  const idProduto =
    Number(params.id_produto);

  const [
    restauranteId,
    setRestauranteId,
  ] = useState(null);

  const [
    produto,
    setProduto,
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
  ] = useState([
    {
      nome: "",
      descricao: "",
      preco_adicional: "",
      estoque: "",
    },
  ]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

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

    const idRestaurante =
      Number(idSalvo);

    setRestauranteId(
      idRestaurante
    );

    carregarProduto(
      idRestaurante
    );
  }, []);

  async function carregarProduto(
    idRestaurante
  ) {
    try {
      setCarregando(true);

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

      setProduto(dados);
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível carregar o produto."
      );
    } finally {
      setCarregando(false);
    }
  }

  function adicionarComplemento() {
    setComplementos(
      (listaAtual) => [
        ...listaAtual,
        {
          nome: "",
          descricao: "",
          preco_adicional: "",
          estoque: "",
        },
      ]
    );
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

  function removerComplemento(
    indice
  ) {
    setComplementos(
      (listaAtual) =>
        listaAtual.filter(
          (_, index) =>
            index !== indice
        )
    );
  }

  function voltar() {
    router.push(
      `/restaurantes/cardapio/produtos/${idProduto}/editar`
    );
  }

  function validarFormulario() {
    if (!nome.trim()) {
      return "Informe o nome dos complementos.";
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
        "O mínimo de seleções não pode " +
        "ser maior que o máximo."
      );
    }

    if (
      obrigatorio &&
      minimo < 1
    ) {
      return (
        "Complementos obrigatórios devem " +
        "exigir pelo menos uma seleção."
      );
    }

    if (
      complementos.length === 0
    ) {
      return (
        "Adicione pelo menos uma opção."
      );
    }

    for (
      let indice = 0;
      indice < complementos.length;
      indice++
    ) {
      const complemento =
        complementos[indice];

      if (
        !complemento.nome.trim()
      ) {
        return (
          `Informe o nome da opção ` +
          `${indice + 1}.`
        );
      }

      if (
        complemento.preco_adicional !==
          "" &&
        Number(
          complemento.preco_adicional
        ) < 0
      ) {
        return (
          `Informe um preço válido ` +
          `para a opção ${indice + 1}.`
        );
      }

      if (
        complemento.estoque !== "" &&
        Number(
          complemento.estoque
        ) < 0
      ) {
        return (
          `Informe um estoque válido ` +
          `para a opção ${indice + 1}.`
        );
      }
    }

    /*
     * Não faz sentido permitir que
     * o cliente escolha mais opções
     * do que existem cadastradas.
     */
    if (
      maximo >
      complementos.length
    ) {
      return (
        "O máximo de seleções não pode " +
        "ser maior que a quantidade " +
        "de opções cadastradas."
      );
    }

    return null;
  }

  async function salvarComplementos(
    event
  ) {
    event.preventDefault();

    const erroValidacao =
      validarFormulario();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      /*
       * 1 - Cria o grupo e já
       * associa ao produto.
       */

      const responseGrupo =
        await fetch(
          `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              nome: nome.trim(),

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

              ordem: 0,
            }),
          }
        );

      const grupoCriado =
        await responseGrupo.json();

      if (!responseGrupo.ok) {
        throw new Error(
          grupoCriado.detail ||
            "Não foi possível criar os complementos."
        );
      }

      /*
       * 2 - Cadastra cada opção.
       */

      for (
        let indice = 0;
        indice <
        complementos.length;
        indice++
      ) {
        const complemento =
          complementos[indice];

        const response =
          await fetch(
            `${API_URL}/restaurantes/${restauranteId}/produtos/${idProduto}/grupos-complementos/${grupoCriado.id_grupo}/complementos/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                nome:
                  complemento.nome.trim(),

                descricao:
                  complemento.descricao
                    .trim() ||
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
              }),
            }
          );

        const dados =
          await response.json();

        if (!response.ok) {
          throw new Error(
            dados.detail ||
              `Não foi possível cadastrar a opção "${complemento.nome}".`
          );
        }
      }

      voltar();
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível criar os complementos."
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

            Voltar para editar produto
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Criar complementos
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {produto
                ? `Configure as opções disponíveis para ${produto.nome}.`
                : "Configure as opções disponíveis para o produto."}
            </p>
          </div>

          {erro && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <form
            onSubmit={
              salvarComplementos
            }
            className="space-y-6"
          >
            {/* INFORMAÇÕES */}

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
                      Defina como o cliente
                      poderá escolher as opções.
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
                    type="text"
                    value={nome}
                    onChange={(event) =>
                      setNome(
                        event.target.value
                      )
                    }
                    maxLength={120}
                    placeholder="Ex.: Escolha seus adicionais"
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

                  <p className="mt-1.5 text-xs text-gray-500">
                    Esse título será exibido
                    para o cliente no produto.
                  </p>
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
                    placeholder="Ex.: Escolha até 3 opções"
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

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      Escolha obrigatória
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      O cliente deverá escolher
                      pelo menos uma opção antes
                      de adicionar o produto.
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
                      className="w-full rounded-lg text-sm
                      text-gray-900 border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                      className="w-full rounded-lg text-sm
                      text-gray-900 border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                    Cadastre as opções que
                    estarão disponíveis para
                    o cliente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    adicionarComplemento
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-lg
                    border
                    border-red-200
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-red-600
                    hover:bg-red-50
                  "
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
                      key={indice}
                      className="rounded-xl border border-gray-200 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          Opção{" "}
                          {indice + 1}
                        </p>

                        {complementos.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removerComplemento(
                                indice
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2
                              size={16}
                            />

                            Remover
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Nome
                          </label>

                          <input
                            type="text"
                            value={
                              complemento.nome
                            }
                            onChange={(
                              event
                            ) =>
                              alterarComplemento(
                                indice,
                                "nome",
                                event.target
                                  .value
                              )
                            }
                            maxLength={
                              120
                            }
                            placeholder="Ex.: Bacon extra"
                            className="w-full rounded-lg  text-sm
                      text-gray-900 border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Preço adicional
                          </label>

                          <div className="flex">
                            <span className="flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                              R$
                            </span>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                complemento
                                  .preco_adicional
                              }
                              onChange={(
                                event
                              ) =>
                                alterarComplemento(
                                  indice,
                                  "preco_adicional",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="0,00"
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
                            type="text"
                            value={
                              complemento
                                .descricao
                            }
                            onChange={(
                              event
                            ) =>
                              alterarComplemento(
                                indice,
                                "descricao",
                                event
                                  .target
                                  .value
                              )
                            }
                            maxLength={
                              255
                            }
                            placeholder="Opcional"
                            className="w-full text-sm
                      text-gray-900 rounded-lg border  border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                              complemento
                                .estoque
                            }
                            onChange={(
                              event
                            ) =>
                              alterarComplemento(
                                indice,
                                "estoque",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Ilimitado"
                            className="w-full text-sm
                      text-gray-900 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-dashed
                    border-gray-300
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-gray-600
                    transition
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-600
                  "
                >
                  <Plus size={17} />

                  Adicionar outra opção
                </button>
              </div>
            </section>

            {/* AÇÕES */}

            <div className="flex justify-end gap-3 pb-8">
              <button
                type="button"
                onClick={voltar}
                disabled={salvando}
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
                  disabled:opacity-50
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvando}
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
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Save size={18} />

                {salvando
                  ? "Criando..."
                  : "Criar complementos"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}