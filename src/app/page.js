"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  Store,
  Truck,
} from "lucide-react";

import Header from "./components/Header";
import RestauranteCard from "./components/RestauranteCard";
import LinhaCategoria from "./components/LinhaCategoria";

function normalizarTexto(valor) {
  return String(valor ?? "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const API_URL = "http://127.0.0.1:8000";

function agruparPorCategoria(lista, categoriaSelecionada = "") {
  const grupos = Object.create(null);

  lista.forEach((restaurante) => {
    const categorias = categoriaSelecionada
      ? [categoriaSelecionada]
      : [...new Set(restaurante.categorias || [])];

    categorias.forEach((categoria) => {
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }

      grupos[categoria].push(restaurante);
    });
  });

  return grupos;
}

export default function Home() {
  const [termoBusca, setTermoBusca] = useState("");
  const [tentativaBusca, setTentativaBusca] = useState(0);
  const [resultadoBusca, setResultadoBusca] = useState(null);
  const termoNormalizado = normalizarTexto(termoBusca);
  function buscar(texto) {
    setTermoBusca(texto.trim());
    setTentativaBusca((valor) => valor + 1);
  }
  const [categorias, setCategorias] = useState([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [erroCategorias, setErroCategorias] = useState("");
  const [restaurantes, setRestaurantes] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [
    possuiEnderecoSelecionado,
    setPossuiEnderecoSelecionado,
  ] = useState(false);

  

  const carregarRestaurantes = useCallback(
    async (enderecoId = null) => {
      try {
        setCarregando(true);
        setErro("");

        let url = `${API_URL}/restaurantes/disponiveis`;

        if (enderecoId) {
          url += `?endereco_id=${enderecoId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar os restaurantes."
          );
        }

        const dados = await response.json();

        setRestaurantes(dados);
      } catch (error) {
        console.error(
          "Erro ao carregar restaurantes:",
          error
        );

        setErro(
          "Não foi possível carregar os restaurantes."
        );
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  useEffect(() => {
  const usuarioSalvo =
    localStorage.getItem("usuarioLogado");

  const enderecoSelecionadoId =
    localStorage.getItem("enderecoSelecionadoId");

  if (usuarioSalvo && enderecoSelecionadoId) {
    setPossuiEnderecoSelecionado(true);

    carregarRestaurantes(
      enderecoSelecionadoId
    );
  } else {
    setPossuiEnderecoSelecionado(false);

    carregarRestaurantes();
  }

  function enderecoAlterado(event) {
    setPossuiEnderecoSelecionado(true);

    carregarRestaurantes(
      event.detail.id_endereco
    );
  }

  window.addEventListener(
    "enderecoAlterado",
    enderecoAlterado
  );

  return () => {
    window.removeEventListener(
      "enderecoAlterado",
      enderecoAlterado
    );
  };
}, [carregarRestaurantes]);

  useEffect(() => {
    if (!termoNormalizado || carregando || erro) return;
    const controller = new AbortController();

    async function pesquisar() {
      try {
        const ids = new Set();
        const consultar = [];
        restaurantes.forEach((restaurante) => {
          if (normalizarTexto(restaurante.nome_fantasia).includes(termoNormalizado)) {
            ids.add(restaurante.id_restaurante);
          } else {
            consultar.push(restaurante);
          }
        });

        for (let inicio = 0; inicio < consultar.length; inicio += 4) {
          if (controller.signal.aborted) return;
          await Promise.all(consultar.slice(inicio, inicio + 4).map(async (restaurante) => {
            const response = await fetch(
              `${API_URL}/restaurantes/${restaurante.id_restaurante}/produtos/`,
              { signal: controller.signal }
            );
            if (!response.ok) throw new Error("Falha ao consultar cardápio.");
            const produtos = await response.json();
            if (!Array.isArray(produtos)) throw new Error("Cardápio inválido.");
            if (produtos.some((produto) =>
              produto.ativo === true &&
              produto.disponivel === true &&
              normalizarTexto(produto.nome).includes(termoNormalizado)
            )) ids.add(restaurante.id_restaurante);
          }));
        }
        if (!controller.signal.aborted) {
          setResultadoBusca({
            termo: termoNormalizado, origem: restaurantes,
            tentativa: tentativaBusca, ids, erro: "",
          });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        controller.abort();
        console.error("Erro na busca:", error);
        setResultadoBusca({
          termo: termoNormalizado, origem: restaurantes,
          tentativa: tentativaBusca, ids: new Set(),
          erro: "Não foi possível consultar todos os cardápios. Tente novamente.",
        });
      }
    }
    pesquisar();
    return () => controller.abort();
  }, [termoNormalizado, restaurantes, carregando, erro, tentativaBusca]);

  const resultadoAtual =
    resultadoBusca?.termo === termoNormalizado &&
    resultadoBusca?.origem === restaurantes &&
    resultadoBusca?.tentativa === tentativaBusca;
  const buscando = Boolean(termoNormalizado) && !resultadoAtual;
  const erroBusca = termoNormalizado && resultadoAtual ? resultadoBusca.erro : "";
  const podeExibir = !carregando && !erro && !buscando && !erroBusca;

  const restaurantesFiltrados = restaurantes.filter((restaurante) => {
    const correspondeCategoria = !categoriaSelecionada ||
      restaurante.categorias?.includes(categoriaSelecionada);
    const correspondeBusca = !termoNormalizado ||
      (resultadoAtual && resultadoBusca.ids.has(restaurante.id_restaurante));
    return correspondeCategoria && correspondeBusca;
  });
  const restaurantesQueEntregam = possuiEnderecoSelecionado
    ? restaurantesFiltrados.filter(
        (restaurante) => restaurante.entrega_disponivel === true
      )
    : [];

  const outrosRestaurantes = possuiEnderecoSelecionado
    ? restaurantesFiltrados.filter(
        (restaurante) => restaurante.entrega_disponivel !== true
      )
    : restaurantesFiltrados;

  const entregamPorCategoria = agruparPorCategoria(
    restaurantesQueEntregam,
    categoriaSelecionada
  );


const outrosPorCategoria =
  agruparPorCategoria(outrosRestaurantes, categoriaSelecionada);

  async function carregarCategorias() {
  if (carregandoCategorias) return;

  setCarregandoCategorias(true);
  setErroCategorias("");

  try {
    const response = await fetch(`${API_URL}/categorias/`);

    if (!response.ok) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    const dados = await response.json();

    const nomes = [
      ...new Set(dados.map((categoria) => categoria.nome)),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    setCategorias(nomes);
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
    setErroCategorias("Não foi possível carregar as categorias.");
  } finally {
    setCarregandoCategorias(false);
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onBuscar={buscar}
        categorias={categorias}
        categoriaSelecionada={categoriaSelecionada}
        onSelecionarCategoria={setCategoriaSelecionada}
        onAbrirCategorias={carregarCategorias}
        carregandoCategorias={carregandoCategorias}
        erroCategorias={erroCategorias}
      />

      <main>
        {/* APRESENTAÇÃO */}
        <section className="mx-auto max-w-[1400px] px-6 pt-10">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Encontre seu restaurante favorito
          </h1>

          <p className="mt-2 text-gray-500">
            Peça sua comida favorita onde estiver.
          </p>
        </section>

        {/* RESTAURANTES */}
        <section className="mx-auto max-w-[1400px] px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Restaurantes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Explore os restaurantes disponíveis no iComida.
              </p>
            </div>
          </div>

          {/* CARREGANDO */}
          {carregando && (
            <div className="py-16 text-center text-gray-500">
              Carregando restaurantes...
            </div>
          )}

          {/* ERRO */}
          {!carregando && erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {erro}
            </div>
          )}

          {!carregando && !erro && buscando && (
            <p role="status" className="py-16 text-center text-gray-500">
              Buscando restaurantes e pratos...
            </p>
          )}
          {!carregando && !erro && erroBusca && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              <p>{erroBusca}</p>
              <button type="button" onClick={() => buscar(termoBusca)}
                className="mt-3 font-semibold underline">
                Tentar novamente
              </button>
            </div>
          )}
          {termoNormalizado && (
            <p className="my-4 text-sm text-gray-600">
              Resultados para “{termoBusca}”
              {categoriaSelecionada && ` · Categoria: ${categoriaSelecionada}`}
            </p>
          )}
          {podeExibir && restaurantesFiltrados.length === 0 && (
            <div role="status" className="rounded-2xl border border-gray-200 bg-white px-4 py-16 text-center">
              <Store size={36} className="mx-auto text-gray-400" />
              <p className="mt-3 font-medium text-gray-700">
                {termoNormalizado
                  ? `Nenhum restaurante encontrado para “${termoBusca}”.`
                  : categoriaSelecionada
                    ? `Nenhum restaurante na categoria “${categoriaSelecionada}”.`
                    : "Nenhum restaurante disponível."}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {termoNormalizado || categoriaSelecionada
                  ? "Tente outra busca, limpe o campo ou selecione Todas as categorias."
                  : "Novos restaurantes aparecerão aqui."}
              </p>
            </div>
          )}
          {podeExibir && restaurantesFiltrados.length > 0 && (
            <div className="space-y-14">
              {possuiEnderecoSelecionado && restaurantesQueEntregam.length > 0 && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Entregam no seu endereço
                  </h2>
                  <div className="space-y-10">
                    {Object.entries(entregamPorCategoria).map(([categoria, lista]) => (
                      <LinhaCategoria key={categoria} categoria={categoria} restaurantes={lista} />
                    ))}
                  </div>
                </div>
              )}
              {outrosRestaurantes.length > 0 && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    {possuiEnderecoSelecionado ? "Outros restaurantes" : "Restaurantes"}
                  </h2>
                  <div className="space-y-10">
                    {Object.entries(outrosPorCategoria).map(([categoria, lista]) => (
                      <LinhaCategoria key={categoria} categoria={categoria} restaurantes={lista} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
