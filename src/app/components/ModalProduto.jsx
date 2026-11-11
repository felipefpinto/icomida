"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Utensils,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function ModalProduto({
  produto,
  idRestaurante,
  produtosRestaurante,
  onClose,
  onSelecionarProduto,
}) {
  const [grupos, setGrupos] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);

  const [selecionados, setSelecionados] = useState({});
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [confirmarTroca, setConfirmarTroca] = useState(false);
  const [dadosPendentes, setDadosPendentes] = useState(null);

  useEffect(() => {
    if (!produto) return;

    async function carregarDetalhes() {
      try {
        setCarregando(true);
        setErro("");
        setSelecionados({});
        setQuantidade(1);
        setObservacao("");

        /*
         * GRUPOS E SUGESTÕES PODEM SER
         * CARREGADOS AO MESMO TEMPO
         */
        const [respostaGrupos, respostaSugestoes] =
          await Promise.all([
            fetch(
              `${API_URL}/restaurantes/${idRestaurante}/produtos/${produto.id_produto}/grupos-complementos/`
            ),

            fetch(
              `${API_URL}/restaurantes/${idRestaurante}/produtos/${produto.id_produto}/sugestoes/`
            ),
          ]);

        const dadosGrupos = respostaGrupos.ok
          ? await respostaGrupos.json()
          : [];

        const dadosSugestoes = respostaSugestoes.ok
          ? await respostaSugestoes.json()
          : [];

        /*
         * PARA CADA GRUPO, BUSCA OS COMPLEMENTOS
         */
        const gruposComComplementos =
          await Promise.all(
            dadosGrupos.map(async (grupo) => {
              const respostaComplementos =
                await fetch(
                  `${API_URL}/restaurantes/${idRestaurante}/produtos/${produto.id_produto}/grupos-complementos/${grupo.id_grupo}/complementos/`
                );

              const complementos =
                respostaComplementos.ok
                  ? await respostaComplementos.json()
                  : [];

              return {
                ...grupo,
                complementos,
              };
            })
          );

        setGrupos(gruposComComplementos);
        setSugestoes(dadosSugestoes);
      } catch (error) {
        console.error(error);

        setErro(
          "Não foi possível carregar os detalhes do produto."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDetalhes();
  }, [produto, idRestaurante]);

  /*
   * IMPEDE SCROLL DA PÁGINA ATRÁS DO MODAL
   */
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /*
   * FECHAR COM ESC
   */
  useEffect(() => {
    function fecharComEsc(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, [onClose]);

  /*
   * COMPLEMENTOS SELECIONADOS
   */
  function alterarComplemento(
    grupo,
    complemento
  ) {
    const idGrupo = grupo.id_grupo;

    const atuais =
      selecionados[idGrupo] || [];

    const jaSelecionado = atuais.some(
      (item) =>
        item.id_complemento ===
        complemento.id_complemento
    );

    if (jaSelecionado) {
      setSelecionados((anterior) => ({
        ...anterior,

        [idGrupo]: atuais.filter(
          (item) =>
            item.id_complemento !==
            complemento.id_complemento
        ),
      }));

      return;
    }

    /*
     * RESPEITA O MÁXIMO DO GRUPO
     */
    if (
      grupo.maximo != null &&
      atuais.length >= grupo.maximo
    ) {
      return;
    }

    setSelecionados((anterior) => ({
      ...anterior,

      [idGrupo]: [
        ...atuais,
        complemento,
      ],
    }));
  }

  /*
   * TOTAL DOS COMPLEMENTOS
   */
  const totalComplementos = useMemo(() => {
    return Object.values(selecionados)
      .flat()
      .reduce(
        (total, complemento) =>
          total +
          Number(
            complemento.preco_adicional ??
              complemento.preco ??
              0
          ),
        0
      );
  }, [selecionados]);

  const precoBase = Number(
    produto.preco_base ?? 0
  );

  const total =
    (precoBase + totalComplementos) *
    quantidade;

  /*
   * TRANSFORMA AS SUGESTÕES EM PRODUTOS
   */
  const produtosSugeridos = useMemo(() => {
    return sugestoes
      .map((sugestao) => {
        const idSugerido =
          sugestao.id_produto_sugerido ??
          sugestao.produto_sugerido_id;

        return produtosRestaurante.find(
          (item) =>
            item.id_produto === idSugerido
        );
      })
      .filter(Boolean);
  }, [
    sugestoes,
    produtosRestaurante,
  ]);

  async function adicionarSacola() {
  try {
    setErro("");

    // 1. Verifica usuário logado
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      setErro("Você precisa estar logado para adicionar itens à sacola.");
      return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    if (!usuario.id_usuario) {
      setErro("Não foi possível identificar o usuário logado.");
      return;
    }

    // 2. Monta os complementos selecionados
    const complementosSelecionados = Object.values(selecionados)
      .flat()
      .map((complemento) => ({
        id_complemento: complemento.id_complemento,
        quantidade: 1,
      }));

    // 3. Dados enviados para o backend
    const dados = {
      id_restaurante: Number(idRestaurante),
      id_produto: produto.id_produto,
      quantidade,
      observacao: observacao.trim() || null,
      complementos: complementosSelecionados,
    };

    const response = await fetch(
      `${API_URL}/usuarios/${usuario.id_usuario}/carrinho/itens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      }
    );

    const data = await response.json();

    // 4. Carrinho de outro restaurante
    if (
      response.status === 409 &&
      data?.detail?.codigo === "CARRINHO_OUTRO_RESTAURANTE"
    ) {
      setDadosPendentes({
        idUsuario: usuario.id_usuario,
        dados,
      });

      setConfirmarTroca(true);
      return;
    }
    // 5. Outros erros
    if (!response.ok) {
      setErro(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível adicionar o item à sacola."
      );
      return;
    }

    // 6. Sucesso
    console.log("Carrinho atualizado:", data);

    window.dispatchEvent(
      new CustomEvent("carrinhoAlterado")
    );

    onClose();
  } catch (error) {
    console.error("Erro ao adicionar item:", error);

    setErro(
      "Não foi possível adicionar o item à sacola. Tente novamente."
    );
  }
}

async function confirmarSubstituicaoCarrinho() {
  if (!dadosPendentes) return;

  try {
    setErro("");

    const response = await fetch(
      `${API_URL}/usuarios/${dadosPendentes.idUsuario}/carrinho/substituir`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosPendentes.dados),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setErro(
        typeof data?.detail === "string"
          ? data.detail
          : "Não foi possível substituir a sacola."
      );

      setConfirmarTroca(false);
      return;
    }

    console.log("Novo carrinho:", data);
    window.dispatchEvent(
    new CustomEvent("carrinhoAlterado")
);

    setConfirmarTroca(false);
    setDadosPendentes(null);

    onClose();
  } catch (error) {
    console.error(
      "Erro ao substituir carrinho:",
      error
    );

    setErro(
      "Não foi possível substituir a sacola. Tente novamente."
    );

    setConfirmarTroca(false);
  }
}

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* FECHAR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* CONTEÚDO COM SCROLL */}
        <div className="overflow-y-auto">

          {/* IMAGEM */}
          <div className="h-64 bg-gray-100">
            {produto.imagem_url ? (
              <img
                src={`${API_URL}${produto.imagem_url}`}
                alt={produto.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Utensils
                  size={52}
                  className="text-gray-300"
                />
              </div>
            )}
          </div>

          {/* PRODUTO */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {produto.nome}
            </h2>

            {produto.descricao && (
              <p className="mt-2 leading-6 text-gray-500">
                {produto.descricao}
              </p>
            )}

            <p className="mt-4 text-lg font-semibold text-gray-900">
              R${" "}
              {precoBase
                .toFixed(2)
                .replace(".", ",")}
            </p>

            {carregando && (
              <div className="mt-8 animate-pulse space-y-3">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-12 rounded bg-gray-100" />
                <div className="h-12 rounded bg-gray-100" />
              </div>
            )}

            {erro && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {erro}
              </div>
            )}

            {/* GRUPOS */}
            {!carregando &&
              grupos.map((grupo) => {
                const quantidadeSelecionada =
                  (
                    selecionados[
                      grupo.id_grupo
                    ] || []
                  ).length;

                return (
                  <section
                    key={grupo.id_grupo}
                    className="mt-8 border-t border-gray-100 pt-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {grupo.nome}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {grupo.maximo
                            ? `Escolha até ${grupo.maximo}`
                            : "Escolha suas opções"}
                        </p>
                      </div>

                      {grupo.obrigatorio && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Obrigatório
                        </span>
                      )}
                    </div>

                    <div className="mt-4 divide-y divide-gray-100">
                      {grupo.complementos.map(
                        (complemento) => {
                          const marcado =
                            (
                              selecionados[
                                grupo.id_grupo
                              ] || []
                            ).some(
                              (item) =>
                                item.id_complemento ===
                                complemento.id_complemento
                            );

                          const precoAdicional =
                            Number(
                              complemento.preco_adicional ??
                                complemento.preco ??
                                0
                            );

                          return (
                            <label
                              key={
                                complemento.id_complemento
                              }
                              className="flex cursor-pointer items-center justify-between gap-4 py-4"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={marcado}
                                  onChange={() =>
                                    alterarComplemento(
                                      grupo,
                                      complemento
                                    )
                                  }
                                  className="h-5 w-5 accent-red-600"
                                />

                                <span className="text-sm font-medium text-gray-800">
                                  {
                                    complemento.nome
                                  }
                                </span>
                              </div>

                              {precoAdicional >
                                0 && (
                                <span className="whitespace-nowrap text-sm text-gray-500">
                                  + R${" "}
                                  {precoAdicional
                                    .toFixed(2)
                                    .replace(
                                      ".",
                                      ","
                                    )}
                                </span>
                              )}
                            </label>
                          );
                        }
                      )}
                    </div>

                    {grupo.maximo != null && (
                      <p className="mt-2 text-xs text-gray-400">
                        {
                          quantidadeSelecionada
                        }{" "}
                        de {grupo.maximo} selecionado(s)
                      </p>
                    )}
                  </section>
                );
              })}

                            {/* OBSERVAÇÃO */}
              <section className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-900">
                  Alguma observação?
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Exemplo: sem cebola, molho separado...
                </p>

                <textarea
                  value={observacao}
                  onChange={(event) =>
                    setObservacao(event.target.value)
                  }
                  maxLength={250}
                  rows={3}
                  placeholder="Escreva sua observação"
                  className="mt-4 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />

                <div className="mt-1 text-right text-xs text-gray-400">
                  {observacao.length}/250
                </div>
              </section>

            {/* SUGESTÕES */}
            {!carregando &&
              produtosSugeridos.length >
                0 && (
                <section className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-900">
                    Compre também
                  </h3>

                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {produtosSugeridos.map(
                      (sugestao) => (
                        <button
  type="button"
  key={sugestao.id_produto}
  onClick={() => onSelecionarProduto(sugestao)}
  className="w-40 shrink-0 rounded-xl border border-gray-200 p-3 text-left transition hover:border-red-300 hover:shadow-md"
>
                          <div className="h-24 overflow-hidden rounded-lg bg-gray-100">
                            {sugestao.imagem_url ? (
                              <img
                                src={`${API_URL}${sugestao.imagem_url}`}
                                alt={
                                  sugestao.nome
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Utensils
                                  size={22}
                                  className="text-gray-300"
                                />
                              </div>
                            )}
                          </div>

                          <p className="mt-2 truncate text-sm font-medium text-gray-900">
                            {sugestao.nome}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            R${" "}
                            {Number(
                              sugestao.preco_base ??
                                0
                            )
                              .toFixed(2)
                              .replace(
                                ".",
                                ","
                              )}
                          </p>
                        </button>
                      )
                    )}
                  </div>
                </section>
              )}
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="border-t border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-4">

            {/* QUANTIDADE */}
            <div className="flex items-center rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() =>
                  setQuantidade((atual) =>
                    Math.max(
                      1,
                      atual - 1
                    )
                  )
                }
                className="flex h-12 w-11 items-center justify-center text-gray-600 transition hover:bg-gray-50"
              >
                <Minus size={18} />
              </button>

              <span className="w-8 text-center font-semibold">
                {quantidade}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantidade(
                    (atual) =>
                      atual + 1
                  )
                }
                className="flex h-12 w-11 items-center justify-center text-gray-600 transition hover:bg-gray-50"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* ADICIONAR */}
            <button
              type="button"
              onClick={adicionarSacola}
              className="flex h-12 flex-1 items-center justify-between rounded-xl bg-red-600 px-5 font-semibold text-white transition hover:bg-red-700"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={19} />
                Adicionar
              </span>

              <span>
                R${" "}
                {total
                  .toFixed(2)
                  .replace(".", ",")}
              </span>
            </button>
          </div>
        </div>
      </div>
    {confirmarTroca && (
  <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <ShoppingBag
          size={22}
          className="text-red-600"
        />
      </div>

      <h3 className="mt-5 text-xl font-bold text-gray-900">
        Você já tem itens na sacola
      </h3>

      <p className="mt-2 leading-6 text-gray-500">
        Sua sacola possui itens de outro restaurante.
        Para adicionar este produto, os itens atuais
        serão removidos.
      </p>

      <p className="mt-3 text-sm font-medium text-gray-700">
        Deseja esvaziar a sacola e adicionar este item?
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => {
            setConfirmarTroca(false);
            setDadosPendentes(null);
          }}
          className="h-12 flex-1 rounded-xl border border-gray-300 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={confirmarSubstituicaoCarrinho}
          className="h-12 flex-1 rounded-xl bg-red-600 px-4 font-semibold text-white transition hover:bg-red-700"
        >
          Esvaziar e adicionar
        </button>
      </div>
    </div>
  </div>
)}  
    </div>
  );
}